import "./login.css";

export default function Login() {
  const handleLogin = () => {
    alert("GitHub authentication will be connected in Phase 05.");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">💼</div>

        <h1>Career Job Tracker</h1>

        <p>
          Manage your jobs, preparation, interviews,
          learning gaps and results.
        </p>

        <button
          className="github-login-button"
          onClick={handleLogin}
        >
          <span>⌘</span>
          Login with GitHub
        </button>

        <div className="login-note">
          Your career data will be stored in your
          private GitHub repository.
        </div>
      </div>
    </div>
  );
}