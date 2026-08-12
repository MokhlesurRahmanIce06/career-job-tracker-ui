/* =========================================================
   JOB TYPES
   ========================================================= */

export type JobType =
  | "Remote"
  | "Relocate"
  | "Local"
  | "Hybrid"
  | string;

export type JobStatus =
  | "Applied"
  | "HR Screening"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "On Hold"
  | "Selected"
  | string;

export type Priority =
  | "High"
  | "Medium"
  | "Low"
  | string;


/* =========================================================
   DOCUMENTS
   ========================================================= */

export interface DocumentsSubmitted {
  resume?: boolean;
  coverLetter?: boolean;
  portfolio?: boolean;
  certificates?: boolean;
  other?: string[];
}


/* =========================================================
   PREPARATION
   ========================================================= */

export interface Preparation {
  newTopics?: string[];
  knownTopics?: string[];
  cvAlignment?: string[];
}


/* =========================================================
   AI GENERATED QUESTIONS
   ========================================================= */

export interface AIQuestions {
  chatgpt?: string;
  deepseek?: string;
  grok?: string;
  gemini?: string;
  copilot?: string;
  claude?: string;
  consolidated?: string;
}


/* =========================================================
   AI REHEARSAL
   ========================================================= */

export interface AIRehearsal {
  chatgpt?: string;
  deepseek?: string;
  grok?: string;
  gemini?: string;
  copilot?: string;
  claude?: string;
}


/* =========================================================
   VIVA STAGE
   ========================================================= */

export interface VivaStage {
  date?: string;

  /**
   * Overall performance of this viva.
   *
   * Example:
   * 75 = 75%
   */
  performancePercentage?: number;

  rehearsal?: AIRehearsal;

  easilyAnsweredQuestions?: string[];

  partiallyAnsweredQuestions?: string[];

  unknownQuestions?: string[];

  strengths?: string;

  weaknesses?: string;

  improvement?: string;
}


/* =========================================================
   COMPENSATION
   ========================================================= */

export interface Compensation {
  expectedSalary?: string;
  offeredSalary?: string;
}


/* =========================================================
   FOLLOW UP
   ========================================================= */

export interface FollowUp {
  followUpDate?: string;
  followUpStatus?: string;
}


/* =========================================================
   FINAL ASSESSMENT
   ========================================================= */

export interface FinalAssessment {
  result?: string;
  resultDate?: string;
  fullExperience?: string;
  finalRecommendation?: string;
}


/* =========================================================
   CUSTOM FIELD
   ========================================================= */

export interface CustomField {
  id: string;
  name?: string;
  value?: string;
}


/* =========================================================
   JOB APPLICATION
   ========================================================= */

export interface JobApplication {

  /* =======================================================
     BASIC / REQUIRED INFORMATION
     ======================================================= */

  id: string;

  designation: string;

  company: string;

  country: string;

  jobType: JobType;

  applicationDate: string;

  status: JobStatus;


  /* =======================================================
     OPTIONAL JOB INFORMATION
     ======================================================= */

  jd?: string;

  jobSource?: string;

  jobUrl?: string;

  recruiter?: string;

  priority?: Priority;


  /* =======================================================
     OPTIONAL DOCUMENT INFORMATION
     ======================================================= */

  documentsSubmitted?: DocumentsSubmitted;


  /* =======================================================
     OPTIONAL PREPARATION
     ======================================================= */

  preparation?: Preparation;


  /* =======================================================
     OPTIONAL AI GENERATED Q&A
     ======================================================= */

  aiQuestions?: AIQuestions;


  /* =======================================================
     OPTIONAL VIVA STAGES
     ======================================================= */

  viva1?: VivaStage;

  viva2?: VivaStage;

  viva3?: VivaStage;

  viva4?: VivaStage;

  viva5?: VivaStage;


  /* =======================================================
     OPTIONAL COMPENSATION
     ======================================================= */

  compensation?: Compensation;


  /* =======================================================
     OPTIONAL FOLLOW UP
     ======================================================= */

  followUp?: FollowUp;


  /* =======================================================
     OPTIONAL NEXT ACTION
     ======================================================= */

  nextAction?: string;


  /* =======================================================
     OPTIONAL FINAL ASSESSMENT
     ======================================================= */

  final?: FinalAssessment;


  /* =======================================================
     OPTIONAL CUSTOM FIELDS
     ======================================================= */

  customFields?: CustomField[];


  /* =======================================================
     AUDIT INFORMATION
     ======================================================= */

  createdAt: string;

  updatedAt: string;
}


/* =========================================================
   EMPTY AI REHEARSAL
   ========================================================= */

export function createEmptyAIRehearsal(): AIRehearsal {
  return {
    chatgpt: "",
    deepseek: "",
    grok: "",
    gemini: "",
    copilot: "",
    claude: "",
  };
}


/* =========================================================
   EMPTY VIVA STAGE
   ========================================================= */

export function createEmptyVivaStage(): VivaStage {
  return {
    date: "",

    performancePercentage: 0,

    rehearsal: createEmptyAIRehearsal(),

    easilyAnsweredQuestions: [],

    partiallyAnsweredQuestions: [],

    unknownQuestions: [],

    strengths: "",

    weaknesses: "",

    improvement: "",
  };
}


/* =========================================================
   EMPTY JOB
   =========================================================
   
   Only BASIC information is created initially.

   Other information can be added later:
   
   - Documents
   - Preparation
   - AI Questions
   - Viva
   - Compensation
   - Follow Up
   - Final Assessment
   - Custom Fields
   
   ========================================================= */

export function createEmptyJob(
  id: string = ""
): JobApplication {

  const today =
    new Date().toISOString().split("T")[0];

  return {

    /* Basic */

    id,

    designation: "",

    company: "",

    country: "",

    jobType: "Remote",

    applicationDate: today,

    status: "Applied",


    /* Audit */

    createdAt: today,

    updatedAt: today,
  };
}


/* =========================================================
   GET VIVA STAGES
   ========================================================= */

export function getVivaStages(
  job: JobApplication
): VivaStage[] {

  return [
    job.viva1,
    job.viva2,
    job.viva3,
    job.viva4,
    job.viva5,
  ].filter(
    (
      viva
    ): viva is VivaStage =>
      !!viva
  );
}


/* =========================================================
   OVERALL VIVA PERFORMANCE
   =========================================================

   Only Viva stages that actually contain
   performance > 0 are included.

   Example:

   Viva 1 = 70
   Viva 2 = 80
   Viva 3 = undefined

   Result = 75

   ========================================================= */

export function calculateOverallVivaPerformance(
  job: JobApplication
): number {

  const performances =
    getVivaStages(job)

      .map(
        (viva) =>
          Number(
            viva.performancePercentage
          ) || 0
      )

      .filter(
        (percentage) =>
          percentage > 0
      );


  if (
    performances.length === 0
  ) {
    return 0;
  }


  const total =
    performances.reduce(
      (
        sum,
        percentage
      ) =>
        sum + percentage,
      0
    );


  return (
    Math.round(
      (
        total /
        performances.length
      ) * 10
    ) / 10
  );
}