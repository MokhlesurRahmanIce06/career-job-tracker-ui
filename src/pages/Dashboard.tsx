import { useEffect, useState } from "react";
import {
  readAllJobs,
  updateJob,
} from "../github/githubRepo";
import AddJob from "./AddJob";
import EditJob from "./EditJob";
import type { JobApplication } from "../types/job";

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => {
    void loadJobs(true);
  }, []);

  /* =====================================================
     SORT
     ===================================================== */
  const sortJobs = (data: JobApplication[]): JobApplication[] => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.applicationDate || a.createdAt || "").getTime();
      const dateB = new Date(b.applicationDate || b.createdAt || "").getTime();
      return dateB - dateA;
    });
  };

  /* =====================================================
     GENERATE NEXT JOB ID (Auto Increment)
     ===================================================== */
  const generateNextJobId = (existingJobs: JobApplication[]): string => {
    if (!existingJobs || existingJobs.length === 0) {
      return "JOB-00001";
    }

    const numbers = existingJobs
      .map((job) => {
        const match = job.id?.match(/(\d+)$/);
        return match ? Number(match[1]) : 0;
      })
      .filter((num) => num > 0);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `JOB-${String(maxNumber + 1).padStart(5, "0")}`;
  };

  /* =====================================================
     LOAD JOBS
     ===================================================== */
  const loadJobs = async (initialLoad = false) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError("");

      const data = await readAllJobs<JobApplication>();
      const sortedJobs = sortJobs(data);
      setJobs(sortedJobs);

      setSelectedJob((currentSelected) => {
        if (!currentSelected) {
          return sortedJobs.length > 0 ? sortedJobs[0] : null;
        }
        const refreshedSelected = sortedJobs.find(
          (job) => job.id === currentSelected.id
        );
        return refreshedSelected || (sortedJobs.length > 0 ? sortedJobs[0] : null);
      });
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs from GitHub.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     ADD JOB
     ===================================================== */
  const handleJobCreated = async (newJob?: JobApplication) => {
    setShowAddJob(false);
    if (newJob) {
      setJobs((currentJobs) => {
        const exists = currentJobs.some((job) => job.id === newJob.id);
        if (exists) {
          return sortJobs(currentJobs.map((job) => (job.id === newJob.id ? newJob : job)));
        }
        return sortJobs([newJob, ...currentJobs]);
      });
      setSelectedJob(newJob);
    }
    await loadJobs(false);
  };

  /* =====================================================
     UPDATE JOB
     ===================================================== */
  const handleJobUpdated = async (updatedJob: JobApplication) => {
    try {
      setSavingJob(true);
      setError("");

      const jobToSave: JobApplication = {
        ...updatedJob,
        createdAt: updatedJob.createdAt || selectedJob?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateJob(jobToSave);

      setJobs((currentJobs) =>
        sortJobs(currentJobs.map((job) => (job.id === jobToSave.id ? jobToSave : job)))
      );
      setSelectedJob(jobToSave);
      setShowEditJob(false);
      alert(`✅ ${jobToSave.id} updated successfully on GitHub.`);
    } catch (err) {
      console.error("Failed to update job:", err);
      setError(err instanceof Error ? err.message : "Failed to update job on GitHub.");
    } finally {
      setSavingJob(false);
    }
  };

  /* =====================================================
     OPEN EDIT
     ===================================================== */
  const handleEditJob = () => {
    if (!selectedJob) return;
    const freshJob = JSON.parse(JSON.stringify(selectedJob)) as JobApplication;
    setSelectedJob(freshJob);
    setShowEditJob(true);
  };

  /* =====================================================
     EDIT SCREEN
     ===================================================== */
  if (showEditJob && selectedJob) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f7fb" }}>
        <EditJob
          key={`edit-${selectedJob.id}`}
          job={selectedJob}
          onCancel={() => setShowEditJob(false)}
          onSave={handleJobUpdated}
        />
        {savingJob && (
          <div
            style={{
              position: "fixed",
              right: "20px",
              bottom: "20px",
              background: "#24292f",
              color: "#fff",
              padding: "12px 18px",
              borderRadius: "10px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              zIndex: 9999,
              fontWeight: 600,
            }}
          >
            💾 Saving...
          </div>
        )}
      </div>
    );
  }

  /* =====================================================
     ADD JOB SCREEN
     ===================================================== */
  if (showAddJob) {
    const nextJobId = generateNextJobId(jobs);

    return (
      <AddJob
        key={`add-${Date.now()}`}
        jobId={nextJobId}
        onCancel={() => setShowAddJob(false)}
        onCreated={handleJobCreated}
      />
    );
  }

  /* =====================================================
     LOADING
     ===================================================== */
  if (loading) {
    return (
      <PageCenter>
        <div style={{ fontSize: "45px" }}>🔄</div>
        <h2>Loading Career Data</h2>
        <p style={{ color: "#666" }}>Reading all jobs from your private GitHub repository...</p>
      </PageCenter>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */
  if (error) {
    return (
      <PageCenter>
        <h2>⚠️ Failed to Load Jobs</h2>
        <p style={{ color: "#b00020", maxWidth: "600px" }}>{error}</p>
        <button onClick={() => void loadJobs(false)} style={primaryButton}>
          Retry
        </button>
        <button onClick={onLogout} style={secondaryButton}>
          Logout
        </button>
      </PageCenter>
    );
  }

  /* =====================================================
     DASHBOARD
     ===================================================== */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#24292f",
          color: "#ffffff",
          padding: "18px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>💼 Mokhlesur Career Job Tracker</h2>
          <div style={{ fontSize: "13px", opacity: 0.75, marginTop: "5px" }}>
            GitHub-powered Career Management
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: "9px 16px",
            border: "1px solid #ffffff55",
            borderRadius: "7px",
            background: "transparent",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 20px" }}>
        {/* TITLE */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Career Dashboard</h1>
            <p style={{ color: "#666" }}>
              All job applications are loaded directly from your private GitHub repository.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {refreshing && <span style={{ color: "#666", fontSize: "12px" }}>🔄 Syncing GitHub...</span>}
            {savingJob && <span style={{ color: "#2563eb", fontSize: "12px" }}>💾 Saving...</span>}
            <button onClick={() => setShowAddJob(true)} style={primaryButton}>
              ➕ Add New Job
            </button>
            <button onClick={() => void loadJobs(false)} style={secondaryButton}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* KPI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <KpiCard title="Total Applications" value={jobs.length} icon="📊" />
          <KpiCard
            title="Applied"
            value={jobs.filter((job) => job.status?.toLowerCase() === "applied").length}
            icon="📨"
          />
          <KpiCard
            title="Interview"
            value={jobs.filter((job) => job.status?.toLowerCase().includes("interview")).length}
            icon="🎤"
          />
          <KpiCard
            title="Offer"
            value={jobs.filter((job) => job.status?.toLowerCase().includes("offer")).length}
            icon="🎉"
          />
          <KpiCard
            title="Selected"
            value={jobs.filter((job) => job.status?.toLowerCase() === "selected").length}
            icon="🏆"
          />
        </div>

        {/* JOB LIST + DETAILS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(300px, 380px) minmax(0, 1fr)",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* LEFT - Job List */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>📋 Applications</h3>
              <span style={{ fontSize: "12px", color: "#666" }}>{jobs.length} jobs</span>
            </div>

            {jobs.length === 0 ? (
              <div style={{ padding: "30px 10px", textAlign: "center", color: "#777" }}>
                <div style={{ fontSize: "35px" }}>📭</div>
                <p>No job applications found.</p>
                <button onClick={() => setShowAddJob(true)} style={primaryButton}>
                  Add First Job
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => {
                    const freshJob = JSON.parse(JSON.stringify(job)) as JobApplication;
                    setSelectedJob(freshJob);
                    setShowEditJob(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: selectedJob?.id === job.id ? "2px solid #24292f" : "1px solid #e5e7eb",
                    background: selectedJob?.id === job.id ? "#f6f8fa" : "#ffffff",
                    borderRadius: "10px",
                    padding: "14px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <strong>{job.designation}</strong>
                    <span style={{ fontSize: "11px", color: "#666" }}>{job.id}</span>
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "14px" }}>🏢 {job.company || "Company not specified"}</div>
                  <div style={{ marginTop: "4px", color: "#666", fontSize: "13px" }}>
                    📍 {job.country || "Country not specified"}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 9px",
                        borderRadius: "12px",
                        background: "#e7f5e9",
                        color: "#176b2c",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {job.status || "Unknown"}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 9px",
                        borderRadius: "12px",
                        background: "#eef2ff",
                        color: "#3730a3",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {job.jobType || "Not specified"}
                    </span>
                  </div>
                </button>
              ))
            )}
          </section>

          {/* RIGHT - Job Details */}
          <section>
            {selectedJob ? (
              <JobDetails job={selectedJob} onEdit={handleEditJob} />
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  padding: "50px",
                  borderRadius: "14px",
                  textAlign: "center",
                  color: "#777",
                }}
              >
                Select a job application.
              </div>
            )}
          </section>
        </div>

        {/* REPOSITORY */}
        <section
          style={{
            marginTop: "25px",
            background: "#24292f",
            color: "#ffffff",
            borderRadius: "14px",
            padding: "22px",
          }}
        >
          <strong>🗂️ GitHub Data Repository</strong>
          <div style={{ marginTop: "8px", fontFamily: "monospace", fontSize: "13px" }}>
            MokhlesurRahmanIce06 / career-job-tracker-data
          </div>
          <div style={{ marginTop: "5px", fontSize: "12px", opacity: 0.7 }}>Source: jobs/*.json</div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   JOB DETAILS (সম্পূর্ণ কম্পোনেন্ট)
   ========================================================= */

