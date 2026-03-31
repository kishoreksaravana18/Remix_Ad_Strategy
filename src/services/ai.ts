import { OfferDetails, StrategyReport, CampaignType } from "../types";

/**
 * Service to handle AI interactions via backend proxy.
 */

// Helper function to retry API calls with exponential backoff
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt < maxRetries) {
        attempt++;
        const delay = (Math.pow(2, attempt) * 1000) + (Math.random() * 1000);
        console.warn(`[API Error] Retrying in ${Math.round(delay/1000)}s... (Attempt ${attempt} of ${maxRetries})`);
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
7. Page speed & technical heuristics (perceived performance bottlenecks) - RETURN AS A DESCRIPTIVE STRING.

Return the output as a valid JSON object with the following keys:
coreOffer, valueProposition, targetAudienceSignals, offerCategory, funnelType, uniqueMechanism, pageSpeedHeuristics.
  `;

  return withRetry(async () => {
    console.log(`[Client] Fetching /api/extract-offer for: ${url}`);
    const response = await fetch('/api/extract-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, prompt })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Client Error] Status: ${response.status}`, errorData);
      throw new Error(errorData.error || `Server error (${response.status})`);
    }

    return await response.json();
  });
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
   - Identify 3 ACTUAL competitors.
   - For each competitor, identify their REAL positioning and the gap we can exploit.

2. PHASE 3: STRATEGY ENGINE
   - All strategies (audiences, keywords, copy) MUST be directly derived from the 'STRICT GROUNDING DATA' above.
   - Audiences: Be specific to the target audience signals identified.
   - Keywords: Focus on high-intent terms.
   - Ad Copy: Infuse the requested tone (${adCopyAngle}).

Return the output as a valid JSON object matching this EXACT structure:
{
  "kpis": {
    "competitorsCount": number,
    "keywordsCount": number,
    "segmentsCount": number,
    "copyVariantsCount": number
  },
  "offerAnalysis": {
    "valueProp": "string",
    "gaps": ["string"],
    "audienceTags": ["string"]
  },
  "competitors": [
    { "name": "string", "url": "string", "strength": number (1-100), "exploitableGap": "string" }
  ],
  "audiences": [
    { "name": "string", "type": "string", "bidModifier": "string", "funnelStage": "string", "rationale": "string" }
  ],
  "keywords": [
    { "clusterName": "string", "exact": ["string"], "phrase": ["string"], "negative": ["string"] }
  ],
  "adCopy": [
    { "angle": "string", "headlines": ["string"], "descriptions": ["string"] }
  ],
  "strategy": {
    "timeline": [{ "week": number, "action": "string" }],
    "deviceBids": { "mobile": number, "desktop": number, "tablet": number },
    "geoPriority": "string",
    "losersVsEdge": { "losers": "string", "edge": "string" }
  }
}
  `;

  return withRetry(async () => {
    console.log(`[Client] Fetching /api/generate-strategy`);
    const response = await fetch('/api/generate-strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Client Error] Status: ${response.status}`, errorData);
      throw new Error(errorData.error || `Server error (${response.status})`);
    }

    return await response.json();
  });
}
