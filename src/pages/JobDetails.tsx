import React from "react";
import type {
  JobApplication,
  VivaStage,
} from "../types/job";
import { getVivaStages } from "../types/job";

interface JobDetailsProps {
  job: JobApplication;
  onBack: () => void;
  onEdit: () => void;
}

function JobDetails({
  job,
  onBack,
  onEdit,
}: JobDetailsProps) {
  const documents = job.documentsSubmitted ?? {
    resume: false,
    coverLetter: false,
    portfolio: false,
    certificates: false,
    other: [],
  };

  const preparation = job.preparation ?? {
    newTopics: [],
    knownTopics: [],
    cvAlignment: [],
  };

  const aiQuestions = job.aiQuestions ?? {
    chatgpt: "",
    deepseek: "",
    grok: "",
    gemini: "",
    copilot: "",
    claude: "",
    consolidated: "",
  };

  const vivas = getVivaStages(job);

  const finalAssessment = job.final;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* =====================================================
            HEADER
           ===================================================== */}

        <div style={headerStyle}>
          <div>
            <div style={titleRowStyle}>
              <h1 style={titleStyle}>
                💼 {job.designation}
              </h1>

              <span style={statusBadgeStyle}>
                {job.status || "N/A"}
              </span>
            </div>

            <p style={companyStyle}>
              {job.company} · {job.country}
            </p>

            <p style={jobIdStyle}>
              Job ID: <strong>{job.id}</strong>
            </p>
          </div>

          <div style={headerActionsStyle}>
            <button
              type="button"
              onClick={onBack}
              style={secondaryButtonStyle}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={onEdit}
              style={primaryButtonStyle}
            >
              ✏️ Edit Job
            </button>
          </div>
        </div>

        {/* =====================================================
            BASIC JOB INFORMATION
           ===================================================== */}

        <Section
          icon="📋"
          title="Job Information"
        >
          <div style={gridStyle}>

            <InfoCard
              label="Job ID"
              value={job.id}
            />

            <InfoCard
              label="Designation"
              value={job.designation}
            />

            <InfoCard
              label="Company"
              value={job.company}
            />

            <InfoCard
              label="Country"
              value={job.country}
            />

            <InfoCard
              label="Job Type"
              value={job.jobType}
            />

            <InfoCard
              label="Job Source"
              value={job.jobSource}
            />

            <InfoCard
              label="Recruiter"
              value={job.recruiter || "Not provided"}
            />

            <InfoCard
              label="Application Date"
              value={job.applicationDate}
            />

            <InfoCard
              label="Status"
              value={job.status}
            />

            <InfoCard
              label="Priority"
              value={job.priority || "Not set"}
            />

            <InfoCard
              label="Job URL"
              value={job.jobUrl || "Not provided"}
            />

          </div>
        </Section>

        {/* =====================================================
            JOB DESCRIPTION
           ===================================================== */}

        <Section
          icon="📄"
          title="Job Description"
        >
          <TextBox
            value={
              job.jd ||
              "No job description provided."
            }
          />
        </Section>

        {/* =====================================================
            DOCUMENTS
           ===================================================== */}

        <Section
          icon="📁"
          title="Documents Submitted"
        >
          <div style={documentGridStyle}>

            <DocumentCard
              label="Resume"
              submitted={
                documents.resume ?? false
              }
            />

            <DocumentCard
              label="Cover Letter"
              submitted={
                documents.coverLetter ?? false
              }
            />

            <DocumentCard
              label="Portfolio"
              submitted={
                documents.portfolio ?? false
              }
            />

            <DocumentCard
              label="Certificates"
              submitted={
                documents.certificates ?? false
              }
            />

          </div>

          {documents.other &&
            documents.other.length > 0 && (
              <div style={otherDocumentsStyle}>
                <strong>
                  Other Documents
                </strong>

                <ul>
                  {documents.other.map(
                    (document, index) => (
                      <li key={index}>
                        {document}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </Section>

        {/* =====================================================
            INTERVIEW PREPARATION
           ===================================================== */}

        <Section
          icon="🎯"
          title="Interview Preparation"
        >
          <PreparationBlock
            title="🆕 New Topics"
            items={
              preparation.newTopics ?? []
            }
          />

          <PreparationBlock
            title="✅ Known Topics"
            items={
              preparation.knownTopics ?? []
            }
          />

          <PreparationBlock
            title="📌 CV Alignment"
            items={
              preparation.cvAlignment ?? []
            }
          />
        </Section>

        {/* =====================================================
            AI QUESTIONS
           ===================================================== */}

        <Section
          icon="🤖"
          title="AI Interview Questions"
        >
          <AIBlock
            title="ChatGPT"
            value={aiQuestions.chatgpt}
          />

          <AIBlock
            title="DeepSeek"
            value={aiQuestions.deepseek}
          />

          <AIBlock
            title="Grok"
            value={aiQuestions.grok}
          />

          <AIBlock
            title="Gemini"
            value={aiQuestions.gemini}
          />

          <AIBlock
            title="Copilot"
            value={aiQuestions.copilot}
          />

          <AIBlock
            title="Claude"
            value={aiQuestions.claude}
          />

          <AIBlock
            title="Consolidated Questions"
            value={
              aiQuestions.consolidated
            }
            highlight
          />
        </Section>

        {/* =====================================================
            VIVA / INTERVIEW HISTORY
           ===================================================== */}

        <Section
          icon="🎤"
          title="Viva / Interview History"
        >
          {vivas.length === 0 ? (
            <EmptyState
              text="No viva/interview records yet."
            />
          ) : (
            <div>

              {vivas.map(
                (viva, index) => (
                  <VivaCard
                    key={index}
                    viva={viva}
                    index={index}
                  />
                )
              )}

            </div>
          )}
        </Section>

        {/* =====================================================
            COMPENSATION
           ===================================================== */}

        <Section
          icon="💰"
          title="Compensation"
        >
          {job.compensation ? (
            <div style={gridStyle}>

              <InfoCard
                label="Expected Salary"
                value={
                  job.compensation
                    .expectedSalary ||
                  "Not provided"
                }
              />

              <InfoCard
                label="Offered Salary"
                value={
                  job.compensation
                    .offeredSalary ||
                  "Not provided"
                }
              />

            </div>
          ) : (
            <EmptyState
              text="No compensation information recorded yet."
            />
          )}
        </Section>

        {/* =====================================================
            FOLLOW UP
           ===================================================== */}

        <Section
          icon="📞"
          title="Follow Up"
        >
          {job.followUp ? (
            <div style={gridStyle}>

              <InfoCard
                label="Follow Up Date"
                value={
                  job.followUp
                    .followUpDate ||
                  "Not provided"
                }
              />

              <InfoCard
                label="Follow Up Status"
                value={
                  job.followUp
                    .followUpStatus ||
                  "Not provided"
                }
              />

            </div>
          ) : (
            <EmptyState
              text="No follow-up information recorded yet."
            />
          )}
        </Section>

        {/* =====================================================
            FINAL ASSESSMENT
           ===================================================== */}

        <Section
          icon="🏆"
          title="Final Assessment"
        >
          <div style={gridStyle}>

            <InfoCard
              label="Result"
              value={
                finalAssessment?.result ||
                "No final result recorded yet."
              }
            />

            <InfoCard
              label="Result Date"
              value={
                finalAssessment?.resultDate ||
                "Not recorded"
              }
            />

          </div>

          <div style={assessmentBlockStyle}>
            <h3 style={subTitleStyle}>
              📝 Full Experience
            </h3>

            <TextBox
              value={
                finalAssessment?.fullExperience ||
                "No experience notes recorded yet."
              }
            />
          </div>

          <div style={assessmentBlockStyle}>
            <h3 style={subTitleStyle}>
              ⭐ Final Recommendation
            </h3>

            <TextBox
              value={
                finalAssessment?.finalRecommendation ||
                "No recommendation recorded yet."
              }
            />
          </div>
        </Section>

        {/* =====================================================
            NEXT ACTION
           ===================================================== */}

        <Section
          icon="➡️"
          title="Next Action"
        >
          <div style={nextActionStyle}>
            {job.nextAction ||
              "No next action defined yet."}
          </div>
        </Section>

        {/* =====================================================
            CUSTOM FIELDS
           ===================================================== */}

        <Section
          icon="🧩"
          title="Custom Fields"
        >
          {!job.customFields ||
          job.customFields.length === 0 ? (
            <EmptyState
              text="No custom fields added yet."
            />
          ) : (
            <div style={gridStyle}>

              {job.customFields.map(
                (field) => (
                  <InfoCard
                    key={field.id}
                    label={
                      field.name ||
                      field.id
                    }
                    value={
                      field.value ||
                      "N/A"
                    }
                  />
                )
              )}

            </div>
          )}
        </Section>

        {/* =====================================================
            SYSTEM INFORMATION
           ===================================================== */}

        <Section
          icon="⚙️"
          title="System Information"
        >
          <div style={gridStyle}>

            <InfoCard
              label="Created At"
              value={
                job.createdAt || "N/A"
              }
            />

            <InfoCard
              label="Updated At"
              value={
                job.updatedAt || "N/A"
              }
            />

          </div>
        </Section>

        {/* =====================================================
            FOOTER ACTIONS
           ===================================================== */}

        <div style={footerStyle}>

          <button
            type="button"
            onClick={onBack}
            style={secondaryButtonStyle}
          >
            ← Back to Jobs
          </button>

          <button
            type="button"
            onClick={onEdit}
            style={primaryButtonStyle}
          >
            ✏️ Edit This Job
          </button>

        </div>

      </div>
    </div>
  );
}

/* =====================================================
   SECTION
   ===================================================== */

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sectionStyle}>

      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>
          <span>{icon}</span>
          {title}
        </h2>
      </div>

      <div>
        {children}
      </div>

    </section>
  );
}

