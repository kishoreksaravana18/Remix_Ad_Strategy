export type CampaignType = 'Search' | 'Display' | 'Demand Gen' | 'PMax';
export type AdCopyAngle = 'Standard' | 'Urgency Based' | 'Benefit Driven' | 'Pain Point Agitation' | 'Social Proof';

export interface OfferDetails {
  coreOffer: string;
  valueProposition: string;
  targetAudienceSignals: string;
  offerCategory: string;
  funnelType: string;
  uniqueMechanism: string;
  pageSpeedHeuristics: string;
}

export interface Competitor {
  name: string;
  url: string;
  strength: number;
  exploitableGap: string;
}

export interface Audience {
  name: string;
  type: string;
  bidModifier: string;
  funnelStage: string;
  rationale: string;
}

export interface KeywordCluster {
  clusterName: string;
  exact: string[];
  phrase: string[];
  negative: string[];
}

export interface AdCopySet {
  angle: string;
  headlines: string[];
  descriptions: string[];
}

export interface StrategyReport {
  kpis: {
    competitorsCount: number;
    keywordsCount: number;
    segmentsCount: number;
    copyVariantsCount: number;
  };
  offerAnalysis: {
    valueProp: string;
    gaps: string[];
    audienceTags: string[];
  };
  competitors: Competitor[];
  audiences: Audience[];
  keywords: KeywordCluster[];
  adCopy: AdCopySet[];
  strategy: {
    timeline: Array<{ week: number; action: string }>;
    deviceBids: { mobile: number; desktop: number; tablet: number };
    geoPriority: string;
    losersVsEdge: { losers: string; edge: string };
  };
}