function JobDetails({
  job,
  onEdit,
}: {
  job: JobApplication;
  onEdit: () => void;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "28px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: "#777", fontSize: "12px", fontFamily: "monospace" }}>{job.id}</div>
          <h2 style={{ margin: "5px 0" }}>{job.designation || "Designation not specified"}</h2>
          <strong>🏢 {job.company || "Company not specified"}</strong>
          <div style={{ color: "#666", marginTop: "5px" }}>📍 {job.country || "Country not specified"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              background: "#e7f5e9",
              color: "#176b2c",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            {job.status || "Unknown"}
          </span>
          <button type="button" onClick={onEdit} style={primaryButton}>
            ✏️ Edit Job
          </button>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "22px 0" }} />

      {/* JOB INFORMATION */}
      <DetailSection title="📌 Job Information">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <InfoCard title="Job Type" value={job.jobType || "Not specified"} />
          <InfoCard title="Source" value={job.jobSource || "Not specified"} />
          <InfoCard title="Application Date" value={job.applicationDate || "Not specified"} />
          <InfoCard title="Recruiter" value={job.recruiter || "Not specified"} />
          <InfoCard title="Job URL" value={job.jobUrl || "Not specified"} />
          <InfoCard title="Priority" value={job.priority || "Not specified"} />
        </div>
      </DetailSection>

      {/* JD */}
      <DetailSection title="📝 Job Description">
        <ContentBox value={job.jd || "No job description saved."} />
      </DetailSection>

      {/* DOCUMENTS */}
      <DetailSection title="📄 Documents Submitted">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <Badge label="Resume" active={!!job.documentsSubmitted?.resume} />
          <Badge label="Cover Letter" active={!!job.documentsSubmitted?.coverLetter} />
          <Badge label="Portfolio" active={!!job.documentsSubmitted?.portfolio} />
          <Badge label="Certificates" active={!!job.documentsSubmitted?.certificates} />
        </div>
        <div style={{ marginTop: "14px" }}>
          <strong>Other Documents</strong>
          {job.documentsSubmitted?.other?.length ? (
            <TagGroup title="" items={job.documentsSubmitted.other} />
          ) : (
            <div style={{ marginTop: "6px", color: "#999", fontSize: "13px" }}>None</div>
          )}
        </div>
      </DetailSection>

      {/* PREPARATION */}
      <DetailSection title="🎯 Preparation">
        <TagGroup title="New Topics from JD" items={job.preparation?.newTopics || []} />
        <TagGroup title="Known Topics" items={job.preparation?.knownTopics || []} />
        <TagGroup title="Job Related Study / CV Alignment" items={job.preparation?.cvAlignment || []} />
      </DetailSection>

      {/* AI QUESTIONS */}
      <DetailSection title="🤖 AI Generated Q&A">
        <AIItem name="ChatGPT" value={job.aiQuestions?.chatgpt} />
        <AIItem name="DeepSeek" value={job.aiQuestions?.deepseek} />
        <AIItem name="Grok" value={job.aiQuestions?.grok} />
        <AIItem name="Gemini" value={job.aiQuestions?.gemini} />
        <AIItem name="Copilot" value={job.aiQuestions?.copilot} />
        <AIItem name="Claude" value={job.aiQuestions?.claude} />
        <AIItem name="Consolidated" value={job.aiQuestions?.consolidated} />
      </DetailSection>

      {/* VIVA */}
      <VivaDetails number={1} viva={job.viva1} />
      <VivaDetails number={2} viva={job.viva2} />
      <VivaDetails number={3} viva={job.viva3} />
      <VivaDetails number={4} viva={job.viva4} />
      <VivaDetails number={5} viva={job.viva5} />

      {/* COMPENSATION */}
      <DetailSection title="💰 Compensation">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <InfoCard title="Expected Salary" value={job.compensation?.expectedSalary || "Not specified"} />
          <InfoCard title="Offered Salary" value={job.compensation?.offeredSalary || "Not specified"} />
        </div>
      </DetailSection>

      {/* FOLLOW UP */}
      <DetailSection title="📅 Follow-up">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <InfoCard title="Follow-up Date" value={job.followUp?.followUpDate || "Not specified"} />
          <InfoCard title="Follow-up Status" value={job.followUp?.followUpStatus || "Not specified"} />
        </div>
      </DetailSection>

      {/* NEXT ACTION */}
      <DetailSection title="🚀 Next Action">
        <ContentBox value={job.nextAction || "No next action specified."} />
      </DetailSection>

      {/* FINAL ASSESSMENT */}
      <DetailSection title="🏁 Final Assessment">
        <InfoRow label="Final Result" value={job.final?.result || "Not available"} />
        <InfoRow label="Result Date" value={job.final?.resultDate || "Not available"} />
        <InfoRow label="Full Experience" value={job.final?.fullExperience || "Not available"} />
        <InfoRow label="Final Recommendation / Upgrade Plan" value={job.final?.finalRecommendation || "Not available"} />
      </DetailSection>

      {/* CUSTOM FIELDS */}
      {job.customFields && job.customFields.length > 0 && (
        <DetailSection title="🧩 Custom Fields">
          {job.customFields.map((field) => (
            <InfoRow key={field.id} label={field.name || "Custom Field"} value={field.value || "Empty"} />
          ))}
        </DetailSection>
      )}

      {/* RECORD INFO */}
      <DetailSection title="🕒 Record Information">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <InfoCard title="Created At" value={job.createdAt || "Not available"} />
          <InfoCard title="Updated At" value={job.updatedAt || "Not available"} />
        </div>
      </DetailSection>
    </div>
  );
}

