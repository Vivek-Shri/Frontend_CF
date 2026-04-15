export type CampaignStatus = "draft" | "active" | "paused" | "archived";


export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages?: number;
  totalPages?: number;
}

export interface CampaignRunSummary {
  runId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  exitCode?: number;
  totalLeads: number;
  processedLeads: number;
  duplicatesSkipped: number;
}

export interface CampaignStep {
  id: string;
  aiInstruction: string;
  daySequence: number;
  timeOfDay: string;
  type: "immediate" | "normal";
  enabled: boolean;
}

export interface CampaignRecord {
  id: string;
  name: string;
  status: CampaignStatus;
  aiInstruction: string;
  maxDailySubmissions: number;
  searchForForm: boolean;
  breakFlag: boolean;
  steps: CampaignStep[];
  scheduleDay?: string;
  scheduleTime?: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
  lastRun?: CampaignRunSummary;
}

export interface ContactRecord {
  id: string;
  campaignId: string;
  campaignName?: string;
  companyName: string;
  websiteUrl?: string;
  contactUrl: string;
  domain: string;
  location?: string;
  industry?: string;
  notes?: string;
  isInterested?: boolean;
  replyStatus?: string;
  createdAt: string;
  updatedAt: string;
  /** "pending" | "submitted" | "failed" | "skipped" — set by the outreach run */
  attemptStatus?: "pending" | "submitted" | "failed" | "skipped";
  /** Detailed failure/success reason from the outreach engine */
  attemptDetailStatus?: string;
  captchaPresent?: boolean;
  formPresent?: boolean;
  submittedAt?: string;
}

export interface OutreachRunSnapshot {
  runId: string;
  status: string;
  progress: number;
  totalLeads: number;
  processedLeads: number;
  currentLead: string;
  logs: string[];
  results: Array<{
    campaignId?: string;
    campaignTitle?: string;
    companyName: string;
    websiteUrl?: string;
    contactUrl: string;
    submitted: "Yes" | "No";
    status: "success" | "warning" | "fail";
    captchaStatus: string;
    confirmationMsg: string;
    fieldsFilled?: string;
    fieldsFilledData?: Record<string, string>;
    detectedFormUrl?: string;
    estCostUsd: number;
    strategy?: string;
    discoverMethod?: string;
    inputTokens?: number;
    outputTokens?: number;
    bandwidthKb?: number;
    step_index?: number;
  }>;
  duplicatesSkipped: number;
  activeLeads?: Record<string, string>;
  resumeSkippedLeads?: number;
  socialSkippedLeads?: number;
  resumedFromRunId?: string;
  startedAt: string;
  endedAt?: string;
  error?: string;
}
