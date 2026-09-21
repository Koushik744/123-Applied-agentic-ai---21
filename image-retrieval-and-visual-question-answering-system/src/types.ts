export interface UploadedImage {
  id: string;
  filename: string;
  mimeType: string;
  data: string; // Base64 data or data URL
  previewUrl: string;
  fileSize: string;
  width?: number;
  height?: number;
  source: "sample" | "upload";
}

export interface RetrievalResultItem {
  id: string;
  rank: number;
  relevanceScore: number;
  isRelevant: boolean;
  matchReason: string;
  detectedEntities?: string[];
}

export interface RetrievalResponse {
  query: string;
  totalEvaluated: number;
  retrievalMethod: string;
  results: RetrievalResultItem[];
}

export interface VQAResponse {
  question: string;
  answer: string;
  visualEvidence: string;
  confidence: string;
  keyEntities?: string[];
  reasoningStep?: string;
  model: string;
}

export type PipelineStepStatus = "idle" | "running" | "completed" | "failed";

export interface PipelineStep {
  id: number;
  title: string;
  subtitle: string;
  status: PipelineStepStatus;
  detail?: string;
  timestamp?: string;
}

export interface ExperimentSummary {
  query: string;
  retrievedImage: UploadedImage;
  relevanceRank: number;
  relevanceScore: number;
  question: string;
  answer: string;
  visualEvidence?: string;
  confidence?: string;
  retrievalMethod: string;
  timestamp: string;
}
