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
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  /* =====================================================
     WINDOW SIZE FOR RESPONSIVE
     ===================================================== */
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  /* =====================================================
     SEARCH / FILTER STATE
     ===================================================== */
  const [searchDesignation, setSearchDesignation] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchJobType, setSearchJobType] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchPriority, setSearchPriority] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");

  const [isFilterActive, setIsFilterActive] = useState(false);

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
     FILTER JOBS
     ===================================================== */
  const filterJobs = (jobsToFilter: JobApplication[]) => {
    let filtered = [...jobsToFilter];

    if (searchDesignation.trim()) {
      const keyword = searchDesignation.trim().toLowerCase();
      filtered = filtered.filter((job) =>
        job.designation?.toLowerCase().includes(keyword)
      );
    }

    if (searchCompany.trim()) {
      const keyword = searchCompany.trim().toLowerCase();
      filtered = filtered.filter((job) =>
        job.company?.toLowerCase().includes(keyword)
      );
    }

    if (searchCountry.trim()) {
      const keyword = searchCountry.trim().toLowerCase();
      filtered = filtered.filter((job) =>
        job.country?.toLowerCase().includes(keyword)
      );
    }

    if (searchJobType) {
      filtered = filtered.filter((job) => job.jobType === searchJobType);
    }

    if (searchStatus) {
      filtered = filtered.filter((job) => job.status === searchStatus);
    }

    if (searchPriority) {
      filtered = filtered.filter((job) => job.priority === searchPriority);
    }

    if (searchDateFrom) {
      const fromDate = new Date(searchDateFrom);
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.applicationDate || job.createdAt || "");
        return jobDate >= fromDate;
      });
    }

    if (searchDateTo) {
      const toDate = new Date(searchDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.applicationDate || job.createdAt || "");
        return jobDate <= toDate;
      });
    }

    return sortJobs(filtered);
  };

  /* =====================================================
     APPLY FILTER
     ===================================================== */
  const applyFilter = () => {
    const filtered = filterJobs(jobs);
    setFilteredJobs(filtered);
    setIsFilterActive(
      !!(searchDesignation || searchCompany || searchCountry || 
         searchJobType || searchStatus || searchPriority || 
         searchDateFrom || searchDateTo)
    );

    if (selectedJob) {
      const stillExists = filtered.some((job) => job.id === selectedJob.id);
      if (!stillExists) {
        setSelectedJob(filtered.length > 0 ? filtered[0] : null);
      }
    } else {
      setSelectedJob(filtered.length > 0 ? filtered[0] : null);
    }
  };

  /* =====================================================
     CLEAR FILTER
     ===================================================== */
  const clearFilter = () => {
    setSearchDesignation("");
    setSearchCompany("");
    setSearchCountry("");
    setSearchJobType("");
    setSearchStatus("");
    setSearchPriority("");
    setSearchDateFrom("");
    setSearchDateTo("");
    setIsFilterActive(false);
    setFilteredJobs(sortJobs(jobs));
    
    if (jobs.length > 0) {
      setSelectedJob(jobs[0]);
    } else {
      setSelectedJob(null);
    }
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
      setFilteredJobs(sortedJobs);

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
      setTimeout(() => applyFilter(), 100);
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
      
      setTimeout(() => applyFilter(), 100);
      
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
  const displayJobs = isFilterActive ? filteredJobs : jobs;

  // Responsive styles
  const headerFlexDirection = isMobile ? "column" : "row";
  const headerGap = isMobile ? "10px" : "0";
  const filterColumns = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr";
  const kpiColumns = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr";
  const mainLayout = isMobile ? "column" : "row";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER - Responsive */}
      <header
        style={{
          background: "#24292f",
          color: "#ffffff",
          padding: isMobile ? "15px 20px" : "18px 30px",
          display: "flex",
          flexDirection: headerFlexDirection as any,
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: headerGap,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? "16px" : "24px" }}>
            💼 Mokhlesur Career Job Tracker
          </h2>
          <div style={{ fontSize: isMobile ? "11px" : "13px", opacity: 0.75, marginTop: "3px" }}>
            GitHub-powered Career Management
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: isMobile ? "6px 12px" : "9px 16px",
            border: "1px solid #ffffff55",
            borderRadius: "7px",
            background: "transparent",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "12px 10px" : "30px 20px" }}>
        {/* TITLE - Responsive */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? "10px" : "20px",
            marginBottom: isMobile ? "15px" : "25px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? "20px" : "32px" }}>
              Career Dashboard
            </h1>
            <p style={{ color: "#666", fontSize: isMobile ? "12px" : "14px", margin: "4px 0 0" }}>
              All job applications are loaded directly from your private GitHub repository.
              {isFilterActive && (
                <span style={{ color: "#2563eb", marginLeft: "8px", display: "inline-block" }}>
                  🔍 {filteredJobs.length} results found
                </span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {refreshing && <span style={{ color: "#666", fontSize: "11px" }}>🔄 Syncing...</span>}
            {savingJob && <span style={{ color: "#2563eb", fontSize: "11px" }}>💾 Saving...</span>}
            <button onClick={() => setShowAddJob(true)} style={{ ...primaryButton, padding: isMobile ? "6px 12px" : "11px 18px", fontSize: isMobile ? "12px" : "14px" }}>
              ➕ Add
            </button>
            <button onClick={() => void loadJobs(false)} style={{ ...secondaryButton, padding: isMobile ? "6px 12px" : "11px 18px", fontSize: isMobile ? "12px" : "14px" }}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* SEARCH / FILTER BAR - Fully Responsive */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: isMobile ? "12px" : "20px",
            marginBottom: isMobile ? "15px" : "25px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: filterColumns,
              gap: isMobile ? "8px" : "12px",
              marginBottom: isMobile ? "8px" : "12px",
            }}
          >
            <FilterInput
              label="Designation"
              value={searchDesignation}
              onChange={setSearchDesignation}
              placeholder="Search..."
              isMobile={isMobile}
            />
            <FilterInput
              label="Company"
              value={searchCompany}
              onChange={setSearchCompany}
              placeholder="Search..."
              isMobile={isMobile}
            />
            <FilterInput
              label="Country"
              value={searchCountry}
              onChange={setSearchCountry}
              placeholder="Search..."
              isMobile={isMobile}
            />
            <FilterSelect
              label="Job Type"
              value={searchJobType}
              onChange={setSearchJobType}
              options={["", "Remote", "Relocate", "Hybrid", "Local", "On-site", "Contract"]}
              isMobile={isMobile}
            />
            <FilterSelect
              label="Status"
              value={searchStatus}
              onChange={setSearchStatus}
              options={[
                "",
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
              isMobile={isMobile}
            />
            <FilterSelect
              label="Priority"
              value={searchPriority}
              onChange={setSearchPriority}
              options={["", "High", "Medium", "Low"]}
              isMobile={isMobile}
            />
            <FilterInput
              label="Date From"
              value={searchDateFrom}
              onChange={setSearchDateFrom}
              type="date"
              isMobile={isMobile}
            />
            <FilterInput
              label="Date To"
              value={searchDateTo}
              onChange={setSearchDateTo}
              type="date"
              isMobile={isMobile}
            />
          </div>

          {/* Action Buttons - Responsive */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: isMobile ? "stretch" : "flex-end",
              borderTop: "1px solid #e5e7eb",
              paddingTop: isMobile ? "8px" : "12px",
            }}
          >
            <button
              onClick={applyFilter}
              style={{
                padding: isMobile ? "8px 12px" : "9px 20px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: isMobile ? "12px" : "13px",
                flex: isMobile ? "1" : "0",
                minWidth: isMobile ? "80px" : "auto",
              }}
            >
              🔍 Apply Filter
            </button>

            {isFilterActive && (
              <button
                onClick={clearFilter}
                style={{
                  padding: isMobile ? "8px 12px" : "9px 20px",
                  border: "1px solid #dc2626",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: isMobile ? "12px" : "13px",
                  flex: isMobile ? "1" : "0",
                  minWidth: isMobile ? "80px" : "auto",
                }}
              >
                ✕ Clear All
              </button>
            )}
          </div>

          {/* Active Filter Tags - Responsive */}
          {isFilterActive && (
            <div
              style={{
                marginTop: isMobile ? "8px" : "10px",
                fontSize: isMobile ? "10px" : "11px",
                color: "#666",
                display: "flex",
                flexWrap: "wrap",
                gap: isMobile ? "4px" : "6px",
              }}
            >
              <span>Active:</span>
              {searchDesignation && <span style={filterTagStyle}>Des: {searchDesignation}</span>}
              {searchCompany && <span style={filterTagStyle}>Co: {searchCompany}</span>}
              {searchCountry && <span style={filterTagStyle}>Country: {searchCountry}</span>}
              {searchJobType && <span style={filterTagStyle}>Type: {searchJobType}</span>}
              {searchStatus && <span style={filterTagStyle}>Status: {searchStatus}</span>}
              {searchPriority && <span style={filterTagStyle}>Priority: {searchPriority}</span>}
              {searchDateFrom && <span style={filterTagStyle}>From: {searchDateFrom}</span>}
              {searchDateTo && <span style={filterTagStyle}>To: {searchDateTo}</span>}
            </div>
          )}
        </div>

        {/* KPI - Responsive Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: kpiColumns,
            gap: isMobile ? "8px" : "15px",
            marginBottom: isMobile ? "15px" : "25px",
          }}
        >
          <KpiCard title="Total" value={displayJobs.length} icon="📊" isMobile={isMobile} />
          <KpiCard
            title="Applied"
            value={displayJobs.filter((job) => job.status?.toLowerCase() === "applied").length}
            icon="📨"
            isMobile={isMobile}
          />
          <KpiCard
            title="Interview"
            value={displayJobs.filter((job) => job.status?.toLowerCase().includes("interview")).length}
            icon="🎤"
            isMobile={isMobile}
          />
          <KpiCard
            title="Offer"
            value={displayJobs.filter((job) => job.status?.toLowerCase().includes("offer")).length}
            icon="🎉"
            isMobile={isMobile}
          />
          <KpiCard
            title="Selected"
            value={displayJobs.filter((job) => job.status?.toLowerCase() === "selected").length}
            icon="🏆"
            isMobile={isMobile}
          />
        </div>

        {/* JOB LIST + DETAILS - Responsive */}
        <div
          style={{
            display: "flex",
            flexDirection: mainLayout as any,
            gap: isMobile ? "12px" : "20px",
          }}
        >
          {/* LEFT - Job List (Full width on mobile) */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: isMobile ? "12px" : "20px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
              width: isMobile ? "100%" : "minmax(300px, 380px)",
              flex: isMobile ? "none" : "0 0 380px",
              maxHeight: isMobile ? "300px" : "600px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile ? "10px" : "15px",
                flexWrap: "wrap",
                gap: "5px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: isMobile ? "15px" : "18px" }}>📋 Applications</h3>
              <span style={{ fontSize: isMobile ? "10px" : "12px", color: "#666" }}>
                {displayJobs.length} jobs {isFilterActive && "(filtered)"}
              </span>
            </div>

            {displayJobs.length === 0 ? (
              <div style={{ padding: "20px 10px", textAlign: "center", color: "#777" }}>
                <div style={{ fontSize: "35px" }}>📭</div>
                <p style={{ fontSize: isMobile ? "13px" : "15px" }}>
                  {isFilterActive 
                    ? "No jobs match your filter criteria." 
                    : "No job applications found."}
                </p>
                {isFilterActive && (
                  <button onClick={clearFilter} style={{ ...secondaryButton, marginTop: "10px", padding: isMobile ? "6px 12px" : "11px 18px", fontSize: isMobile ? "12px" : "14px" }}>
                    ✕ Clear Filters
                  </button>
                )}
                {!isFilterActive && (
                  <button onClick={() => setShowAddJob(true)} style={{ ...primaryButton, padding: isMobile ? "6px 12px" : "11px 18px", fontSize: isMobile ? "12px" : "14px" }}>
                    Add First Job
                  </button>
                )}
              </div>
            ) : (
              displayJobs.map((job) => (
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
                    padding: isMobile ? "10px 12px" : "14px",
                    marginBottom: isMobile ? "6px" : "10px",
                    cursor: "pointer",
                    fontSize: isMobile ? "13px" : "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: isMobile ? "13px" : "15px" }}>{job.designation}</strong>
                    <span style={{ fontSize: "10px", color: "#666" }}>{job.id}</span>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: isMobile ? "12px" : "14px" }}>
                    🏢 {job.company || "Company not specified"}
                  </div>
                  <div style={{ marginTop: "2px", color: "#666", fontSize: isMobile ? "11px" : "13px" }}>
                    📍 {job.country || "Country not specified"}
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "6px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "#e7f5e9",
                        color: "#176b2c",
                        fontSize: isMobile ? "9px" : "11px",
                        fontWeight: 600,
                      }}
                    >
                      {job.status || "Unknown"}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: "#eef2ff",
                        color: "#3730a3",
                        fontSize: isMobile ? "9px" : "11px",
                        fontWeight: 600,
                      }}
                    >
                      {job.jobType || "Not specified"}
                    </span>
                    {job.priority && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: 
                            job.priority === "High" ? "#fef2f2" : 
                            job.priority === "Medium" ? "#fffbeb" : "#f3f4f6",
                          color:
                            job.priority === "High" ? "#dc2626" :
                            job.priority === "Medium" ? "#d97706" : "#6b7280",
                          fontSize: isMobile ? "9px" : "11px",
                          fontWeight: 600,
                        }}
                      >
                        {job.priority}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </section>

          {/* RIGHT - Job Details (Full width on mobile) */}
          <section style={{ width: isMobile ? "100%" : "auto", flex: isMobile ? "none" : "1" }}>
            {selectedJob ? (
              <JobDetails job={selectedJob} onEdit={handleEditJob} isMobile={isMobile} />
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  padding: isMobile ? "20px" : "50px",
                  borderRadius: "14px",
                  textAlign: "center",
                  color: "#777",
                  fontSize: isMobile ? "13px" : "15px",
                }}
              >
                {displayJobs.length > 0 ? "Select a job application." : "No jobs to display."}
              </div>
            )}
          </section>
        </div>

        {/* REPOSITORY - Responsive */}
        <section
          style={{
            marginTop: isMobile ? "15px" : "25px",
            background: "#24292f",
            color: "#ffffff",
            borderRadius: "14px",
            padding: isMobile ? "12px 15px" : "22px",
          }}
        >
          <strong style={{ fontSize: isMobile ? "13px" : "15px" }}>🗂️ GitHub Data Repository</strong>
          <div style={{ marginTop: "5px", fontFamily: "monospace", fontSize: isMobile ? "11px" : "13px", wordBreak: "break-all" }}>
            MokhlesurRahmanIce06 / career-job-tracker-data
          </div>
          <div style={{ marginTop: "3px", fontSize: isMobile ? "10px" : "12px", opacity: 0.7 }}>
            Source: jobs/*.json
          </div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   FILTER INPUT COMPONENT - Responsive
   ========================================================= */
