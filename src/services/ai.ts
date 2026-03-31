/// <reference types="vite/client" />
import OpenAI from "openai";
import { OfferDetails, StrategyReport, CampaignType } from "../types";

// Using environment variable for API key (supports Netlify and AI Studio preview)
const getApiKey = () => import.meta.env.VITE_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY;

let aiInstance: OpenAI | null = null;

function getAiClient(): OpenAI {
  if (!aiInstance) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("An NVIDIA API Key must be set. Please set VITE_NVIDIA_API_KEY in your environment variables.");
    }
    aiInstance = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
      dangerouslyAllowBrowser: true
    });
  }
  return aiInstance;
}

// Helper function to retry API calls with exponential backoff
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      // Add a timeout to the operation call (60 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 60 seconds")), 60000)
      );
      return await Promise.race([operation(), timeoutPromise]) as T;
    } catch (error: any) {
      const isRateLimit = error.status === 429 || 
                          error.message?.includes('quota') || 
                          error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimit && attempt < maxRetries) {
        attempt++;
        // Exponential backoff: 2s, 4s, 8s + random jitter to prevent thundering herd
        const delay = (Math.pow(2, attempt) * 1000) + (Math.random() * 1000);
        console.warn(`[API Rate Limit] Retrying in ${Math.round(delay/1000)}s... (Attempt ${attempt} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

export async function extractOffer(url: string): Promise<OfferDetails> {
  console.log(`[Phase 1] Analyzing offer DNA for: ${url}...`);
  const prompt = `
Analyze the following URL: ${url}

You are a highly accurate direct response marketing analyst. 
Based on your knowledge or the context of this URL, extract the following details:

1. Core offer (what is being sold, price point if visible)
2. Value proposition (primary hook/headline claim)
3. Target audience signals (language, pain points, demographics implied)
4. Offer category (SaaS / ecomm / lead gen / local service / info product)
5. Funnel type (cold traffic / warm retargeting / branded)
6. Unique mechanism (what makes this offer different)
7. Page speed & technical heuristics (perceived performance bottlenecks)

Return the output as a valid JSON object with the following keys:
coreOffer, valueProposition, targetAudienceSignals, offerCategory, funnelType, uniqueMechanism, pageSpeedHeuristics.
  `;

  try {
    const response = await withRetry(() => getAiClient().chat.completions.create({
      model: "meta/llama-3.1-405b-instruct",
      messages: [
        { role: "system", content: "You are a highly accurate direct response marketing analyst. You prioritize factual accuracy above all else. Return ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    }));

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to extract offer details.");
    }

    console.log(`[Phase 1] Successfully extracted offer DNA.`);
    return JSON.parse(content) as OfferDetails;
  } catch (error: any) {
    console.error(`[Phase 1 Error] ${error.message}`);
    throw error;
  }
}

export async function generateStrategyReport(url: string, offerDetails: OfferDetails, campaignType: CampaignType, adCopyAngle: string = 'Standard'): Promise<StrategyReport> {
  console.log(`[Phase 2-4] Generating strategy report for: ${url}...`);
  const prompt = `
Build a comprehensive Competitive Intelligence & Google Ads Strategy Report for: ${url}
Campaign Type: ${campaignType}
Ad Copy Angle/Tone: ${adCopyAngle}

STRICT GROUNDING DATA (Extracted from the landing page):
${JSON.stringify(offerDetails, null, 2)}

INSTRUCTIONS:
1. PHASE 2: COMPETITIVE INTELLIGENCE
   - Identify ACTUAL competitors running ads for similar keywords.
   - For each competitor, identify their REAL positioning and the gap we can exploit.

2. PHASE 3: STRATEGY ENGINE
   - All strategies (audiences, keywords, copy) MUST be directly derived from the 'STRICT GROUNDING DATA' above.
   - Audiences: Be specific to the target audience signals identified.
   - Keywords: Focus on high-intent terms related to the core offer and unique mechanism.
   - Ad Copy: Infuse the requested tone (${adCopyAngle}) while strictly adhering to the value proposition and unique mechanism.

Return the output EXACTLY matching the requested JSON structure.
  `;

  try {
    const response = await withRetry(() => getAiClient().chat.completions.create({
      model: "meta/llama-3.1-405b-instruct",
      messages: [
        { role: "system", content: "You are a world-class Google Ads strategist. You use provided grounding data as the absolute source of truth. Return ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    }));

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate strategy report.");
    }

    console.log(`[Phase 2-4] Successfully generated strategy report.`);
    return JSON.parse(content) as StrategyReport;
  } catch (error: any) {
    console.error(`[Phase 2-4 Error] ${error.message}`);
    throw error;
  }
}
