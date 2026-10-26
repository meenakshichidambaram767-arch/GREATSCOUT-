export interface Source {
  id: string;
  code: string;
  name: string;
  base_url?: string;
  is_active: boolean;
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  source_id: string;
  external_id?: string;
  title: string;
  content: string;
  author?: string;
  url: string;
  upvotes: number;
  comment_count: number;
  is_synthetic: boolean;
  content_hash: string;
  validation_status: string;
  published_at?: string;
  ingested_at: string;
}

export type SignalType = 'pain_point' | 'complaint' | 'feature_request' | 'unmet_need' | 'workflow_problem';

export interface Signal {
  id: string;
  document_id: string;
  cluster_id?: string;
  signal_type: SignalType;
  summary: string;
  raw_quote: string;
  severity: number;
  sentiment_score: number;
  urgency_score: number;
  commercial_intent_score: number;
  competitor_mentioned?: string;
  embedding?: number[];
  created_at: string;
}

export interface SignalCluster {
  id: string;
  category: string;
  label: string;
  description?: string;
  signal_count: number;
  coherence_score: number;
  centroid_embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface OpportunityScoreBreakdown {
  overall_score: number;
  demand_score: number;
  pain_intensity_score: number;
  willingness_to_pay_score: number;
  competitive_vacuum_score: number;
  evidence_strength_score?: number;
  feasibility_score?: number;
  recency_score?: number;
  metadata?: {
    model_version?: string;
    weights?: Record<string, number>;
    metrics_breakdown?: Record<string, {
      score: number;
      type: 'measured' | 'heuristic_estimate';
      description: string;
      weight: string;
    }>;
    explanations?: string[];
  };
}

export interface Opportunity {
  id: string;
  cluster_id: string;
  title: string;
  target_audience: string;
  category: string;
  problem_thesis: string;
  why_current_solutions_fail: string;
  suggested_solution: string;
  confidence_level: 'high' | 'medium' | 'low';
  status: 'active' | 'starred' | 'archived' | 'discovered' | 'validating' | 'interviewing' | 'building' | 'launched' | string;
  scores: OpportunityScoreBreakdown;
  signal_count: number;
  created_at: string;
  updated_at: string;
}


export interface EvidenceSourceInfo {
  platform: string;
  title: string;
  url: string;
  author?: string;
  is_synthetic: boolean;
  published_at?: string;
}

export interface OpportunityEvidenceItem {
  signal_id: string;
  signal_type: SignalType;
  severity: number;
  sentiment_score: number;
  urgency_score: number;
  highlight_quote: string;
  relevance_score: number;
  source: EvidenceSourceInfo;
}

export interface OpportunityDetail extends Opportunity {
  cluster?: {
    id: string;
    label: string;
    category: string;
    coherence_score: number;
    signal_count: number;
  };
  evidence: OpportunityEvidenceItem[];
}

export interface OpportunityListResponse {
  items: Opportunity[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface IngestionJob {
  id: string;
  source_id?: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  documents_processed: number;
  signals_extracted: number;
  opportunities_generated: number;
  error_message?: string;
  logs?: string[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface DashboardStats {
  total_documents: number;
  total_signals: number;
  total_clusters: number;
  total_opportunities: number;
  average_opportunity_score: number;
  sources_breakdown: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  signal_types_breakdown: Array<{
    type: string;
    count: number;
  }>;
  recent_activity: Array<{
    id: string;
    timestamp: string;
    action: string;
    description: string;
  }>;
}

export interface TrendsAnalytics {
  category_distribution: Array<{
    category: string;
    count: number;
    avg_score: number;
  }>;
  sentiment_timeline: Array<{
    date: string;
    negative_signals: number;
    critical_urgency: number;
  }>;
}

export interface SystemHealth {
  status: string;
  app_name: string;
  tagline: string;
  version: string;
  environment: string;
  database: string;
  vector_support: boolean;
  ai_provider: string;
  timestamp: string;
}

export interface TechStackBlueprint {
  frontend: string;
  backend: string;
  database: string;
  infrastructure: string;
  integrations: string[];
  architecture_rationale: string;
}

export interface MVPScopePhase {
  phase: string;
  features: string[];
}

export interface APIEndpointSpec {
  method: string;
  path: string;
  description: string;
  request_sample?: string;
  response_sample?: string;
}

export interface LinearTicket {
  identifier: string;
  title: string;
  priority: string;
  estimate: string;
  label: string;
  description: string;
  acceptance_criteria: string[];
}

export interface OpportunityPRD {
  opportunity_id: string;
  title: string;
  target_audience: string;
  category: string;
  problem_thesis: string;
  suggested_solution: string;
  tech_stack: TechStackBlueprint;
  mvp_phases: MVPScopePhase[];
  edge_cases: string[];
  schema_ddl: string;
  api_endpoints: APIEndpointSpec[];
  linear_tickets: LinearTicket[];
  markdown_content: string;
}

export interface CopilotCitedQuote {
  id?: string;
  author?: string;
  source: string;
  quote: string;
  sentiment?: number;
  opportunity_id?: string;
  opportunity_title?: string;
}

export interface CopilotRelevantOpportunity {
  id: string;
  title: string;
  category: string;
  overall_score: number;
  status: string;
}

export interface CopilotAskRequest {
  query: string;
  opportunity_id?: string;
  api_key?: string;
  provider?: string;
}

export interface CopilotAskResponse {
  answer: string;
  cited_quotes: CopilotCitedQuote[];
  relevant_opportunities: CopilotRelevantOpportunity[];
  suggested_followups: string[];
  provider_used: string;
}

export interface OpportunitySynthesizeResponse {
  opportunity_id: string;
  executive_summary: string;
  strategic_angles: string[];
  target_icp: string;
  pricing_strategy: string;
  validation_experiments: string[];
}

export type PipelineStage = 'discovered' | 'validating' | 'interviewing' | 'building' | 'launched';