function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  isMobile = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  isMobile?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "2px" : "3px" }}>
      <label style={{ fontSize: isMobile ? "10px" : "12px", fontWeight: 600, color: "#374151" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: isMobile ? "6px 8px" : "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: isMobile ? "12px" : "13px",
          outline: "none",
          background: "#ffffff",
          width: "100%",
          boxSizing: "border-box",
          minHeight: isMobile ? "32px" : "36px",
        }}
      />
    </div>
  );
}

/* =========================================================
   FILTER SELECT COMPONENT - Responsive
   ========================================================= */
function FilterSelect({
  label,
  value,
  onChange,
  options,
  isMobile = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  isMobile?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "2px" : "3px" }}>
      <label style={{ fontSize: isMobile ? "10px" : "12px", fontWeight: 600, color: "#374151" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: isMobile ? "6px 8px" : "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: isMobile ? "12px" : "13px",
          outline: "none",
          background: "#ffffff",
          width: "100%",
          boxSizing: "border-box",
          minHeight: isMobile ? "32px" : "36px",
        }}
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || "All"}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   FILTER TAG STYLE
   ========================================================= */
const filterTagStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  background: "#eef2ff",
  color: "#3730a3",
  borderRadius: "12px",
  fontSize: "10px",
  fontWeight: 500,
};