/* =========================================================
   VIVA DETAILS
   ========================================================= */

function VivaDetails({
  number,
  viva,
}: {
  number: number;
  viva: JobApplication["viva1"];
}) {
  const hasData =
    !!viva &&
    (!!viva.date ||
      Number(viva?.performancePercentage) > 0 ||
      !!viva?.rehearsal?.chatgpt ||
      !!viva?.rehearsal?.deepseek ||
      !!viva?.rehearsal?.grok ||
      !!viva?.rehearsal?.gemini ||
      !!viva?.rehearsal?.copilot ||
      !!viva?.rehearsal?.claude ||
      !!viva?.easilyAnsweredQuestions?.length ||
      !!viva?.partiallyAnsweredQuestions?.length ||
      !!viva?.unknownQuestions?.length ||
      !!viva?.strengths ||
      !!viva?.weaknesses ||
      !!viva?.improvement);

  if (!hasData) {
    return null;
  }

  return (
    <DetailSection title={`🎤 Viva ${number}`}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "15px",
        }}
      >
        <InfoCard title="Date" value={viva?.date || "Not specified"} />
        <InfoCard title="Performance" value={`${Number(viva?.performancePercentage) || 0}%`} />
      </div>

      <DetailSection title="🎙️ AI Rehearsal">
        <AIItem name="ChatGPT" value={viva?.rehearsal?.chatgpt} />
        <AIItem name="DeepSeek" value={viva?.rehearsal?.deepseek} />
        <AIItem name="Grok" value={viva?.rehearsal?.grok} />
        <AIItem name="Gemini" value={viva?.rehearsal?.gemini} />
        <AIItem name="Copilot" value={viva?.rehearsal?.copilot} />
        <AIItem name="Claude" value={viva?.rehearsal?.claude} />
      </DetailSection>

      <QuestionGroup title="✅ Easily Answered" items={viva?.easilyAnsweredQuestions || []} />
      <QuestionGroup title="🟡 Partially Answered" items={viva?.partiallyAnsweredQuestions || []} />
      <QuestionGroup title="🔴 Unknown Questions" items={viva?.unknownQuestions || []} />

      <InfoRow label="💪 Strengths" value={viva?.strengths || "Not recorded"} />
      <InfoRow label="⚠️ Weaknesses" value={viva?.weaknesses || "Not recorded"} />
      <InfoRow label="🚀 Improvement" value={viva?.improvement || "Not recorded"} />
    </DetailSection>
  );
}

