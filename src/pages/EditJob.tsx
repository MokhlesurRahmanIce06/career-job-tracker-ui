import { useEffect, useState } from "react";

import type {
  JobApplication,
  JobType,
  JobStatus,
  Priority,
  DocumentsSubmitted,
  AIQuestions,
  AIRehearsal,
  VivaStage,
  Compensation,
  FollowUp,
  FinalAssessment,
  CustomField,
} from "../types/job";

interface EditJobProps {
  job: JobApplication;
  onCancel: () => void;
  onSave: (
    updatedJob: JobApplication
  ) => void | Promise<void>;
}

/* =========================================================
   HELPERS
   ========================================================= */

function createEmptyDocuments(): DocumentsSubmitted {
  return {
    resume: false,
    coverLetter: false,
    portfolio: false,
    certificates: false,
    other: [],
  };
}

function createEmptyAIQuestions(): AIQuestions {
  return {
    chatgpt: "",
    deepseek: "",
    grok: "",
    gemini: "",
    copilot: "",
    claude: "",
    consolidated: "",
  };
}

function createEmptyAIRehearsal(): AIRehearsal {
  return {
    chatgpt: "",
    deepseek: "",
    grok: "",
    gemini: "",
    copilot: "",
    claude: "",
  };
}

function createEmptyViva(): VivaStage {
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

function createEmptyCompensation(): Compensation {
  return {
    expectedSalary: "",
    offeredSalary: "",
  };
}

function createEmptyFollowUp(): FollowUp {
  return {
    followUpDate: "",
    followUpStatus: "",
  };
}

function createEmptyFinal(): FinalAssessment {
  return {
    result: "",
    resultDate: "",
    fullExperience: "",
    finalRecommendation: "",
  };
}

/* =========================================================
   ARRAY HELPERS
   ========================================================= */

function arrayToText(items?: string[]): string {
  return (items || []).join("\n");
}

function textToArray(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* =========================================================
   COMPONENT
   ========================================================= */

function EditJob({
  job,
  onCancel,
  onSave,
}: EditJobProps) {
  /* =======================================================
     BASIC INFORMATION
     ======================================================= */

  const [id, setId] = useState(job.id || "");

  const [designation, setDesignation] =
    useState(job.designation || "");

  const [company, setCompany] =
    useState(job.company || "");

  const [country, setCountry] =
    useState(job.country || "");

  const [jobType, setJobType] =
    useState<JobType>(
      job.jobType || "Remote"
    );

  const [applicationDate, setApplicationDate] =
    useState(job.applicationDate || "");

  const [status, setStatus] =
    useState<JobStatus>(
      job.status || "Applied"
    );

  /* =======================================================
     OPTIONAL JOB INFORMATION
     ======================================================= */

  const [jd, setJd] =
    useState(job.jd || "");

  const [jobSource, setJobSource] =
    useState(job.jobSource || "");

  const [jobUrl, setJobUrl] =
    useState(job.jobUrl || "");

  const [recruiter, setRecruiter] =
    useState(job.recruiter || "");

  const [priority, setPriority] =
    useState<Priority>(
      job.priority || "Medium"
    );

  /* =======================================================
     DOCUMENTS
     ======================================================= */

  const [documents, setDocuments] =
    useState<DocumentsSubmitted>(
      job.documentsSubmitted
        ? {
            resume:
              job.documentsSubmitted.resume ||
              false,

            coverLetter:
              job.documentsSubmitted.coverLetter ||
              false,

            portfolio:
              job.documentsSubmitted.portfolio ||
              false,

            certificates:
              job.documentsSubmitted.certificates ||
              false,

            other:
              job.documentsSubmitted.other ||
              [],
          }
        : createEmptyDocuments()
    );

  const [otherDocumentsText, setOtherDocumentsText] =
    useState(
      arrayToText(
        job.documentsSubmitted?.other
      )
    );

  /* =======================================================
     PREPARATION
     
     IMPORTANT:
     No separate preparation state is required.
     We directly manage the three editable text fields.
     ======================================================= */

  const [newTopicsText, setNewTopicsText] =
    useState(
      arrayToText(
        job.preparation?.newTopics
      )
    );

  const [knownTopicsText, setKnownTopicsText] =
    useState(
      arrayToText(
        job.preparation?.knownTopics
      )
    );

  const [cvAlignmentText, setCvAlignmentText] =
    useState(
      arrayToText(
        job.preparation?.cvAlignment
      )
    );

  /* =======================================================
     AI QUESTIONS
     ======================================================= */

  const [aiQuestions, setAIQuestions] =
    useState<AIQuestions>(
      job.aiQuestions
        ? {
            chatgpt:
              job.aiQuestions.chatgpt ||
              "",

            deepseek:
              job.aiQuestions.deepseek ||
              "",

            grok:
              job.aiQuestions.grok ||
              "",

            gemini:
              job.aiQuestions.gemini ||
              "",

            copilot:
              job.aiQuestions.copilot ||
              "",

            claude:
              job.aiQuestions.claude ||
              "",

            consolidated:
              job.aiQuestions.consolidated ||
              "",
          }
        : createEmptyAIQuestions()
    );

  /* =======================================================
     VIVA
     ======================================================= */

  const normalizeViva = (
    viva?: VivaStage
  ): VivaStage => {
    if (!viva) {
      return createEmptyViva();
    }

    return {
      date:
        viva.date || "",

      performancePercentage:
        Number(
          viva.performancePercentage
        ) || 0,

      rehearsal:
        viva.rehearsal
          ? {
              chatgpt:
                viva.rehearsal.chatgpt ||
                "",

              deepseek:
                viva.rehearsal.deepseek ||
                "",

              grok:
                viva.rehearsal.grok ||
                "",

              gemini:
                viva.rehearsal.gemini ||
                "",

              copilot:
                viva.rehearsal.copilot ||
                "",

              claude:
                viva.rehearsal.claude ||
                "",
            }
          : createEmptyAIRehearsal(),

      easilyAnsweredQuestions:
        viva.easilyAnsweredQuestions ||
        [],

      partiallyAnsweredQuestions:
        viva.partiallyAnsweredQuestions ||
        [],

      unknownQuestions:
        viva.unknownQuestions ||
        [],

      strengths:
        viva.strengths || "",

      weaknesses:
        viva.weaknesses || "",

      improvement:
        viva.improvement || "",
    };
  };

  const [viva1, setViva1] =
    useState<VivaStage>(
      normalizeViva(job.viva1)
    );

  const [viva2, setViva2] =
    useState<VivaStage>(
      normalizeViva(job.viva2)
    );

  const [viva3, setViva3] =
    useState<VivaStage>(
      normalizeViva(job.viva3)
    );

  const [viva4, setViva4] =
    useState<VivaStage>(
      normalizeViva(job.viva4)
    );

  const [viva5, setViva5] =
    useState<VivaStage>(
      normalizeViva(job.viva5)
    );

  /* =======================================================
     COMPENSATION
     ======================================================= */

  const [compensation, setCompensation] =
    useState<Compensation>(
      job.compensation
        ? {
            expectedSalary:
              job.compensation.expectedSalary ||
              "",

            offeredSalary:
              job.compensation.offeredSalary ||
              "",
          }
        : createEmptyCompensation()
    );

  /* =======================================================
     FOLLOW UP
     ======================================================= */

  const [followUp, setFollowUp] =
    useState<FollowUp>(
      job.followUp
        ? {
            followUpDate:
              job.followUp.followUpDate ||
              "",

            followUpStatus:
              job.followUp.followUpStatus ||
              "",
          }
        : createEmptyFollowUp()
    );

  /* =======================================================
     NEXT ACTION
     ======================================================= */

  const [nextAction, setNextAction] =
    useState(
      job.nextAction || ""
    );

  /* =======================================================
     FINAL ASSESSMENT
     ======================================================= */

  const [finalAssessment, setFinalAssessment] =
    useState<FinalAssessment>(
      job.final
        ? {
            result:
              job.final.result ||
              "",

            resultDate:
              job.final.resultDate ||
              "",

            fullExperience:
              job.final.fullExperience ||
              "",

            finalRecommendation:
              job.final.finalRecommendation ||
              "",
          }
        : createEmptyFinal()
    );

  /* =======================================================
     CUSTOM FIELDS
     ======================================================= */

  const [customFields, setCustomFields] =
    useState<CustomField[]>(
      job.customFields
        ? job.customFields.map(
            (field) => ({
              id:
                field.id ||
                crypto.randomUUID(),

              name:
                field.name ||
                "",

              value:
                field.value ||
                "",
            })
          )
        : []
    );

  /* =======================================================
     SAVING
     ======================================================= */

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     SYNC PROPS → FORM
     
     Important when selected job changes.
     ======================================================= */

  useEffect(() => {
    setId(job.id || "");

    setDesignation(
      job.designation || ""
    );

    setCompany(
      job.company || ""
    );

    setCountry(
      job.country || ""
    );

    setJobType(
      job.jobType || "Remote"
    );

    setApplicationDate(
      job.applicationDate || ""
    );

    setStatus(
      job.status || "Applied"
    );

    setJd(job.jd || "");

    setJobSource(
      job.jobSource || ""
    );

    setJobUrl(
      job.jobUrl || ""
    );

    setRecruiter(
      job.recruiter || ""
    );

    setPriority(
      job.priority || "Medium"
    );

    /* =====================================================
       DOCUMENTS
       ===================================================== */

    setDocuments(
      job.documentsSubmitted
        ? {
            resume:
              job.documentsSubmitted.resume ||
              false,

            coverLetter:
              job.documentsSubmitted.coverLetter ||
              false,

            portfolio:
              job.documentsSubmitted.portfolio ||
              false,

            certificates:
              job.documentsSubmitted.certificates ||
              false,

            other:
              job.documentsSubmitted.other ||
              [],
          }
        : createEmptyDocuments()
    );

    setOtherDocumentsText(
      arrayToText(
        job.documentsSubmitted?.other
      )
    );

    /* =====================================================
       PREPARATION
       ===================================================== */

    setNewTopicsText(
      arrayToText(
        job.preparation?.newTopics
      )
    );

    setKnownTopicsText(
      arrayToText(
        job.preparation?.knownTopics
      )
    );

    setCvAlignmentText(
      arrayToText(
        job.preparation?.cvAlignment
      )
    );

    /* =====================================================
       AI QUESTIONS
       ===================================================== */

    setAIQuestions(
      job.aiQuestions
        ? {
            chatgpt:
              job.aiQuestions.chatgpt ||
              "",

            deepseek:
              job.aiQuestions.deepseek ||
              "",

            grok:
              job.aiQuestions.grok ||
              "",

            gemini:
              job.aiQuestions.gemini ||
              "",

            copilot:
              job.aiQuestions.copilot ||
              "",

            claude:
              job.aiQuestions.claude ||
              "",

            consolidated:
              job.aiQuestions.consolidated ||
              "",
          }
        : createEmptyAIQuestions()
    );

    /* =====================================================
       VIVA
       ===================================================== */

    setViva1(
      normalizeViva(job.viva1)
    );

    setViva2(
      normalizeViva(job.viva2)
    );

    setViva3(
      normalizeViva(job.viva3)
    );

    setViva4(
      normalizeViva(job.viva4)
    );

    setViva5(
      normalizeViva(job.viva5)
    );

    /* =====================================================
       COMPENSATION
       ===================================================== */

    setCompensation(
      job.compensation
        ? {
            expectedSalary:
              job.compensation.expectedSalary ||
              "",

            offeredSalary:
              job.compensation.offeredSalary ||
              "",
          }
        : createEmptyCompensation()
    );

    /* =====================================================
       FOLLOW UP
       ===================================================== */

    setFollowUp(
      job.followUp
        ? {
            followUpDate:
              job.followUp.followUpDate ||
              "",

            followUpStatus:
              job.followUp.followUpStatus ||
              "",
          }
        : createEmptyFollowUp()
    );

    /* =====================================================
       NEXT ACTION
       ===================================================== */

    setNextAction(
      job.nextAction || ""
    );

    /* =====================================================
       FINAL
       ===================================================== */

    setFinalAssessment(
      job.final
        ? {
            result:
              job.final.result ||
              "",

            resultDate:
              job.final.resultDate ||
              "",

            fullExperience:
              job.final.fullExperience ||
              "",

            finalRecommendation:
              job.final.finalRecommendation ||
              "",
          }
        : createEmptyFinal()
    );

    /* =====================================================
       CUSTOM FIELDS
       ===================================================== */

    setCustomFields(
      job.customFields
        ? job.customFields.map(
            (field) => ({
              id:
                field.id ||
                crypto.randomUUID(),

              name:
                field.name ||
                "",

              value:
                field.value ||
                "",
            })
          )
        : []
    );
  }, [job]);

  /* =======================================================
     VIVA UPDATE HELPER
     ======================================================= */

  const updateViva = (
    viva: VivaStage,
    setter: (
      value: VivaStage
    ) => void,
    field: keyof VivaStage,
    value: unknown
  ) => {
    setter({
      ...viva,
      [field]: value,
    });
  };

  /* =======================================================
     AI REHEARSAL UPDATE
     ======================================================= */

  const updateRehearsal = (
    viva: VivaStage,
    setter: (
      value: VivaStage
    ) => void,
    field: keyof AIRehearsal,
    value: string
  ) => {
    setter({
      ...viva,

      rehearsal: {
        ...(viva.rehearsal ||
          createEmptyAIRehearsal()),

        [field]: value,
      },
    });
  };

  /* =======================================================
     SAVE
     ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    /* =====================================================
       ONLY BASIC REQUIRED FIELDS
       ===================================================== */

    if (!id.trim()) {
      setError(
        "Job ID is required."
      );
      return;
    }

    if (!designation.trim()) {
      setError(
        "Designation is required."
      );
      return;
    }

    if (!company.trim()) {
      setError(
        "Company is required."
      );
      return;
    }

    if (!country.trim()) {
      setError(
        "Country is required."
      );
      return;
    }

    if (!applicationDate) {
      setError(
        "Application date is required."
      );
      return;
    }

    try {
      setSaving(true);

      const updatedJob: JobApplication = {
        /* =================================================
           BASIC
           ================================================= */

        id: id.trim(),

        designation:
          designation.trim(),

        company:
          company.trim(),

        country:
          country.trim(),

        jobType,

        applicationDate,

        status,

        /* =================================================
           OPTIONAL JOB INFORMATION
           ================================================= */

        ...(jd.trim()
          ? {
              jd: jd.trim(),
            }
          : {}),

        ...(jobSource.trim()
          ? {
              jobSource:
                jobSource.trim(),
            }
          : {}),

        ...(jobUrl.trim()
          ? {
              jobUrl:
                jobUrl.trim(),
            }
          : {}),

        ...(recruiter.trim()
          ? {
              recruiter:
                recruiter.trim(),
            }
          : {}),

        ...(priority
          ? {
              priority,
            }
          : {}),

        /* =================================================
           DOCUMENTS
           ================================================= */

        ...(documents.resume ||
        documents.coverLetter ||
        documents.portfolio ||
        documents.certificates ||
        otherDocumentsText.trim()
          ? {
              documentsSubmitted: {
                resume:
                  !!documents.resume,

                coverLetter:
                  !!documents.coverLetter,

                portfolio:
                  !!documents.portfolio,

                certificates:
                  !!documents.certificates,

                other:
                  textToArray(
                    otherDocumentsText
                  ),
              },
            }
          : {}),

        /* =================================================
           PREPARATION
           ================================================= */

        ...(newTopicsText.trim() ||
        knownTopicsText.trim() ||
        cvAlignmentText.trim()
          ? {
              preparation: {
                newTopics:
                  textToArray(
                    newTopicsText
                  ),

                knownTopics:
                  textToArray(
                    knownTopicsText
                  ),

                cvAlignment:
                  textToArray(
                    cvAlignmentText
                  ),
              },
            }
          : {}),

        /* =================================================
           AI QUESTIONS
           ================================================= */

        ...(Object.values(
          aiQuestions
        ).some(
          (value) =>
            !!value?.trim()
        )
          ? {
              aiQuestions,
            }
          : {}),

        /* =================================================
           VIVA
           ================================================= */

        ...(hasVivaData(viva1)
          ? {
              viva1,
            }
          : {}),

        ...(hasVivaData(viva2)
          ? {
              viva2,
            }
          : {}),

        ...(hasVivaData(viva3)
          ? {
              viva3,
            }
          : {}),

        ...(hasVivaData(viva4)
          ? {
              viva4,
            }
          : {}),

        ...(hasVivaData(viva5)
          ? {
              viva5,
            }
          : {}),

        /* =================================================
           COMPENSATION
           ================================================= */

        ...(compensation.expectedSalary?.trim() ||
        compensation.offeredSalary?.trim()
          ? {
              compensation,
            }
          : {}),

        /* =================================================
           FOLLOW UP
           ================================================= */

        ...(followUp.followUpDate?.trim() ||
        followUp.followUpStatus?.trim()
          ? {
              followUp,
            }
          : {}),

        /* =================================================
           NEXT ACTION
           ================================================= */

        ...(nextAction.trim()
          ? {
              nextAction:
                nextAction.trim(),
            }
          : {}),

        /* =================================================
           FINAL
           ================================================= */

        ...(finalAssessment.result?.trim() ||
        finalAssessment.resultDate?.trim() ||
        finalAssessment.fullExperience?.trim() ||
        finalAssessment.finalRecommendation?.trim()
          ? {
              final:
                finalAssessment,
            }
          : {}),

        /* =================================================
           CUSTOM FIELDS
           ================================================= */

        ...(customFields.length > 0
          ? {
              customFields:
                customFields.filter(
                  (field) =>
                    field.name?.trim() ||
                    field.value?.trim()
                ),
            }
          : {}),

        /* =================================================
           AUDIT
           
           Preserve original createdAt.
           ================================================= */

        createdAt:
          job.createdAt ||
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      await onSave(
        updatedJob
      );
    } catch (err) {
      console.error(
        "Failed to save job:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save job."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CUSTOM FIELD
     ======================================================= */

  const addCustomField = () => {
    setCustomFields(
      (current) => [
        ...current,

        {
          id:
            crypto.randomUUID(),

          name: "",

          value: "",
        },
      ]
    );
  };

  const removeCustomField = (
    id: string
  ) => {
    setCustomFields(
      (current) =>
        current.filter(
          (field) =>
            field.id !== id
        )
    );
  };

  const updateCustomField = (
    id: string,
    field:
      | "name"
      | "value",
    value: string
  ) => {
    setCustomFields(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      style={pageStyle}
    >
      <form
        onSubmit={handleSubmit}
        style={containerStyle}
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <div
          style={headerStyle}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#777",
                marginBottom: "5px",
              }}
            >
              EDIT JOB APPLICATION
            </div>

            <h1
              style={{
                margin: 0,
              }}
            >
              ✏️ Edit Job
            </h1>

            <div
              style={{
                marginTop: "6px",
                color: "#666",
                fontSize: "13px",
              }}
            >
              {job.id}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={secondaryButton}
              disabled={saving}
            >
              ← Cancel
            </button>

            <button
              type="submit"
              style={primaryButton}
              disabled={saving}
            >
              {saving
                ? "💾 Saving..."
                : "💾 Save Changes"}
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div
            style={errorStyle}
          >
            ⚠️ {error}
          </div>
        )}

        {/* =================================================
            BASIC INFORMATION
            ================================================= */}

        <Section
          title="📌 Basic Information"
        >
          <div
            style={gridStyle}
          >
            <Field
              label="Job ID"
              value={id}
              onChange={setId}
              required
              readOnly
              
            />

            <Field
              label="Designation"
              value={designation}
              onChange={setDesignation}
              required
            />

            <Field
              label="Company"
              value={company}
              onChange={setCompany}
              required
            />

            <Field
              label="Country"
              value={country}
              onChange={setCountry}
              required
            />

            <SelectField
              label="Job Type"
              value={jobType}
              onChange={(value) =>
                setJobType(
                  value as JobType
                )
              }
              options={[
                "Remote",
                "Relocate",
                "Local",
                "Hybrid",
              ]}
            />

            <Field
              label="Application Date"
              type="date"
              value={applicationDate}
              onChange={
                setApplicationDate
              }
              required
            />

            <SelectField
              label="Status"
              value={status}
              onChange={(value) =>
                setStatus(
                  value as JobStatus
                )
              }
              options={[
                "Applied",
                "HR Screening",
                "Interview",
                "Offer",
                "Rejected",
                "Withdrawn",
                "On Hold",
                "Selected",
              ]}
            />

            <SelectField
              label="Priority"
              value={priority}
              onChange={(value) =>
                setPriority(
                  value as Priority
                )
              }
              options={[
                "High",
                "Medium",
                "Low",
              ]}
            />
          </div>
        </Section>

        {/* =================================================
            JOB INFORMATION
            ================================================= */}

        <Section
          title="📝 Job Information"
        >
          <div
            style={gridStyle}
          >
            <Field
              label="Job Source"
              value={jobSource}
              onChange={
                setJobSource
              }
              placeholder="LinkedIn / Indeed / Company Website..."
            />

            <Field
              label="Recruiter"
              value={recruiter}
              onChange={
                setRecruiter
              }
            />

            <Field
              label="Job URL"
              value={jobUrl}
              onChange={setJobUrl}
            />
          </div>

          <TextArea
            label="Job Description"
            value={jd}
            onChange={setJd}
            rows={8}
          />
        </Section>

        {/* =================================================
            DOCUMENTS
            ================================================= */}

        <Section
          title="📄 Documents Submitted"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: "10px",
            }}
          >
            <CheckBox
              label="Resume"
              checked={
                !!documents.resume
              }
              onChange={(checked) =>
                setDocuments(
                  (current) => ({
                    ...current,
                    resume: checked,
                  })
                )
              }
            />

            <CheckBox
              label="Cover Letter"
              checked={
                !!documents.coverLetter
              }
              onChange={(checked) =>
                setDocuments(
                  (current) => ({
                    ...current,
                    coverLetter:
                      checked,
                  })
                )
              }
            />

            <CheckBox
              label="Portfolio"
              checked={
                !!documents.portfolio
              }
              onChange={(checked) =>
                setDocuments(
                  (current) => ({
                    ...current,
                    portfolio:
                      checked,
                  })
                )
              }
            />

            <CheckBox
              label="Certificates"
              checked={
                !!documents.certificates
              }
              onChange={(checked) =>
                setDocuments(
                  (current) => ({
                    ...current,
                    certificates:
                      checked,
                  })
                )
              }
            />
          </div>

          <TextArea
            label="Other Documents — one per line"
            value={
              otherDocumentsText
            }
            onChange={
              setOtherDocumentsText
            }
            rows={4}
          />
        </Section>

        {/* =================================================
            PREPARATION
            ================================================= */}

        <Section
          title="🎯 Preparation"
        >
          <TextArea
            label="New Topics from JD — one per line"
            value={
              newTopicsText
            }
            onChange={
              setNewTopicsText
            }
            rows={5}
          />

          <TextArea
            label="Known Topics — one per line"
            value={
              knownTopicsText
            }
            onChange={
              setKnownTopicsText
            }
            rows={5}
          />

          <TextArea
            label="CV Alignment / Study — one per line"
            value={
              cvAlignmentText
            }
            onChange={
              setCvAlignmentText
            }
            rows={5}
          />
        </Section>

        {/* =================================================
            AI QUESTIONS
            ================================================= */}

        <Section
          title="🤖 AI Generated Q&A"
        >
          <TextArea
            label="ChatGPT"
            value={
              aiQuestions.chatgpt ||
              ""
            }
            onChange={(value) =>
              setAIQuestions(
                (current) => ({
                  ...current,
                  chatgpt: value,
                })
              )
            }
          />

          <TextArea
            label="DeepSeek"
            value={
              aiQuestions.deepseek ||
              ""
            }
            onChange={(value) =>
              setAIQuestions(
                (current) => ({
                  ...current,
                  deepseek: value,
                })
              )
            }
          />

          <TextArea
            label="Grok"
            value={
              aiQuestions.grok ||
              ""
            }
            onChange={(value) =>
              setAIQuestions(
                (current) => ({
                  ...current,
                  grok: value,
                })
              )
            }
          />

          <TextArea
            label="Gemini"
            value={
              aiQuestions.gemini ||
              ""
            }
            onChange={(value) =>
              setAIQuestions(
                (current) => ({
                  ...current,
                  gemini: value,
                })
              )
            }
          />

          <TextArea
            label="Copilot"
            value={
              aiQuestions.copilot ||
              ""
            }
            onChange={(value) =>
              setAIQuestions(
                (current) => ({
                  ...current,
                  copilot: value,
                })
              )
            }
          />

          <TextArea
            label="Claude"
            value={
              aiQuestions.claude ||
              ""
            }
            onChange={(value) =>
              setAIQuestions(
                (current) => ({
                  ...current,
                  claude: value,
                })
              )
            }
          />

          <TextArea
            label="Consolidated"
            value={
              aiQuestions.consolidated ||
              ""
            }
            onChange={(value) =>
              setAIQuestions(
                (current) => ({
                  ...current,
                  consolidated:
                    value,
                })
              )
            }
            rows={8}
          />
        </Section>

        {/* =================================================
            VIVA 1
            ================================================= */}

        <VivaEditor
          number={1}
          viva={viva1}
          setViva={setViva1}
          updateViva={updateViva}
          updateRehearsal={
            updateRehearsal
          }
        />

        {/* =================================================
            VIVA 2
            ================================================= */}

        <VivaEditor
          number={2}
          viva={viva2}
          setViva={setViva2}
          updateViva={updateViva}
          updateRehearsal={
            updateRehearsal
          }
        />

        {/* =================================================
            VIVA 3
            ================================================= */}

        <VivaEditor
          number={3}
          viva={viva3}
          setViva={setViva3}
          updateViva={updateViva}
          updateRehearsal={
            updateRehearsal
          }
        />

        {/* =================================================
            VIVA 4
            ================================================= */}

        <VivaEditor
          number={4}
          viva={viva4}
          setViva={setViva4}
          updateViva={updateViva}
          updateRehearsal={
            updateRehearsal
          }
        />

        {/* =================================================
            VIVA 5
            ================================================= */}

        <VivaEditor
          number={5}
          viva={viva5}
          setViva={setViva5}
          updateViva={updateViva}
          updateRehearsal={
            updateRehearsal
          }
        />

        {/* =================================================
            COMPENSATION
            ================================================= */}

        <Section
          title="💰 Compensation"
        >
          <div
            style={gridStyle}
          >
            <Field
              label="Expected Salary"
              value={
                compensation.expectedSalary ||
                ""
              }
              onChange={(value) =>
                setCompensation(
                  (current) => ({
                    ...current,
                    expectedSalary:
                      value,
                  })
                )
              }
            />

            <Field
              label="Offered Salary"
              value={
                compensation.offeredSalary ||
                ""
              }
              onChange={(value) =>
                setCompensation(
                  (current) => ({
                    ...current,
                    offeredSalary:
                      value,
                  })
                )
              }
            />
          </div>
        </Section>

        {/* =================================================
            FOLLOW UP
            ================================================= */}

        <Section
          title="📅 Follow-up"
        >
          <div
            style={gridStyle}
          >
            <Field
              label="Follow-up Date"
              type="date"
              value={
                followUp.followUpDate ||
                ""
              }
              onChange={(value) =>
                setFollowUp(
                  (current) => ({
                    ...current,
                    followUpDate:
                      value,
                  })
                )
              }
            />

            <Field
              label="Follow-up Status"
              value={
                followUp.followUpStatus ||
                ""
              }
              onChange={(value) =>
                setFollowUp(
                  (current) => ({
                    ...current,
                    followUpStatus:
                      value,
                  })
                )
              }
            />
          </div>
        </Section>

        {/* =================================================
            NEXT ACTION
            ================================================= */}

        <Section
          title="🚀 Next Action"
        >
          <TextArea
            label="Next Action"
            value={nextAction}
            onChange={
              setNextAction
            }
            rows={5}
          />
        </Section>

        {/* =================================================
            FINAL
            ================================================= */}

        <Section
          title="🏁 Final Assessment"
        >
          <div
            style={gridStyle}
          >
            <Field
              label="Final Result"
              value={
                finalAssessment.result ||
                ""
              }
              onChange={(value) =>
                setFinalAssessment(
                  (current) => ({
                    ...current,
                    result:
                      value,
                  })
                )
              }
            />

            <Field
              label="Result Date"
              type="date"
              value={
                finalAssessment.resultDate ||
                ""
              }
              onChange={(value) =>
                setFinalAssessment(
                  (current) => ({
                    ...current,
                    resultDate:
                      value,
                  })
                )
              }
            />
          </div>

          <TextArea
            label="Full Experience"
            value={
              finalAssessment.fullExperience ||
              ""
            }
            onChange={(value) =>
              setFinalAssessment(
                (current) => ({
                  ...current,
                  fullExperience:
                    value,
                })
              )
            }
            rows={7}
          />

          <TextArea
            label="Final Recommendation / Upgrade Plan"
            value={
              finalAssessment.finalRecommendation ||
              ""
            }
            onChange={(value) =>
              setFinalAssessment(
                (current) => ({
                  ...current,
                  finalRecommendation:
                    value,
                })
              )
            }
            rows={7}
          />
        </Section>

        {/* =================================================
            CUSTOM FIELDS
            ================================================= */}

        <Section
          title="🧩 Custom Fields"
        >
          {customFields.length === 0 ? (
            <div
              style={{
                color: "#777",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              No custom fields.
            </div>
          ) : (
            customFields.map(
              (field) => (
                <div
                  key={field.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 2fr auto",
                    gap: "10px",
                    marginBottom:
                      "10px",
                  }}
                >
                  <input
                    value={
                      field.name || ""
                    }
                    onChange={(event) =>
                      updateCustomField(
                        field.id,
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Field name"
                    style={
                      inputStyle
                    }
                  />

                  <input
                    value={
                      field.value || ""
                    }
                    onChange={(event) =>
                      updateCustomField(
                        field.id,
                        "value",
                        event.target.value
                      )
                    }
                    placeholder="Field value"
                    style={
                      inputStyle
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeCustomField(
                        field.id
                      )
                    }
                    style={
                      dangerButton
                    }
                  >
                    🗑️
                  </button>
                </div>
              )
            )
          )}

          <button
            type="button"
            onClick={
              addCustomField
            }
            style={
              secondaryButton
            }
          >
            ➕ Add Custom Field
          </button>
        </Section>

        {/* =================================================
            FOOTER ACTIONS
            ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: "10px",
            padding:
              "20px 0 40px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={
              secondaryButton
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={
              primaryButton
            }
            disabled={saving}
          >
            {saving
              ? "💾 Saving..."
              : "💾 Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   VIVA DATA CHECK
   ========================================================= */

function hasVivaData(
  viva: VivaStage
): boolean {
  if (
    viva.date?.trim()
  ) {
    return true;
  }

  if (
    Number(
      viva.performancePercentage
    ) > 0
  ) {
    return true;
  }

  if (
    viva.strengths?.trim() ||
    viva.weaknesses?.trim() ||
    viva.improvement?.trim()
  ) {
    return true;
  }

  if (
    viva.easilyAnsweredQuestions
      ?.length
  ) {
    return true;
  }

  if (
    viva.partiallyAnsweredQuestions
      ?.length
  ) {
    return true;
  }

  if (
    viva.unknownQuestions
      ?.length
  ) {
    return true;
  }

  const rehearsal =
    viva.rehearsal;

  if (
    rehearsal &&
    Object.values(
      rehearsal
    ).some(
      (value) =>
        !!value?.trim()
    )
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   VIVA EDITOR
   ========================================================= */

function VivaEditor({
  number,
  viva,
  setViva,
  updateViva,
  updateRehearsal,
}: {
  number: number;
  viva: VivaStage;
  setViva: (
    value: VivaStage
  ) => void;
  updateViva: (
    viva: VivaStage,
    setter: (
      value: VivaStage
    ) => void,
    field: keyof VivaStage,
    value: unknown
  ) => void;
  updateRehearsal: (
    viva: VivaStage,
    setter: (
      value: VivaStage
    ) => void,
    field: keyof AIRehearsal,
    value: string
  ) => void;
}) {
  const rehearsal =
    viva.rehearsal ||
    createEmptyAIRehearsal();

  return (
    <Section
      title={`🎤 Viva ${number}`}
    >
      <div
        style={gridStyle}
      >
        <Field
          label="Viva Date"
          type="date"
          value={
            viva.date || ""
          }
          onChange={(value) =>
            updateViva(
              viva,
              setViva,
              "date",
              value
            )
          }
        />

        <Field
          label="Performance %"
          type="number"
          value={String(
            viva.performancePercentage ??
              0
          )}
          onChange={(value) =>
            updateViva(
              viva,
              setViva,
              "performancePercentage",
              Number(value) || 0
            )
          }
        />
      </div>

      <h4
        style={{
          marginTop: "20px",
          marginBottom: "10px",
        }}
      >
        🎙️ AI Rehearsal
      </h4>

      <TextArea
        label="ChatGPT"
        value={
          rehearsal.chatgpt ||
          ""
        }
        onChange={(value) =>
          updateRehearsal(
            viva,
            setViva,
            "chatgpt",
            value
          )
        }
      />

      <TextArea
        label="DeepSeek"
        value={
          rehearsal.deepseek ||
          ""
        }
        onChange={(value) =>
          updateRehearsal(
            viva,
            setViva,
            "deepseek",
            value
          )
        }
      />

      <TextArea
        label="Grok"
        value={
          rehearsal.grok ||
          ""
        }
        onChange={(value) =>
          updateRehearsal(
            viva,
            setViva,
            "grok",
            value
          )
        }
      />

      <TextArea
        label="Gemini"
        value={
          rehearsal.gemini ||
          ""
        }
        onChange={(value) =>
          updateRehearsal(
            viva,
            setViva,
            "gemini",
            value
          )
        }
      />

      <TextArea
        label="Copilot"
        value={
          rehearsal.copilot ||
          ""
        }
        onChange={(value) =>
          updateRehearsal(
            viva,
            setViva,
            "copilot",
            value
          )
        }
      />

      <TextArea
        label="Claude"
        value={
          rehearsal.claude ||
          ""
        }
        onChange={(value) =>
          updateRehearsal(
            viva,
            setViva,
            "claude",
            value
          )
        }
      />

      <TextArea
        label="Easily Answered Questions — one per line"
        value={arrayToText(
          viva.easilyAnsweredQuestions
        )}
        onChange={(value) =>
          updateViva(
            viva,
            setViva,
            "easilyAnsweredQuestions",
            textToArray(value)
          )
        }
        rows={5}
      />

      <TextArea
        label="Partially Answered Questions — one per line"
        value={arrayToText(
          viva.partiallyAnsweredQuestions
        )}
        onChange={(value) =>
          updateViva(
            viva,
            setViva,
            "partiallyAnsweredQuestions",
            textToArray(value)
          )
        }
        rows={5}
      />

      <TextArea
        label="Unknown Questions — one per line"
        value={arrayToText(
          viva.unknownQuestions
        )}
        onChange={(value) =>
          updateViva(
            viva,
            setViva,
            "unknownQuestions",
            textToArray(value)
          )
        }
        rows={5}
      />

      <TextArea
        label="Strengths"
        value={
          viva.strengths || ""
        }
        onChange={(value) =>
          updateViva(
            viva,
            setViva,
            "strengths",
            value
          )
        }
      />

      <TextArea
        label="Weaknesses"
        value={
          viva.weaknesses || ""
        }
        onChange={(value) =>
          updateViva(
            viva,
            setViva,
            "weaknesses",
            value
          )
        }
      />

      <TextArea
        label="Improvement"
        value={
          viva.improvement || ""
        }
        onChange={(value) =>
          updateViva(
            viva,
            setViva,
            "improvement",
            value
          )
        }
      />
    </Section>
  );
}

/* =========================================================
   SECTION
   ========================================================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={sectionStyle}
    >
      <h2
        style={{
          margin:
            "0 0 20px",
          fontSize: "19px",
        }}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

/* =========================================================
   FIELD
   ========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  readOnly = false
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label
      style={labelStyle}
    >
      <span
        style={labelTextStyle}
      >
        {label}

        {required && (
          <span
            style={{
              color: "#dc2626",
            }}
          >
            {" "}
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        required={required}
        readOnly={readOnly} 
        style={{
          ...inputStyle,
          background: readOnly ? "#f3f4f6" : "#ffffff",  // ✅ যোগ করুন (grey background)
          cursor: readOnly ? "not-allowed" : "text",     // ✅ যোগ করুন
        }}
      />
    </label>
  );
}

/* =========================================================
   SELECT
   ========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <label
      style={labelStyle}
    >
      <span
        style={labelTextStyle}
      >
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={inputStyle}
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );
}

/* =========================================================
   TEXT AREA
   ========================================================= */

function TextArea({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  rows?: number;
}) {
  return (
    <label
      style={{
        ...labelStyle,
        marginTop: "15px",
      }}
    >
      <span
        style={labelTextStyle}
      >
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        rows={rows}
        style={{
          ...inputStyle,
          resize: "vertical",
          minHeight:
            rows >= 6
              ? "120px"
              : undefined,
          lineHeight: 1.5,
        }}
      />
    </label>
  );
}

/* =========================================================
   CHECKBOX
   ========================================================= */

function CheckBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems:
          "center",
        gap: "9px",
        padding: "13px",
        border:
          "1px solid #e5e7eb",
        borderRadius: "9px",
        background:
          checked
            ? "#f0fdf4"
            : "#f9fafb",
        cursor:
          "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
      />

      <span>
        {checked
          ? "✓ "
          : ""}
        {label}
      </span>
    </label>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const pageStyle:
  React.CSSProperties = {
  minHeight:
    "100vh",

  background:
    "#f5f7fb",

  padding:
    "20px",

  fontFamily:
    "Arial, sans-serif",
};

const containerStyle:
  React.CSSProperties = {
  maxWidth:
    "1200px",

  margin:
    "0 auto",
};

const headerStyle:
  React.CSSProperties = {
  background:
    "#ffffff",

  borderRadius:
    "14px",

  padding:
    "22px",

  marginBottom:
    "20px",

  display:
    "flex",

  justifyContent:
    "space-between",

  alignItems:
    "center",

  gap:
    "20px",

  flexWrap:
    "wrap",

  boxShadow:
    "0 4px 18px rgba(0,0,0,0.06)",
};

const sectionStyle:
  React.CSSProperties = {
  background:
    "#ffffff",

  borderRadius:
    "14px",

  padding:
    "24px",

  marginBottom:
    "18px",

  boxShadow:
    "0 4px 18px rgba(0,0,0,0.05)",
};

const gridStyle:
  React.CSSProperties = {
  display:
    "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(230px, 1fr))",

  gap:
    "15px",
};

const labelStyle:
  React.CSSProperties = {
  display:
    "flex",

  flexDirection:
    "column",

  gap:
    "7px",

  fontSize:
    "13px",
};

const labelTextStyle:
  React.CSSProperties = {
  fontWeight:
    600,

  color:
    "#374151",
};

const inputStyle:
  React.CSSProperties = {
  width:
    "100%",

  boxSizing:
    "border-box",

  padding:
    "11px 12px",

  border:
    "1px solid #d1d5db",

  borderRadius:
    "8px",

  background:
    "#ffffff",

  color:
    "#111827",

  fontSize:
    "14px",

  outline:
    "none",
};

const primaryButton:
  React.CSSProperties = {
  padding:
    "11px 18px",

  border:
    "none",

  borderRadius:
    "8px",

  background:
    "#24292f",

  color:
    "#ffffff",

  cursor:
    "pointer",

  fontWeight:
    700,
};

const secondaryButton:
  React.CSSProperties = {
  padding:
    "11px 18px",

  border:
    "1px solid #d0d7de",

  borderRadius:
    "8px",

  background:
    "#ffffff",

  color:
    "#24292f",

  cursor:
    "pointer",

  fontWeight:
    600,
};

const dangerButton:
  React.CSSProperties = {
  padding:
    "10px 13px",

  border:
    "1px solid #fecaca",

  borderRadius:
    "8px",

  background:
    "#fef2f2",

  color:
    "#b91c1c",

  cursor:
    "pointer",

  fontWeight:
    600,
};

const errorStyle:
  React.CSSProperties = {
  background:
    "#fef2f2",

  color:
    "#b91c1c",

  border:
    "1px solid #fecaca",

  padding:
    "13px 16px",

  borderRadius:
    "9px",

  marginBottom:
    "18px",

  fontWeight:
    600,
};

export default EditJob;