/* =========================================================
   JOB DETAILS (সম্পূর্ণ কম্পোনেন্ট - Responsive)
   ========================================================= */

function JobDetails({
  job,
  onEdit,
  isMobile = false,
}: {
  job: JobApplication;
  onEdit: () => void;
  isMobile?: boolean;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: isMobile ? "16px" : "28px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
        maxHeight: isMobile ? "500px" : "none",
        overflowY: isMobile ? "auto" : "visible",
      }}
    >
      {/* HEADER - Responsive */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "flex-start",
          gap: isMobile ? "8px" : "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: "#777", fontSize: isMobile ? "10px" : "12px", fontFamily: "monospace" }}>
            {job.id}
          </div>
          <h2 style={{ margin: "4px 0", fontSize: isMobile ? "18px" : "24px" }}>
            {job.designation || "Designation not specified"}
          </h2>
          <strong style={{ fontSize: isMobile ? "14px" : "16px" }}>
            🏢 {job.company || "Company not specified"}
          </strong>
          <div style={{ color: "#666", marginTop: "3px", fontSize: isMobile ? "13px" : "14px" }}>
            📍 {job.country || "Country not specified"}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: isMobile ? "4px 10px" : "8px 14px",
              borderRadius: "20px",
              background: "#e7f5e9",
              color: "#176b2c",
              fontWeight: 700,
              fontSize: isMobile ? "12px" : "13px",
            }}
          >
            {job.status || "Unknown"}
          </span>
          <button type="button" onClick={onEdit} style={{ ...primaryButton, padding: isMobile ? "6px 12px" : "11px 18px", fontSize: isMobile ? "12px" : "14px" }}>
            ✏️ Edit
          </button>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: "1px solid #eee", margin: isMobile ? "12px 0" : "22px 0" }} />

      {/* JOB INFORMATION */}
      <DetailSection title="📌 Job Information" isMobile={isMobile}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
            gap: isMobile ? "8px" : "12px",
          }}
        >
          <InfoCard title="Job Type" value={job.jobType || "Not specified"} isMobile={isMobile} />
          <InfoCard title="Source" value={job.jobSource || "Not specified"} isMobile={isMobile} />
          <InfoCard title="Application Date" value={job.applicationDate || "Not specified"} isMobile={isMobile} />
          <InfoCard title="Recruiter" value={job.recruiter || "Not specified"} isMobile={isMobile} />
          <InfoCard title="Job URL" value={job.jobUrl || "Not specified"} isMobile={isMobile} />
          <InfoCard title="Priority" value={job.priority || "Not specified"} isMobile={isMobile} />
        </div>
      </DetailSection>

      {/* JD */}
      <DetailSection title="📝 Job Description" isMobile={isMobile}>
        <ContentBox value={job.jd || "No job description saved."} isMobile={isMobile} />
      </DetailSection>

      {/* DOCUMENTS */}
      <DetailSection title="📄 Documents Submitted" isMobile={isMobile}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "4px" : "8px" }}>
          <Badge label="Resume" active={!!job.documentsSubmitted?.resume} isMobile={isMobile} />
          <Badge label="Cover Letter" active={!!job.documentsSubmitted?.coverLetter} isMobile={isMobile} />
          <Badge label="Portfolio" active={!!job.documentsSubmitted?.portfolio} isMobile={isMobile} />
          <Badge label="Certificates" active={!!job.documentsSubmitted?.certificates} isMobile={isMobile} />
        </div>
        <div style={{ marginTop: isMobile ? "8px" : "14px" }}>
          <strong style={{ fontSize: isMobile ? "13px" : "14px" }}>Other Documents</strong>
          {job.documentsSubmitted?.other?.length ? (
            <TagGroup title="" items={job.documentsSubmitted.other} isMobile={isMobile} />
          ) : (
            <div style={{ marginTop: "4px", color: "#999", fontSize: isMobile ? "11px" : "13px" }}>None</div>
          )}
        </div>
      </DetailSection>

      {/* PREPARATION */}
      <DetailSection title="🎯 Preparation" isMobile={isMobile}>
        <TagGroup title="New Topics from JD" items={job.preparation?.newTopics || []} isMobile={isMobile} />
        <TagGroup title="Known Topics" items={job.preparation?.knownTopics || []} isMobile={isMobile} />
        <TagGroup title="Job Related Study / CV Alignment" items={job.preparation?.cvAlignment || []} isMobile={isMobile} />
      </DetailSection>

      {/* AI QUESTIONS */}
      <DetailSection title="🤖 AI Generated Q&A" isMobile={isMobile}>
        <AIItem name="ChatGPT" value={job.aiQuestions?.chatgpt} isMobile={isMobile} />
        <AIItem name="DeepSeek" value={job.aiQuestions?.deepseek} isMobile={isMobile} />
        <AIItem name="Grok" value={job.aiQuestions?.grok} isMobile={isMobile} />
        <AIItem name="Gemini" value={job.aiQuestions?.gemini} isMobile={isMobile} />
        <AIItem name="Copilot" value={job.aiQuestions?.copilot} isMobile={isMobile} />
        <AIItem name="Claude" value={job.aiQuestions?.claude} isMobile={isMobile} />
        <AIItem name="Consolidated" value={job.aiQuestions?.consolidated} isMobile={isMobile} />
      </DetailSection>

      {/* VIVA */}
      <VivaDetails number={1} viva={job.viva1} isMobile={isMobile} />
      <VivaDetails number={2} viva={job.viva2} isMobile={isMobile} />
      <VivaDetails number={3} viva={job.viva3} isMobile={isMobile} />
      <VivaDetails number={4} viva={job.viva4} isMobile={isMobile} />
      <VivaDetails number={5} viva={job.viva5} isMobile={isMobile} />

      {/* COMPENSATION */}
      <DetailSection title="💰 Compensation" isMobile={isMobile}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: isMobile ? "8px" : "12px",
          }}
        >
          <InfoCard title="Expected Salary" value={job.compensation?.expectedSalary || "Not specified"} isMobile={isMobile} />
          <InfoCard title="Offered Salary" value={job.compensation?.offeredSalary || "Not specified"} isMobile={isMobile} />
        </div>
      </DetailSection>

      {/* FOLLOW UP */}
      <DetailSection title="📅 Follow-up" isMobile={isMobile}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: isMobile ? "8px" : "12px",
          }}
        >
          <InfoCard title="Follow-up Date" value={job.followUp?.followUpDate || "Not specified"} isMobile={isMobile} />
          <InfoCard title="Follow-up Status" value={job.followUp?.followUpStatus || "Not specified"} isMobile={isMobile} />
        </div>
      </DetailSection>

      {/* NEXT ACTION */}
      <DetailSection title="🚀 Next Action" isMobile={isMobile}>
        <ContentBox value={job.nextAction || "No next action specified."} isMobile={isMobile} />
      </DetailSection>

      {/* FINAL ASSESSMENT */}
      <DetailSection title="🏁 Final Assessment" isMobile={isMobile}>
        <InfoRow label="Final Result" value={job.final?.result || "Not available"} isMobile={isMobile} />
        <InfoRow label="Result Date" value={job.final?.resultDate || "Not available"} isMobile={isMobile} />
        <InfoRow label="Full Experience" value={job.final?.fullExperience || "Not available"} isMobile={isMobile} />
        <InfoRow label="Final Recommendation / Upgrade Plan" value={job.final?.finalRecommendation || "Not available"} isMobile={isMobile} />
      </DetailSection>

      {/* CUSTOM FIELDS */}
      {job.customFields && job.customFields.length > 0 && (
        <DetailSection title="🧩 Custom Fields" isMobile={isMobile}>
          {job.customFields.map((field) => (
            <InfoRow key={field.id} label={field.name || "Custom Field"} value={field.value || "Empty"} isMobile={isMobile} />
          ))}
        </DetailSection>
      )}

      {/* RECORD INFO */}
      <DetailSection title="🕒 Record Information" isMobile={isMobile}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: isMobile ? "8px" : "12px",
          }}
        >
          <InfoCard title="Created At" value={job.createdAt || "Not available"} isMobile={isMobile} />
          <InfoCard title="Updated At" value={job.updatedAt || "Not available"} isMobile={isMobile} />
        </div>
      </DetailSection>
    </div>
  );
}