/* =====================================================
   INFO CARD
   ===================================================== */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div style={infoCardStyle}>

      <div style={infoLabelStyle}>
        {label}
      </div>

      <div style={infoValueStyle}>
        {value || "N/A"}
      </div>

    </div>
  );
}

/* =====================================================
   TEXT BOX
   ===================================================== */

function TextBox({
  value,
}: {
  value: string;
}) {
  return (
    <div style={textBoxStyle}>
      {value}
    </div>
  );
}

/* =====================================================
   DOCUMENT CARD
   ===================================================== */

function DocumentCard({
  label,
  submitted,
}: {
  label: string;
  submitted: boolean;
}) {
  return (
    <div
      style={{
        ...documentCardStyle,
        borderColor: submitted
          ? "#86efac"
          : "#e5e7eb",
        background: submitted
          ? "#f0fdf4"
          : "#f9fafb",
      }}
    >
      <div style={documentIconStyle}>
        {submitted ? "✅" : "⭕"}
      </div>

      <div>
        <div style={documentLabelStyle}>
          {label}
        </div>

        <div
          style={{
            fontSize: "13px",
            color: submitted
              ? "#15803d"
              : "#6b7280",
          }}
        >
          {submitted
            ? "Submitted"
            : "Not submitted"}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   PREPARATION
   ===================================================== */

function PreparationBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div style={preparationBlockStyle}>

      <h3 style={subTitleStyle}>
        {title}
      </h3>

      {!items ||
      items.length === 0 ? (
        <div style={emptySmallStyle}>
          No items recorded.
        </div>
      ) : (
        <ul style={listStyle}>
          {items.map(
            (item, index) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>
      )}

    </div>
  );
}

/* =====================================================
   AI BLOCK
   ===================================================== */

function AIBlock({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        ...aiBlockStyle,
        background: highlight
          ? "#f0f9ff"
          : "#fafafa",
        borderColor: highlight
          ? "#bae6fd"
          : "#e5e7eb",
      }}
    >

      <h3 style={aiTitleStyle}>
        🤖 {title}
      </h3>

      <div style={aiContentStyle}>
        {value ||
          "No questions recorded yet."}
      </div>

    </div>
  );
}

