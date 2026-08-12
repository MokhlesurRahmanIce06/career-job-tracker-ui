import { useState } from "react";

import { saveAccessToken } from "../auth/githubAuth";
import { testGitHubConnection } from "../github/githubRepo";

interface LoginProps {
  onLoginSuccess: () => void;
}

function Login({
  onLoginSuccess,
}: LoginProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setError("Please enter your GitHub fine-grained token.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Temporarily save token so githubRepo.ts can use it.
      saveAccessToken(trimmedToken);

      // Verify token against GitHub API.
      const user = await testGitHubConnection();

      console.log("GitHub authentication successful:", user.login);

      // Clear token from the input field.
      setToken("");

      // Tell App.tsx that login succeeded.
      onLoginSuccess();
    } catch (err) {
      console.error("GitHub login error:", err);

      // Remove invalid token.
      sessionStorage.removeItem(
        "career_tracker_github_token"
      );

      setError(
        err instanceof Error
          ? err.message
          : "GitHub authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "440px",
          padding: "40px",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "10px",
            }}
          >
            💼
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              color: "#24292f",
            }}
          >
            Mokhlesur Career Job Tracker
          </h1>

          <p
            style={{
              color: "#666",
              lineHeight: 1.6,
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            Track your job applications,
            interviews, learning gaps and
            career progress.
          </p>
        </div>

        {/* Login Section */}
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <label
            htmlFor="github-token"
            style={{
              display: "block",
              fontWeight: 600,
              color: "#24292f",
              marginBottom: "8px",
            }}
          >
            GitHub Fine-grained Token
          </label>

          <input
            id="github-token"
            type="password"
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleLogin();
              }
            }}
            placeholder="github_pat_..."
            autoComplete="off"
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              border: "1px solid #d0d7de",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              background: loading
                ? "#f6f8fa"
                : "#ffffff",
            }}
          />

          <p
            style={{
              fontSize: "12px",
              color: "#666",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            Use the fine-grained GitHub token
            created for your private
            career-job-tracker-data repository.
          </p>

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "14px",
              border: "none",
              borderRadius: "9px",
              background: "#24292f",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Connecting to GitHub..."
              : "Continue with GitHub"}
          </button>
        </div>

        {/* Information */}
        <div
          style={{
            marginTop: "25px",
            padding: "14px",
            background: "#f6f8fa",
            borderRadius: "9px",
            fontSize: "12px",
            color: "#57606a",
            lineHeight: 1.6,
          }}
        >
          <strong>GitHub-only storage</strong>

          <br />

          Your career data will be stored in
          your private GitHub repository.
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "#ffeaea",
              color: "#b00020",
              borderRadius: "9px",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            <strong>⚠️ GitHub Login Failed</strong>

            <div
              style={{
                marginTop: "6px",
              }}
            >
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;