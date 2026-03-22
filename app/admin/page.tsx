"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminAccueilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return (
    <>
      <style>{styles}</style>
      <div className="ac-loading"><div className="ac-spinner" /><p>Chargement...</p></div>
    </>
  );

  if (status === "unauthenticated" || !session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  const prenom = session.user?.name?.split(" ")[0] || "Admin";

  return (
    <>
      <style>{styles}</style>
      <AdminNavbar />

      <div className="ac-root">

        <div className="ac-hero">
          <div className="ac-hero-badge">Espace Administrateur</div>
          <h1 className="ac-hero-title">Bonjour, {prenom} 👋</h1>
          <p className="ac-hero-sub">
            Gérez votre plateforme PEDAGO BI depuis votre espace d'administration.
          </p>
        </div>

        <div className="ac-cards">

          <button className="ac-card" onClick={() => router.push("/admin/utilisateurs")}>
            <div className="ac-card-top">
              <div className="ac-card-icon ac-icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="ac-card-tag ac-tag-purple">Gestion</span>
            </div>
            <h2 className="ac-card-title">Utilisateurs</h2>
            <p className="ac-card-desc">
              Créez, modifiez et supprimez des utilisateurs. Attribuez-leur des rôles et des secteurs.
            </p>
            <div className="ac-card-link ac-link-purple">
              Accéder
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          <button className="ac-card" onClick={() => router.push("/admin/dashboards")}>
            <div className="ac-card-top">
              <div className="ac-card-icon ac-icon-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <span className="ac-card-tag ac-tag-orange">Power BI</span>
            </div>
            <h2 className="ac-card-title">Dashboards</h2>
            <p className="ac-card-desc">
              Ajoutez, modifiez et supprimez des dashboards Power BI. Associez-les à des secteurs.
            </p>
            <div className="ac-card-link ac-link-orange">
              Accéder
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          <button className="ac-card" onClick={() => router.push("/admin/secteurs")}>
            <div className="ac-card-top">
              <div className="ac-card-icon ac-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="ac-card-tag ac-tag-green">Organisation</span>
            </div>
            <h2 className="ac-card-title">Secteurs</h2>
            <p className="ac-card-desc">
              Gérez les secteurs de votre organisation (Finance, RH, Marketing...).
            </p>
            <div className="ac-card-link ac-link-green">
              Accéder
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ac-root {
    font-family: 'Outfit', sans-serif;
    min-height: calc(100vh - 64px);
    background: #f4f4f8;
    padding: 48px 40px;
  }

  .ac-loading {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: #f4f4f8;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #9189a8;
    font-size: 14px;
  }

  .ac-spinner {
    width: 40px; height: 40px;
    border: 3px solid #e2ddf0;
    border-top-color: #6B21A8;
    border-radius: 50%;
    animation: ac-spin 0.7s linear infinite;
  }
  @keyframes ac-spin { to { transform: rotate(360deg); } }

  /* ── Hero ── */
  .ac-hero {
    text-align: center;
    margin-bottom: 48px;
  }

  .ac-hero-badge {
    display: inline-block;
    background: #ede9fe;
    color: #6B21A8;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .ac-hero-title {
    font-size: 34px;
    font-weight: 800;
    color: #1e1b2e;
    margin-bottom: 12px;
  }

  .ac-hero-sub {
    font-size: 15px;
    color: #9189a8;
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* ── Cards grid ── */
  .ac-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 900px;
    margin: 0 auto;
  }

  .ac-card {
    background: white;
    border: none;
    border-radius: 18px;
    padding: 28px;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(107,33,168,0.07);
    transition: transform 0.15s, box-shadow 0.15s;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ac-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(107,33,168,0.13);
  }

  .ac-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ac-card-icon {
    width: 50px; height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ac-card-icon svg { width: 22px; height: 22px; }

  .ac-icon-purple { background: #ede9fe; }
  .ac-icon-purple svg { color: #6B21A8; }

  .ac-icon-orange { background: #fff7ed; }
  .ac-icon-orange svg { color: #F97316; }

  .ac-icon-green { background: #f0fdf4; }
  .ac-icon-green svg { color: #16a34a; }

  .ac-card-tag {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 12px;
    border-radius: 20px;
  }

  .ac-tag-purple { background: #ede9fe; color: #6B21A8; }
  .ac-tag-orange { background: #fff7ed; color: #ea6a05; }
  .ac-tag-green  { background: #f0fdf4; color: #16a34a; }

  .ac-card-title {
    font-size: 18px;
    font-weight: 800;
    color: #1e1b2e;
  }

  .ac-card-desc {
    font-size: 13px;
    color: #9189a8;
    line-height: 1.6;
    flex: 1;
  }

  .ac-card-link {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 700;
    margin-top: 4px;
    transition: gap 0.15s;
  }

  .ac-card-link svg { width: 15px; height: 15px; transition: transform 0.15s; }
  .ac-card:hover .ac-card-link svg { transform: translateX(3px); }

  .ac-link-purple { color: #6B21A8; }
  .ac-link-orange { color: #F97316; }
  .ac-link-green  { color: #16a34a; }

  @media (max-width: 768px) {
    .ac-root { padding: 32px 16px; }
    .ac-hero-title { font-size: 26px; }
    .ac-cards { grid-template-columns: 1fr; }
  }
`;