/* =====================================================
   VIVA CARD
   ===================================================== */

function VivaCard({
  viva,
  index,
}: {
  viva: VivaStage;
  index: number;
}) {
  const performance =
    Number(
      viva.performancePercentage
    ) || 0;

  return (
    <div style={vivaCardStyle}>

      <div style={vivaHeaderStyle}>

        <div style={vivaHeaderLeftStyle}>
          <strong>
            🎤 Interview #{index + 1}
          </strong>

          {viva.date && (
            <span style={vivaDateStyle}>
              {viva.date}
            </span>
          )}
        </div>

        <span
          style={{
            ...performanceBadgeStyle,
            background:
              performance >= 80
                ? "#dcfce7"
                : performance >= 60
                ? "#fef3c7"
                : performance > 0
                ? "#fee2e2"
                : "#f3f4f6",
            color:
              performance >= 80
                ? "#166534"
                : performance >= 60
                ? "#92400e"
                : performance > 0
                ? "#991b1b"
                : "#6b7280",
          }}
        >
          {performance > 0
            ? `${performance}%`
            : "Not Rated"}
        </span>

      </div>

      <div style={vivaContentStyle}>

        {viva.rehearsal && (
          <VivaField
            label="🤖 AI Rehearsal"
            value={formatValue(
              viva.rehearsal
            )}
          />
        )}

        <VivaListField
          label="✅ Easily Answered Questions"
          items={
            viva.easilyAnsweredQuestions
          }
        />

        <VivaListField
          label="🟡 Partially Answered Questions"
          items={
            viva.partiallyAnsweredQuestions
          }
        />

        <VivaListField
          label="❌ Unknown Questions"
          items={
            viva.unknownQuestions
          }
        />

        <VivaField
          label="💪 Strengths"
          value={
            viva.strengths ||
            "Not recorded."
          }
        />

        <VivaField
          label="⚠️ Weaknesses"
          value={
            viva.weaknesses ||
            "Not recorded."
          }
        />

        <VivaField
          label="📈 Improvement"
          value={
            viva.improvement ||
            "Not recorded."
          }
        />

      </div>
    </div>
  );
}