/* =========================================================
   VIVA DETAILS (Responsive)
   ========================================================= */

function VivaDetails({
  number,
  viva,
  isMobile = false,
}: {
  number: number;
  viva: JobApplication["viva1"];
  isMobile?: boolean;
}) {
  const hasData =
    !!viva &&
    (!!viva?.date ||
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
    <DetailSection title={`🎤 Viva ${number}`} isMobile={isMobile}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
          gap: isMobile ? "8px" : "12px",
          marginBottom: isMobile ? "10px" : "15px",
        }}
      >
        <InfoCard title="Date" value={viva?.date || "Not specified"} isMobile={isMobile} />
        <InfoCard title="Performance" value={`${Number(viva?.performancePercentage) || 0}%`} isMobile={isMobile} />
      </div>

      <DetailSection title="🎙️ AI Rehearsal" isMobile={isMobile}>
        <AIItem name="ChatGPT" value={viva?.rehearsal?.chatgpt} isMobile={isMobile} />
        <AIItem name="DeepSeek" value={viva?.rehearsal?.deepseek} isMobile={isMobile} />
        <AIItem name="Grok" value={viva?.rehearsal?.grok} isMobile={isMobile} />
        <AIItem name="Gemini" value={viva?.rehearsal?.gemini} isMobile={isMobile} />
        <AIItem name="Copilot" value={viva?.rehearsal?.copilot} isMobile={isMobile} />
        <AIItem name="Claude" value={viva?.rehearsal?.claude} isMobile={isMobile} />
      </DetailSection>

      <QuestionGroup title="✅ Easily Answered" items={viva?.easilyAnsweredQuestions || []} isMobile={isMobile} />
      <QuestionGroup title="🟡 Partially Answered" items={viva?.partiallyAnsweredQuestions || []} isMobile={isMobile} />
      <QuestionGroup title="🔴 Unknown Questions" items={viva?.unknownQuestions || []} isMobile={isMobile} />

      <InfoRow label="💪 Strengths" value={viva?.strengths || "Not recorded"} isMobile={isMobile} />
      <InfoRow label="⚠️ Weaknesses" value={viva?.weaknesses || "Not recorded"} isMobile={isMobile} />
      <InfoRow label="🚀 Improvement" value={viva?.improvement || "Not recorded"} isMobile={isMobile} />
    </DetailSection>
  );
}

