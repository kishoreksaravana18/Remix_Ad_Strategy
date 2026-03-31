/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { OfferDetails, StrategyReport, CampaignType } from "../types";

// Using environment variable for API key (supports Netlify and AI Studio preview)
const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("An API Key must be set when running in a browser. Please set VITE_GEMINI_API_KEY in your environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey });
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
      const isRateLimit = error.message?.includes('429') || 
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
  console.log(`[Phase 1] Extracting offer DNA from: ${url}...`);
  const prompt = `
Analyze the following landing page content for the URL: ${url}

You MUST extract the following details based ONLY on the actual content found on the page. 
DO NOT hallucinate or make up information that is not present.

1. Core offer (what is being sold, price point if visible)
2. Value proposition (primary hook/headline claim)
3. Target audience signals (language, pain points, demographics implied)
4. Offer category (SaaS / ecomm / lead gen / local service / info product)
5. Funnel type (cold traffic / warm retargeting / branded)
6. Unique mechanism (what makes this offer different)
7. Page speed & technical heuristics (analyze the DOM structure for bloat, heavy scripts, image optimization, and perceived performance bottlenecks)

Return the output as structured JSON.
  `;

  try {
    const response = await withRetry(() => getAiClient().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a highly accurate direct response marketing analyst. You prioritize factual accuracy above all else. If you cannot find specific information on a page, state 'Not explicitly mentioned' or provide a logical inference based ONLY on visible cues. NEVER hallucinate fake offers or features.",
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreOffer: { type: Type.STRING, description: "What is being sold, price point if visible" },
            valueProposition: { type: Type.STRING, description: "Primary hook/headline claim" },
            targetAudienceSignals: { type: Type.STRING, description: "Language, pain points, demographics implied" },
            offerCategory: { type: Type.STRING, description: "SaaS / ecomm / lead gen / local service / info product" },
            funnelType: { type: Type.STRING, description: "Cold traffic / warm retargeting / branded" },
            uniqueMechanism: { type: Type.STRING, description: "What makes this offer different" },
            pageSpeedHeuristics: { type: Type.STRING, description: "Technical analysis of page speed, DOM bloat, and performance bottlenecks" },
          },
          required: ["coreOffer", "valueProposition", "targetAudienceSignals", "offerCategory", "funnelType", "uniqueMechanism", "pageSpeedHeuristics"],
        },
      },
    }));

    if (!response.text) {
      throw new Error("Failed to extract offer details.");
    }

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    console.log(`[Phase 1] Successfully extracted offer DNA.`);
    return JSON.parse(jsonStr) as OfferDetails;
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
   - Use Google Search to find ACTUAL competitors running ads for similar keywords.
   - DO NOT make up competitors. If you cannot find specific ones, use major industry players but specify why they are relevant.
   - For each competitor, identify their REAL positioning and the gap we can exploit.

2. PHASE 3: STRATEGY ENGINE
   - All strategies (audiences, keywords, copy) MUST be directly derived from the 'STRICT GROUNDING DATA' above.
   - Audiences: Be specific to the target audience signals identified.
   - Keywords: Focus on high-intent terms related to the core offer and unique mechanism.
   - Ad Copy: Infuse the requested tone (${adCopyAngle}) while strictly adhering to the value proposition and unique mechanism.

Return the output EXACTLY matching the requested JSON schema.
  `;

  try {
    const response = await withRetry(() => getAiClient().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class Google Ads strategist. You never hallucinate. You use provided grounding data as the absolute source of truth. Your competitive intelligence is based on real-world search results. Your strategies are actionable, specific, and data-driven.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kpis: {
              type: Type.OBJECT,
              properties: {
                competitorsCount: { type: Type.INTEGER },
                keywordsCount: { type: Type.INTEGER },
                segmentsCount: { type: Type.INTEGER },
                copyVariantsCount: { type: Type.INTEGER }
              },
              required: ["competitorsCount", "keywordsCount", "segmentsCount", "copyVariantsCount"]
            },
            offerAnalysis: {
              type: Type.OBJECT,
              properties: {
                valueProp: { type: Type.STRING },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                audienceTags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["valueProp", "gaps", "audienceTags"]
            },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  url: { type: Type.STRING, description: "The competitor's website URL" },
                  strength: { type: Type.INTEGER, description: "1 to 100" },
                  exploitableGap: { type: Type.STRING }
                },
                required: ["name", "url", "strength", "exploitableGap"]
              }
            },
            audiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  bidModifier: { type: Type.STRING },
                  funnelStage: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ["name", "type", "bidModifier", "funnelStage", "rationale"]
              }
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clusterName: { type: Type.STRING },
                  exact: { type: Type.ARRAY, items: { type: Type.STRING } },
                  phrase: { type: Type.ARRAY, items: { type: Type.STRING } },
                  negative: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["clusterName", "exact", "phrase", "negative"]
              }
            },
            adCopy: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  angle: { type: Type.STRING },
                  headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                  descriptions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["angle", "headlines", "descriptions"]
              }
            },
            strategy: {
              type: Type.OBJECT,
              properties: {
                timeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      week: { type: Type.INTEGER },
                      action: { type: Type.STRING }
                    },
                    required: ["week", "action"]
                  }
                },
                deviceBids: {
                  type: Type.OBJECT,
                  properties: {
                    mobile: { type: Type.INTEGER },
                    desktop: { type: Type.INTEGER },
                    tablet: { type: Type.INTEGER }
                  },
                  required: ["mobile", "desktop", "tablet"]
                },
                geoPriority: { type: Type.STRING },
                losersVsEdge: {
                  type: Type.OBJECT,
                  properties: {
                    losers: { type: Type.STRING },
                    edge: { type: Type.STRING }
                  },
                  required: ["losers", "edge"]
                }
              },
              required: ["timeline", "deviceBids", "geoPriority", "losersVsEdge"]
            }
          },
          required: ["kpis", "offerAnalysis", "competitors", "audiences", "keywords", "adCopy", "strategy"]
        }
      },
    }));

    if (!response.text) {
      throw new Error("Failed to generate strategy report.");
    }

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    console.log(`[Phase 2-4] Successfully generated strategy report.`);
    return JSON.parse(jsonStr) as StrategyReport;
  } catch (error: any) {
    console.error(`[Phase 2-4 Error] ${error.message}`);
    throw error;
  }
}
