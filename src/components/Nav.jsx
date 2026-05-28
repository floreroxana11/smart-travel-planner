import "./Nav.css";

export default function Nav({
  onHome,
  onAnalytics,
  onAdmin,
  onGoLogin,
  onGoRegister,
  onLogout,
  user,
  view
}) {
  return (
    <nav className="nav">
      <div className="nav-brand" onClick={onHome}>
        <div className="nav-logo">✈️</div>
        <span className="nav-title">Smart Travel Planner</span>
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            {view === "analytics" ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={onHome}
              >
                📄 Main Page
              </button>
            ) : (
              <button
                className={`btn btn-ghost btn-sm nav-tab${view === "analytics" ? " nav-tab-active" : ""}`}
                onClick={onAnalytics}
              >
                📊 Analytics
              </button>
            )}

            {/* 👇 ADMIN BUTTON */}
            {user?.role?.name === "admin" && (
              <button
                className={`btn btn-ghost btn-sm nav-tab${view === "admin" ? " nav-tab-active" : ""}`}
                onClick={onAdmin}
              >
                🛡️ Admin
              </button>
            )}

            <div className="nav-user">
              <strong>{user.name}</strong>
              {user.email}
            </div>

            <button className="btn btn-ghost btn-sm" onClick={onLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={onGoLogin}>
              Log In
            </button>

            <button className="btn btn-primary btn-sm" onClick={onGoRegister}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}