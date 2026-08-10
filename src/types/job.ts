export type JobStatus =
  | "Saved"
  | "Applied"
  | "Shortlisted"
  | "Viva 1"
  | "Viva 2"
  | "Viva 3"
  | "Viva 4"
  | "Viva 5"
  | "Final"
  | "Offer"
  | "Rejected";

export type JobType = "Remote" | "Relocate" | "Local";

export interface VivaRound {
  round: number;
  date?: string;

  easy: string[];
  partial: string[];
  unknown: string[];

  score?: number;

  learning: string[];
  nextPreparation: string[];
}

export interface AIQuestions {
  chatgpt?: string;
  deepseek?: string;
  grok?: string;
  gemini?: string;
  copilot?: string;
  claude?: string;
  consolidated?: string;
}

export interface JobPreparation {
  newTopics: string[];
  knownTopics: string[];
  cvAlignment: string[];
}

export interface DocumentsSubmitted {
  resume: boolean;
  coverLetter: boolean;
  portfolio: boolean;
  certificates: boolean;
  other: string[];
}

export interface Job {
  id: string;

  designation: string;
  company: string;

  country: string;
  jobType: JobType;

  jobSource: string;
  recruiter?: string;

  jd: string;

  applicationDate?: string;
  status: JobStatus;

  documentsSubmitted: DocumentsSubmitted;

  preparation: JobPreparation;

  aiQuestions: AIQuestions;

  vivas: VivaRound[];

  finalResult?: string;

  fullExperience?: string;

  finalRecommendation?: string;

  nextAction?: string;

  createdAt: string;
  updatedAt: string;
}