/* =========================================================
   QUESTION GROUP
   ========================================================= */

function QuestionGroup({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <strong>{title}</strong>
      {items.length === 0 ? (
        <div style={{ color: "#999", fontSize: "12px", marginTop: "6px" }}>None</div>
      ) : (
        <ol style={{ marginTop: "7px", paddingLeft: "22px" }}>
          {items.map((item, index) => (
            <li key={`${index}-${item}`} style={{ marginBottom: "6px", lineHeight: 1.5 }}>
              {item}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* =========================================================
   HELPER COMPONENTS
   ========================================================= */

function PageCenter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: "25px" }}>{icon}</div>
      <div style={{ marginTop: "10px", fontSize: "28px", fontWeight: 700 }}>{value}</div>
      <div style={{ marginTop: "4px", color: "#666", fontSize: "13px" }}>{title}</div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: "#f6f8fa", padding: "13px", borderRadius: "8px" }}>
      <div style={{ color: "#777", fontSize: "11px", marginBottom: "5px" }}>{title}</div>
      <strong style={{ wordBreak: "break-word" }}>{value}</strong>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "25px" }}>
      <h3 style={{ marginBottom: "12px" }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function ContentBox({ value }: { value: string }) {
  return (
    <div
      style={{
        background: "#f6f8fa",
        border: "1px solid #e5e7eb",
        borderRadius: "9px",
        padding: "15px",
        whiteSpace: "pre-wrap",
        lineHeight: 1.6,
        color: value ? "#444" : "#999",
        minHeight: "45px",
        wordBreak: "break-word",
      }}
    >
      {value}
    </div>
  );
}

function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      style={{
        padding: "7px 11px",
        borderRadius: "15px",
        background: active ? "#e7f5e9" : "#f1f1f1",
        color: active ? "#176b2c" : "#777",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {active ? "✓" : "○"} {label}
    </span>
  );
}

function TagGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      {title && <strong>{title}</strong>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: title ? "7px" : "0" }}>
        {!items || items.length === 0 ? (
          <span style={{ color: "#999", fontSize: "12px" }}>None</span>
        ) : (
          items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              style={{
                padding: "6px 10px",
                background: "#f1f5ff",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function AIItem({ name, value }: { name: string; value?: string }) {
  return (
    <div
      style={{
        marginBottom: "12px",
        padding: "13px",
        background: "#f6f8fa",
        borderRadius: "9px",
        border: "1px solid #e5e7eb",
      }}
    >
      <strong>{name}</strong>
      <div
        style={{
          marginTop: "7px",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
          color: value ? "#444" : "#999",
          wordBreak: "break-word",
        }}
      >
        {value || "Not prepared yet"}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "13px", marginBottom: "10px", background: "#f6f8fa", borderRadius: "8px" }}>
      <div style={{ color: "#777", fontSize: "12px", fontWeight: 600, marginBottom: "5px" }}>{label}</div>
      <div
        style={{
          whiteSpace: "pre-wrap",
          color: value ? "#444" : "#999",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   BUTTONS
   ========================================================= */

const primaryButton: React.CSSProperties = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#24292f",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButton: React.CSSProperties = {
  padding: "11px 18px",
  border: "1px solid #d0d7de",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#24292f",
  cursor: "pointer",
  fontWeight: 600,
};

export default Dashboard;