/* =====================================================
   VIVA FIELD
   ===================================================== */

function VivaField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={vivaFieldStyle}>

      <div style={vivaFieldLabelStyle}>
        {label}
      </div>

      <div style={vivaFieldValueStyle}>
        {value}
      </div>

    </div>
  );
}

/* =====================================================
   VIVA LIST FIELD
   ===================================================== */

function VivaListField({
  label,
  items,
}: {
  label: string;
  items?: string[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div style={vivaFieldStyle}>

      <div style={vivaFieldLabelStyle}>
        {label}
      </div>

      <ul style={listStyle}>
        {items.map(
          (item, index) => (
            <li key={index}>
              {item}
            </li>
          )
        )}
      </ul>

    </div>
  );
}

/* =====================================================
   FORMAT VALUE
   ===================================================== */

function formatValue(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A";
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(
      value,
      null,
      2
    );
  }

  return String(value);
}

/* =====================================================
   EMPTY STATE
   ===================================================== */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div style={emptyStateStyle}>
      {text}
    </div>
  );
}

/* =====================================================
   STYLES
   ===================================================== */

const pageStyle:
  React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #f5f7fb 0%, #eef2f7 100%)",
  padding: "30px 20px",
  fontFamily:
    "Arial, sans-serif",
  boxSizing: "border-box",
};

const containerStyle:
  React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const headerStyle:
  React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "25px 28px",
  marginBottom: "20px",
  boxShadow:
    "0 5px 25px rgba(0,0,0,0.07)",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};

const titleRowStyle:
  React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const titleStyle:
  React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
  color: "#1f2937",
};

const companyStyle:
  React.CSSProperties = {
  margin: "8px 0 4px",
  fontSize: "16px",
  color: "#4b5563",
};

const jobIdStyle:
  React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: "#6b7280",
};

const statusBadgeStyle:
  React.CSSProperties = {
  display: "inline-block",
  padding: "6px 11px",
  borderRadius: "20px",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: "13px",
  fontWeight: 700,
};

const headerActionsStyle:
  React.CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const primaryButtonStyle:
  React.CSSProperties = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#24292f",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle:
  React.CSSProperties = {
  padding: "10px 16px",
  border:
    "1px solid #d0d7de",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#24292f",
  cursor: "pointer",
  fontWeight: 600,
};

