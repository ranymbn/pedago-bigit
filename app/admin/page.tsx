"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function AdminAccueilPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    redirect("/login");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const prenom = session.user?.name?.split(" ")[0] || "Admin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-home {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f4f4f8 0%, #ffffff 100%);
        }

        /* Navbar */
        .navbar {
          background: #6B21A8;
          padding: 0 40px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(107,33,168,0.15);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: #F97316;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-icon svg {
          width: 22px;
          height: 22px;
          fill: white;
        }

        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: white;
          letter-spacing: 1px;
        }

        .brand-name span {
          color: #F97316;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.1);
          padding: 6px 15px 6px 6px;
          border-radius: 40px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: #F97316;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 16px;
        }

        .user-name {
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        /* Content */
        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
        }

        .welcome-section {
          margin-bottom: 50px;
        }

        .welcome-title {
          font-size: 36px;
          font-weight: 800;
          color: #1e1b2e;
          margin-bottom: 8px;
        }

        .welcome-title span {
          color: #6B21A8;
          position: relative;
        }

        .welcome-title span::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #F97316;
          border-radius: 2px;
        }

        .welcome-sub {
          font-size: 16px;
          color: #9189a8;
        }

        /* Cards grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .card {
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          box-shadow: 0 15px 35px rgba(107,33,168,0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(107,33,168,0.1);
          text-decoration: none;
          color: inherit;
          display: block;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: #6B21A8;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 45px rgba(107,33,168,0.2);
        }

        .card:hover::before {
          transform: scaleX(1);
        }

        .card-icon {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .icon-users {
          background: #ede9fe;
        }

        .icon-users svg {
          width: 32px;
          height: 32px;
          color: #6B21A8;
        }

        .icon-dashboards {
          background: #fff7ed;
        }

        .icon-dashboards svg {
          width: 32px;
          height: 32px;
          color: #F97316;
        }

        .icon-secteurs {
          background: #f0fdf4;
        }

        .icon-secteurs svg {
          width: 32px;
          height: 32px;
          color: #15803d;
        }

        .card h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1e1b2e;
          margin-bottom: 8px;
        }

        .card p {
          font-size: 14px;
          color: #9189a8;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .card-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6B21A8;
          font-weight: 600;
          font-size: 14px;
        }

        .card-link svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s;
        }

        .card:hover .card-link svg {
          transform: translateX(5px);
        }

        /* Stats section */
        .stats-section {
          margin-top: 60px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 30px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 5px 20px rgba(107,33,168,0.05);
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #6B21A8;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #9189a8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .navbar { padding: 0 20px; }
          .content { padding: 20px; }
          .welcome-title { font-size: 28px; }
          .stats-section { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="admin-home">
        {/* Navbar */}
        <nav className="navbar">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span className="brand-name">PEDAGO <span>BI</span></span>
          </div>
          <div className="user-info">
            <div className="user-avatar">{prenom.charAt(0)}</div>
            <span className="user-name">{session.user?.name}</span>
          </div>
        </nav>

        {/* Content */}
        <div className="content">
          {/* Welcome */}
          <div className="welcome-section">
            <h1 className="welcome-title">
              Bonjour, <span>{prenom}</span> 👋
            </h1>
            <p className="welcome-sub">
              Gérez votre plateforme PEDAGO BI depuis votre espace d'administration.
            </p>
          </div>

          {/* Cards */}
          <div className="cards-grid">
            {/* Carte Utilisateurs */}
            <Link href="/admin/utilisateurs" className="card">
              <div className="card-icon icon-users">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h2>Gestion des utilisateurs</h2>
              <p>Créez, modifiez et supprimez des utilisateurs. Attribuez-leur des rôles et des secteurs.</p>
              <div className="card-link">
                Accéder
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Carte Dashboards */}
            <Link href="/admin/dashboards" className="card">
              <div className="card-icon icon-dashboards">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <h2>Gestion des dashboards</h2>
              <p>Ajoutez, modifiez et supprimez des dashboards Power BI. Associez-les à des secteurs.</p>
              <div className="card-link">
                Accéder
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Carte Secteurs */}
            <Link href="/admin/secteurs" className="card">
              <div className="card-icon icon-secteurs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18M18 3v18M3 9h18M3 15h18M9 3v18M15 3v18"/>
                </svg>
              </div>
              <h2>Gestion des secteurs</h2>
              <p>Gérez les secteurs de votre organisation (Finance, RH, Marketing...).</p>
              <div className="card-link">
                Accéder
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-value">3</div>
              <div className="stat-label">Modules d'administration</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">5</div>
              <div className="stat-label">Secteurs disponibles</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Disponibilité</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}