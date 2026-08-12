import { useState } from "react";
import {
  createRepositoryFile,
} from "../github/githubRepo";
import type { JobApplication } from "../types/job";

interface AddJobProps {
  jobId: string; // ← Auto-generated from parent
  onCancel: () => void;
  onCreated: (newJob?: JobApplication) => void | Promise<void>;
}

function AddJob({ jobId, onCancel, onCreated }: AddJobProps) {
  const today = new Date().toISOString().split("T")[0];

  /* =========================================================
     BASIC INFORMATION
     ========================================================= */
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [jobType, setJobType] = useState("Relocate");
  const [applicationDate, setApplicationDate] = useState(today);
  const [status, setStatus] = useState("Applied");

  /* =========================================================
     OPTIONAL JOB INFORMATION
     ========================================================= */
  const [jobSource, setJobSource] = useState("");
  const [recruiter, setRecruiter] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jd, setJd] = useState("");
  const [priority, setPriority] = useState("Medium");

  /* =========================================================
     UI STATE
     ========================================================= */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     SUBMIT
     ========================================================= */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // 🔥 FIX: Use the prop directly (already auto-generated)
    const cleanId = jobId;

    // Validation
    if (!designation.trim()) {
      setError("Please enter designation.");
      return;
    }
    if (!company.trim()) {
      setError("Please enter company name.");
      return;
    }
    if (!country.trim()) {
      setError("Please enter country.");
      return;
    }
    if (!applicationDate) {
      setError("Please enter application date.");
      return;
    }

    try {
      setLoading(true);

      /* =====================================================
         BASIC DATA
         ===================================================== */
      const job: JobApplication = {
        id: cleanId,
        designation: designation.trim(),
        company: company.trim(),
        country: country.trim(),
        jobType,
        applicationDate,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Optional fields
        jobSource: jobSource.trim() || undefined,
        recruiter: recruiter.trim() || undefined,
        jobUrl: jobUrl.trim() || undefined,
        jd: jd.trim() || undefined,
        priority: priority || undefined,
        // Initialize empty arrays/objects for future use
        preparation: { newTopics: [], knownTopics: [], cvAlignment: [] },
        aiQuestions: {},
        viva1: {},
        viva2: {},
        viva3: {},
        viva4: {},
        viva5: {},
        compensation: {},
        followUp: {},
        final: {},
        documentsSubmitted: {},
        customFields: [],
      };

      await createRepositoryFile(
        `jobs/${cleanId}.json`,
        job,
        `Add job ${cleanId} - ${designation.trim()}`
      );

      // Pass the new job back to parent
      await onCreated(job);
    } catch (err) {
      console.error("Failed to create job:", err);
      setError(err instanceof Error ? err.message : "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.07)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#777",
                marginBottom: "6px",
                fontWeight: 600,
              }}
            >
              JOB APPLICATION TRACKER
            </div>
            <h1 style={{ margin: 0 }}>➕ Add New Job</h1>
            <p style={{ color: "#666", marginBottom: 0 }}>
              Create a new job application. <strong>Job ID: {jobId}</strong> (Auto-generated)
            </p>
          </div>
          <button type="button" onClick={onCancel} disabled={loading} style={secondaryButton}>
            ← Back
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "13px 15px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* BASIC INFORMATION */}
          <section
            style={{
              marginBottom: "20px",
              padding: "22px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <h2 style={{ margin: "0 0 7px", fontSize: "19px", color: "#111827" }}>
              📌 Basic Information
            </h2>
            <p style={{ margin: "0 0 18px", color: "#6b7280", fontSize: "13px" }}>
              These are the minimum details required to create a job.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
              }}
            >
              {/* 🔥 FIX: Job ID is now READ-ONLY and AUTO-GENERATED */}
              <FormField
                label="Job ID"
                required
                value={jobId}
                onChange={() => {}}
                readOnly
              />

              <FormField
                label="Designation"
                required
                value={designation}
                onChange={setDesignation}
                placeholder="Senior Data Engineer"
              />

              <FormField
                label="Company"
                required
                value={company}
                onChange={setCompany}
                placeholder="ABC Company"
              />

              <FormField
                label="Country"
                required
                value={country}
                onChange={setCountry}
                placeholder="Saudi Arabia"
              />

              <SelectField
                label="Job Type"
                value={jobType}
                onChange={setJobType}
                options={["Remote", "Relocate", "Hybrid", "Local", "On-site", "Contract"]}
              />

              <FormField
                label="Application Date"
                required
                value={applicationDate}
                onChange={setApplicationDate}
                type="date"
              />

              <SelectField
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  "Applied",
                  "HR Screening",
                  "Screening",
                  "Interview",
                  "Technical Interview",
                  "Final Interview",
                  "Offer",
                  "Selected",
                  "Rejected",
                  "Withdrawn",
                  "On Hold",
                ]}
              />

              <SelectField
                label="Priority"
                value={priority}
                onChange={setPriority}
                options={["High", "Medium", "Low"]}
              />
            </div>
          </section>

          {/* OPTIONAL JOB INFORMATION */}
          <section
            style={{
              marginBottom: "20px",
              padding: "22px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <h2 style={{ margin: "0 0 7px", fontSize: "19px", color: "#111827" }}>
              📝 Job Information
            </h2>
            <p style={{ margin: "0 0 18px", color: "#6b7280", fontSize: "13px" }}>
              Optional information. You can add these details now or later.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "18px",
              }}
            >
              <SelectField
                label="Job Source"
                value={jobSource}
                onChange={setJobSource}
                options={[
                  "",
                  "LinkedIn",
                  "Indeed",
                  "Bayt",
                  "Glassdoor",
                  "Company Website",
                  "Recruiter",
                  "Referral",
                  "Other",
                ]}
              />

              <FormField
                label="Recruiter"
                value={recruiter}
                onChange={setRecruiter}
                placeholder="Recruiter name"
              />

              <FormField
                label="Job URL"
                value={jobUrl}
                onChange={setJobUrl}
                placeholder="https://..."
              />
            </div>

            {/* JD */}
            <div style={{ marginTop: "20px" }}>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "13px",
                }}
              >
                <span style={{ fontWeight: 600, color: "#374151" }}>Job Description</span>
                <textarea
                  value={jd}
                  onChange={(event) => setJd(event.target.value)}
                  placeholder="Paste the complete job description here..."
                  rows={9}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px",
                    border: "1px solid #d0d7de",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "#ffffff",
                    color: "#111827",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </label>
            </div>
          </section>

          {/* INFO FLOW */}
          <section
            style={{
              marginBottom: "20px",
              padding: "20px",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              background: "#eff6ff",
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "8px", fontWeight: 700 }}>
              💡 Data can be added gradually
            </div>
            <div style={{ color: "#4b5563", lineHeight: 1.7, fontSize: "14px" }}>
              <div>
                <strong>Stage 1:</strong> Create the job with only basic information.
              </div>
              <div>
                <strong>Stage 2:</strong> Add JD, recruiter, source and documents when available.
              </div>
              <div>
                <strong>Stage 3:</strong> Add preparation and AI generated questions.
              </div>
              <div>
                <strong>Stage 4:</strong> Add Viva information after each interview.
              </div>
              <div>
                <strong>Stage 5:</strong> Add compensation, follow-up and final assessment later.
              </div>
            </div>
          </section>

          {/* SUBMIT */}
          <div
            style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: "1px solid #eee",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button type="button" onClick={onCancel} disabled={loading} style={secondaryButton}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 20px",
                border: "none",
                borderRadius: "8px",
                background: "#24292f",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {loading ? "💾 Creating..." : "🚀 Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   FORM FIELD
   ========================================================= */
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        fontSize: "13px",
      }}
    >
      <span style={{ fontWeight: 600, color: "#374151" }}>
        {label}
        {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border: "1px solid #d0d7de",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          background: readOnly ? "#f3f4f6" : "#ffffff",
          color: readOnly ? "#4b5563" : "#111827",
          cursor: readOnly ? "not-allowed" : "text",
        }}
      />
    </label>
  );
}

/* =========================================================
   SELECT FIELD
   ========================================================= */
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        fontSize: "13px",
      }}
    >
      <span style={{ fontWeight: 600, color: "#374151" }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border: "1px solid #d0d7de",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          background: "#ffffff",
          color: "#111827",
        }}
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || "Not specified"}
          </option>
        ))}
      </select>
    </label>
  );
}

const secondaryButton: React.CSSProperties = {
  padding: "11px 18px",
  border: "1px solid #d0d7de",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#24292f",
  cursor: "pointer",
  fontWeight: 600,
};

export default AddJob;