const sectionStyle:
  React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow:
    "0 4px 18px rgba(0,0,0,0.05)",
};

const sectionHeaderStyle:
  React.CSSProperties = {
  borderBottom:
    "1px solid #edf0f2",
  paddingBottom: "14px",
  marginBottom: "18px",
};

const sectionTitleStyle:
  React.CSSProperties = {
  margin: 0,
  display: "flex",
  gap: "10px",
  alignItems: "center",
  fontSize: "20px",
  color: "#1f2937",
};

const gridStyle:
  React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const infoCardStyle:
  React.CSSProperties = {
  border:
    "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "14px",
  background: "#fafafa",
};

const infoLabelStyle:
  React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "6px",
  fontWeight: 600,
};

const infoValueStyle:
  React.CSSProperties = {
  fontSize: "15px",
  color: "#111827",
  fontWeight: 600,
  wordBreak: "break-word",
};

const textBoxStyle:
  React.CSSProperties = {
  whiteSpace: "pre-wrap",
  lineHeight: 1.7,
  fontSize: "14px",
  color: "#374151",
  background: "#f9fafb",
  border:
    "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "16px",
  minHeight: "60px",
};

const documentGridStyle:
  React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "12px",
};

const documentCardStyle:
  React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  border:
    "1px solid #e5e7eb",
  borderRadius: "10px",
};

const documentIconStyle:
  React.CSSProperties = {
  fontSize: "22px",
};

const documentLabelStyle:
  React.CSSProperties = {
  fontWeight: 700,
  color: "#1f2937",
  marginBottom: "3px",
};

const otherDocumentsStyle:
  React.CSSProperties = {
  marginTop: "16px",
  padding: "14px",
  background: "#f9fafb",
  borderRadius: "10px",
};

const preparationBlockStyle:
  React.CSSProperties = {
  marginBottom: "20px",
};

const subTitleStyle:
  React.CSSProperties = {
  fontSize: "15px",
  margin: "0 0 8px",
  color: "#374151",
};

const listStyle:
  React.CSSProperties = {
  marginTop: 0,
  lineHeight: 1.8,
};

const emptySmallStyle:
  React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "14px",
};

const aiBlockStyle:
  React.CSSProperties = {
  border:
    "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "12px",
};

const aiTitleStyle:
  React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "15px",
  color: "#1f2937",
};

const aiContentStyle:
  React.CSSProperties = {
  whiteSpace: "pre-wrap",
  lineHeight: 1.7,
  fontSize: "14px",
  color: "#374151",
};

const vivaCardStyle:
  React.CSSProperties = {
  border:
    "1px solid #e5e7eb",
  borderRadius: "12px",
  marginBottom: "14px",
  overflow: "hidden",
};

const vivaHeaderStyle:
  React.CSSProperties = {
  background: "#f8fafc",
  padding: "13px 16px",
  borderBottom:
    "1px solid #e5e7eb",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: "10px",
};

const vivaHeaderLeftStyle:
  React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const vivaDateStyle:
  React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
};

const performanceBadgeStyle:
  React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 700,
};

const vivaContentStyle:
  React.CSSProperties = {
  padding: "16px",
};

const vivaFieldStyle:
  React.CSSProperties = {
  marginBottom: "16px",
};

const vivaFieldLabelStyle:
  React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  marginBottom: "5px",
};

const vivaFieldValueStyle:
  React.CSSProperties = {
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
  color: "#374151",
};

const assessmentBlockStyle:
  React.CSSProperties = {
  marginTop: "20px",
};

const nextActionStyle:
  React.CSSProperties = {
  padding: "18px",
  borderRadius: "10px",
  background: "#eff6ff",
  border:
    "1px solid #bfdbfe",
  color: "#1e40af",
  fontWeight: 700,
  lineHeight: 1.6,
};

const emptyStateStyle:
  React.CSSProperties = {
  padding: "25px",
  textAlign: "center",
  color: "#9ca3af",
  background: "#f9fafb",
  borderRadius: "10px",
};

const footerStyle:
  React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  gap: "10px",
  marginTop: "10px",
  padding: "20px 0 40px",
  flexWrap: "wrap",
};

export default JobDetails;