/* =========================================================
   QUESTION GROUP
   ========================================================= */

function QuestionGroup({
  title,
  items,
  isMobile = false,
}: {
  title: string;
  items: string[];
  isMobile?: boolean;
}) {
  return (
    <div style={{ marginBottom: isMobile ? "8px" : "14px" }}>
      <strong style={{ fontSize: isMobile ? "13px" : "14px" }}>{title}</strong>
      {items.length === 0 ? (
        <div style={{ color: "#999", fontSize: isMobile ? "10px" : "12px", marginTop: "4px" }}>None</div>
      ) : (
        <ol style={{ marginTop: "5px", paddingLeft: isMobile ? "16px" : "22px", fontSize: isMobile ? "12px" : "13px" }}>
          {items.map((item, index) => (
            <li key={`${index}-${item}`} style={{ marginBottom: isMobile ? "3px" : "6px", lineHeight: 1.5 }}>
              {item}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* =========================================================
   HELPER COMPONENTS (Responsive)
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

function KpiCard({ title, value, icon, isMobile = false }: { title: string; value: number; icon: string; isMobile?: boolean }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: isMobile ? "10px 8px" : "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: isMobile ? "20px" : "25px" }}>{icon}</div>
      <div style={{ marginTop: "4px", fontSize: isMobile ? "20px" : "28px", fontWeight: 700 }}>{value}</div>
      <div style={{ marginTop: "2px", color: "#666", fontSize: isMobile ? "10px" : "13px" }}>{title}</div>
    </div>
  );
}

function InfoCard({ title, value, isMobile = false }: { title: string; value: string; isMobile?: boolean }) {
  return (
    <div style={{ background: "#f6f8fa", padding: isMobile ? "8px 10px" : "13px", borderRadius: "8px" }}>
      <div style={{ color: "#777", fontSize: isMobile ? "9px" : "11px", marginBottom: "2px" }}>{title}</div>
      <strong style={{ wordBreak: "break-word", fontSize: isMobile ? "12px" : "14px" }}>{value}</strong>
    </div>
  );
}

function DetailSection({ title, children, isMobile = false }: { title: string; children: React.ReactNode; isMobile?: boolean }) {
  return (
    <div style={{ marginTop: isMobile ? "14px" : "25px" }}>
      <h3 style={{ marginBottom: isMobile ? "8px" : "12px", fontSize: isMobile ? "15px" : "18px" }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function ContentBox({ value, isMobile = false }: { value: string; isMobile?: boolean }) {
  return (
    <div
      style={{
        background: "#f6f8fa",
        border: "1px solid #e5e7eb",
        borderRadius: "9px",
        padding: isMobile ? "10px" : "15px",
        whiteSpace: "pre-wrap",
        lineHeight: 1.6,
        color: value ? "#444" : "#999",
        minHeight: isMobile ? "30px" : "45px",
        wordBreak: "break-word",
        fontSize: isMobile ? "12px" : "14px",
      }}
    >
      {value}
    </div>
  );
}

function Badge({ label, active, isMobile = false }: { label: string; active: boolean; isMobile?: boolean }) {
  return (
    <span
      style={{
        padding: isMobile ? "4px 8px" : "7px 11px",
        borderRadius: "15px",
        background: active ? "#e7f5e9" : "#f1f1f1",
        color: active ? "#176b2c" : "#777",
        fontSize: isMobile ? "10px" : "12px",
        fontWeight: 600,
      }}
    >
      {active ? "✓" : "○"} {label}
    </span>
  );
}

function TagGroup({ title, items, isMobile = false }: { title: string; items: string[]; isMobile?: boolean }) {
  return (
    <div style={{ marginBottom: isMobile ? "8px" : "15px" }}>
      {title && <strong style={{ fontSize: isMobile ? "12px" : "13px" }}>{title}</strong>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "4px" : "7px", marginTop: title ? "4px" : "0" }}>
        {!items || items.length === 0 ? (
          <span style={{ color: "#999", fontSize: isMobile ? "10px" : "12px" }}>None</span>
        ) : (
          items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              style={{
                padding: isMobile ? "3px 7px" : "6px 10px",
                background: "#f1f5ff",
                borderRadius: "12px",
                fontSize: isMobile ? "10px" : "12px",
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

function AIItem({ name, value, isMobile = false }: { name: string; value?: string; isMobile?: boolean }) {
  return (
    <div
      style={{
        marginBottom: isMobile ? "8px" : "12px",
        padding: isMobile ? "8px 10px" : "13px",
        background: "#f6f8fa",
        borderRadius: "9px",
        border: "1px solid #e5e7eb",
      }}
    >
      <strong style={{ fontSize: isMobile ? "12px" : "13px" }}>{name}</strong>
      <div
        style={{
          marginTop: "4px",
          whiteSpace: "pre-wrap",
          lineHeight: 1.5,
          color: value ? "#444" : "#999",
          wordBreak: "break-word",
          fontSize: isMobile ? "12px" : "13px",
        }}
      >
        {value || "Not prepared yet"}
      </div>
    </div>
  );
}

function InfoRow({ label, value, isMobile = false }: { label: string; value: string; isMobile?: boolean }) {
  return (
    <div style={{ padding: isMobile ? "8px 10px" : "13px", marginBottom: isMobile ? "6px" : "10px", background: "#f6f8fa", borderRadius: "8px" }}>
      <div style={{ color: "#777", fontSize: isMobile ? "10px" : "12px", fontWeight: 600, marginBottom: "3px" }}>
        {label}
      </div>
      <div
        style={{
          whiteSpace: "pre-wrap",
          color: value ? "#444" : "#999",
          lineHeight: 1.5,
          wordBreak: "break-word",
          fontSize: isMobile ? "12px" : "14px",
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