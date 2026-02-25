import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const name = session.user?.name ?? "";
  const email = session.user?.email ?? "";
  const role = session.user?.role ?? "";
  const initiale = name?.charAt(0).toUpperCase() ?? "?";
  const roleLower = role?.toLowerCase() ?? "user";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          background: #f4f4f8;
        }

        /* Top navbar - Violet PEDAGO */
        .db-navbar {
          background: #6B21A8;
          padding: 0 40px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(107,33,168,0.15);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .db-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .db-brand-icon {
          width: 42px;
          height: 42px;
          background: #F97316;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(249,115,22,0.3);
        }

        .db-brand-icon svg {
          width: 22px;
          height: 22px;
          fill: white;
        }

        .db-brand-name {
          font-size: 22px;
          font-weight: 800;
          color: white;
          letter-spacing: 1px;
        }

        .db-brand-name span {
          color: #F97316;
          font-weight: 900;
        }

        .db-nav-user {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(255,255,255,0.1);
          padding: 6px 15px 6px 6px;
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.15);
        }

        .db-nav-avatar {
          width: 42px;
          height: 42px;
          background: #F97316;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: white;
          border: 2px solid white;
        }

        .db-nav-info {
          display: flex;
          flex-direction: column;
        }

        .db-nav-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
          line-height: 1.3;
        }

        .db-nav-role {
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.3px;
        }

        /* Breadcrumb */
        .db-breadcrumb {
          padding: 16px 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #9189a8;
          background: white;
          border-bottom: 1px solid #e8e3f0;
        }

        .db-breadcrumb .bc-home {
          color: #6B21A8;
          cursor: default;
        }

        .db-breadcrumb .bc-sep { 
          color: #c4bcda;
          font-size: 16px;
        }

        .db-breadcrumb .bc-active { 
          color: #6B21A8; 
          font-weight: 600;
          background: #ede9fe;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 13px;
        }

        /* Content */
        .db-content {
          padding: 36px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .db-page-title {
          font-size: 28px;
          font-weight: 800;
          color: #1e1b2e;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }

        .db-page-sub {
          font-size: 14px;
          color: #9189a8;
          margin-bottom: 32px;
        }

        /* Cards grid */
        .db-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .db-stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(107,33,168,0.07);
          display: flex;
          align-items: center;
          gap: 18px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .db-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(107,33,168,0.12);
        }

        .db-stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 24px;
        }

        .icon-purple { background: #ede9fe; color: #6B21A8; }
        .icon-orange { background: #fff7ed; color: #F97316; }
        .icon-green  { background: #f0fdf4; color: #15803d; }

        .db-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #9189a8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .db-stat-value {
          font-size: 22px;
          font-weight: 800;
          color: #1e1b2e;
        }

        /* Profile card */
        .db-profile-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(107,33,168,0.07);
          overflow: hidden;
          max-width: 600px;
        }

        .db-profile-header {
          background: #6B21A8;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }

        .db-profile-header::after {
          content: '';
          position: absolute;
          top: -20px;
          right: -20px;
          width: 120px;
          height: 120px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }

        .db-profile-avatar {
          width: 64px;
          height: 64px;
          background: #F97316;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          color: white;
          border: 3px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 1;
        }

        .db-profile-header-info {
          z-index: 1;
        }

        .db-profile-header-info h2 {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .db-profile-header-info p {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }

        .db-profile-body {
          padding: 28px;
        }

        .db-profile-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #f0ecfa;
        }

        .db-profile-row:last-child { border-bottom: none; }

        .db-profile-row-icon {
          width: 40px;
          height: 40px;
          background: #f4f4f8;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .db-profile-row-icon svg {
          width: 18px;
          height: 18px;
          color: #6B21A8;
        }

        .db-profile-row-content {
          flex: 1;
        }

        .db-profile-row-label {
          font-size: 12px;
          font-weight: 600;
          color: #9189a8;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 4px;
        }

        .db-profile-row-value {
          font-size: 15px;
          font-weight: 600;
          color: #1e1b2e;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .role-admin   { background: #ede9fe; color: #6B21A8; }
        .role-manager { background: #fff7ed; color: #F97316; }
        .role-viewer  { background: #f0fdf4; color: #15803d; }
        .role-analyst { background: #e0f2fe; color: #0369a1; }

        @media (max-width: 768px) {
          .db-navbar { padding: 0 20px; }
          .db-breadcrumb { padding: 12px 20px; }
          .db-content { padding: 24px 20px; }
          .db-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-root">
        {/* Navbar */}
        <nav className="db-navbar">
          <div className="db-brand">
            <div className="db-brand-icon">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span className="db-brand-name">PEDAGO <span>BI</span></span>
          </div>
          <div className="db-nav-user">
            <div className="db-nav-avatar">{initiale}</div>
            <div className="db-nav-info">
              <span className="db-nav-name">{name}</span>
              <span className="db-nav-role">{role}</span>
            </div>
          </div>
        </nav>

        {/* Breadcrumb */}
        <div className="db-breadcrumb">
          <span className="bc-home">🏠</span>
          <span className="bc-sep">›</span>
          <span>Dashboard</span>
          <span className="bc-sep">›</span>
          <span className="bc-active">Accueil</span>
        </div>

        {/* Content */}
        <div className="db-content">
          <h1 className="db-page-title">Tableau de bord</h1>
          <p className="db-page-sub">Bienvenue, {name} — voici un aperçu de votre espace.</p>

          {/* Cards */}
          <div className="db-cards">
            <div className="db-stat-card">
              <div className="db-stat-icon icon-purple">📊</div>
              <div>
                <div className="db-stat-label">VOS DASHBORD</div>
                <div className="db-stat-value"></div>
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div className="db-profile-card">
            <div className="db-profile-header">
              <div className="db-profile-avatar">{initiale}</div>
              <div className="db-profile-header-info">
                <h2>{name}</h2>
                <p>Informations du compte</p>
              </div>
            </div>
            <div className="db-profile-body">
              <div className="db-profile-row">
                <div className="db-profile-row-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="db-profile-row-content">
                  <div className="db-profile-row-label">Nom</div>
                  <div className="db-profile-row-value">{name}</div>
                </div>
              </div>
              <div className="db-profile-row">
                <div className="db-profile-row-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="db-profile-row-content">
                  <div className="db-profile-row-label">Email</div>
                  <div className="db-profile-row-value">{email}</div>
                </div>
              </div>
              <div className="db-profile-row">
                <div className="db-profile-row-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="db-profile-row-content">
                  <div className="db-profile-row-label">Rôle</div>
                  <span className={`role-badge role-${roleLower}`}>{role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}