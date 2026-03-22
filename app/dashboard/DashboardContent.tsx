"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import UserNavbar from "../components/UserNavbar";
import dynamic from "next/dynamic";

const PowerBIEmbed = dynamic(
  () => import("powerbi-client-react").then((mod) => mod.PowerBIEmbed),
  { ssr: false }
);

export default function DashboardContent({ session: serverSession, dashboards }: any) {
  const { data: clientSession } = useSession();
  const session = clientSession || serverSession;
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [msLoading, setMsLoading] = useState(false);

  const name = session?.user?.name ?? "";
  const role = session?.user?.role ?? "";

  const stats = {
    dashboards: dashboards.length,
    secteurs: new Set(dashboards.map((d: any) => d.secteur.nom)).size
  };

  const handleConnectMicrosoft = async () => {
    setMsLoading(true);
    try {
      const res = await fetch("/api/powerbi-token");
      const data = await res.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setEmbedUrl(data.embedUrl);
      } else {
        alert("Erreur lors de la connexion Power BI");
      }
    } catch (e) {
      alert("Erreur serveur");
    } finally {
      setMsLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel', dashboardId: string) => {
    alert(`Export ${format} du dashboard ${dashboardId} - Fonctionnalité à venir`);
  };

  return (
    <>
      <style>{styles}</style>

      <UserNavbar />

      <div className="dash-content">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Tableau de bord</h1>
            <p className="dash-subtitle">Bienvenue, {name} — voici vos dashboards accessibles.</p>
          </div>
          <div className="dash-right">
            <div className="dash-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.dashboards}</span>
                <span className="stat-label">Dashboards</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">{stats.secteurs}</span>
                <span className="stat-label">Secteurs</span>
              </div>
            </div>

            {!accessToken ? (
              <button
                className="btn-ms"
                onClick={handleConnectMicrosoft}
                disabled={msLoading}
              >
                {msLoading ? (
                  <><span className="btn-ms-spinner" />Connexion...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                    </svg>
                    Connecter Power BI
                  </>
                )}
              </button>
            ) : (
              <div className="ms-connected">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Power BI connecté
              </div>
            )}
          </div>
        </div>

        <div className="dash-grid">
          {dashboards.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <h3>Aucun dashboard disponible</h3>
              <p>Vous n'avez pas encore accès à des dashboards.</p>
            </div>
          ) : (
            dashboards.map((d: any) => (
              <div key={d.id} className="dashboard-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="card-title">{d.titre}</h3>
                      <span className="card-badge">{d.secteur.nom}</span>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  {d.description && <p className="card-desc">{d.description}</p>}

                  {accessToken && embedUrl ? (
                    <div className="powerbi-container">
                      <PowerBIEmbed
                        embedConfig={{
                          type: "report",
                          id: process.env.NEXT_PUBLIC_POWERBI_REPORT_ID,
                          embedUrl: embedUrl,
                          accessToken: accessToken,
                          tokenType: 0,
                          settings: {
                            panes: {
                              filters: { visible: false },
                              pageNavigation: { visible: true }
                            }
                          }
                        }}
                        cssClassName="powerbi-frame"
                        eventHandlers={
                          new Map([
                            ["loaded", () => console.log("Rapport chargé ✅")],
                            ["rendered", () => console.log("Rapport affiché ✅")],
                            ["error", (event: any) => console.error("Power BI Error:", JSON.stringify(event?.detail))]
                          ])
                        }
                      />
                    </div>
                  ) : (
                    <div className="powerbi-placeholder">
                      <svg width="21" height="21" viewBox="0 0 21 21">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                      </svg>
                      <p>Connectez Power BI pour afficher ce rapport</p>
                      <button className="btn-ms-sm" onClick={handleConnectMicrosoft}>
                        Connecter Power BI
                      </button>
                    </div>
                  )}
                </div>

                {(role === "MANAGER" || role === "ADMIN") && (
                  <div className="card-footer">
                    <button className="btn-export btn-pdf" onClick={() => handleExport('pdf', d.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      PDF
                    </button>
                    <button className="btn-export btn-excel" onClick={() => handleExport('excel', d.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="8" y1="16" x2="16" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      Excel
                    </button>
                  </div>
                )}

                {role === "ANALYST" && (
                  <div className="card-footer analyst-footer">
                    <button className="btn-analyst">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <path d="M12 22V12" />
                        <path d="M9 10.5l3-1.5 3 1.5" />
                      </svg>
                      Analyser les KPIs
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dash-content {
    font-family: 'Outfit', sans-serif;
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 40px;
    background: #f4f4f8;
    min-height: calc(100vh - 64px);
  }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .dash-title { font-size: 28px; font-weight: 800; color: #1e1b2e; margin-bottom: 4px; }
  .dash-subtitle { font-size: 14px; color: #9189a8; }
  .dash-right { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

  .dash-stats {
    display: flex; align-items: center; gap: 20px;
    background: white; padding: 12px 24px;
    border-radius: 40px;
    box-shadow: 0 2px 8px rgba(107,33,168,0.06);
  }

  .stat-item { display: flex; flex-direction: column; align-items: center; }
  .stat-value { font-size: 24px; font-weight: 800; color: #6B21A8; line-height: 1.2; }
  .stat-label { font-size: 11px; color: #9189a8; text-transform: uppercase; letter-spacing: 0.4px; }
  .stat-divider { width: 1px; height: 30px; background: #e2ddf0; }

  .btn-ms {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 20px; background: white; color: #1e1b2e;
    border: 1.5px solid #e2ddf0; border-radius: 10px;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; white-space: nowrap;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.1s;
  }
  .btn-ms:hover:not(:disabled) {
    background: #f9f7ff; border-color: #6B21A8;
    box-shadow: 0 4px 14px rgba(107,33,168,0.1);
    transform: translateY(-1px);
  }
  .btn-ms:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-ms-spinner {
    width: 14px; height: 14px;
    border: 2px solid #e2ddf0; border-top-color: #6B21A8;
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ms-connected {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; background: #f0fdf4; color: #15803d;
    border: 1.5px solid #bbf7d0; border-radius: 10px;
    font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif;
  }
  .ms-connected svg { width: 15px; height: 15px; }

  .dash-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 24px;
  }

  .dashboard-card {
    background: white; border-radius: 18px;
    box-shadow: 0 4px 20px rgba(107,33,168,0.06);
    border: 1px solid #f0ecfa; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .dashboard-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(107,33,168,0.12); }

  .card-header { padding: 16px 20px; border-bottom: 1px solid #f0ecfa; }
  .card-header-left { display: flex; align-items: center; gap: 12px; }
  .card-icon { width: 40px; height: 40px; background: #ede9fe; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .card-icon svg { width: 20px; height: 20px; color: #6B21A8; }
  .card-title { font-size: 16px; font-weight: 700; color: #1e1b2e; margin-bottom: 2px; }
  .card-badge { display: inline-block; padding: 2px 10px; background: #fff7ed; color: #c2410c; border-radius: 20px; font-size: 11px; font-weight: 600; }

  .card-body { padding: 20px; }
  .card-desc { font-size: 13px; color: #6b7280; margin-bottom: 15px; line-height: 1.5; }

  .powerbi-container { border-radius: 10px; overflow: hidden; border: 1px solid #f0ecfa; }
  .powerbi-frame { width: 100%; height: 500px; border: none; }

  .powerbi-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 40px 20px;
    background: #faf8ff; border-radius: 10px;
    border: 1.5px dashed #ddd6fe; text-align: center;
  }
  .powerbi-placeholder p { font-size: 13px; color: #9189a8; }
  .btn-ms-sm {
    padding: 8px 18px; background: #6B21A8; color: white;
    border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-ms-sm:hover { background: #581c87; }

  .card-footer { padding: 15px 20px; border-top: 1px solid #f0ecfa; display: flex; gap: 10px; justify-content: flex-end; }
  .analyst-footer { justify-content: center; }

  .btn-export { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: none; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-export svg { width: 14px; height: 14px; }
  .btn-pdf { background: #fee2e2; color: #dc2626; }
  .btn-pdf:hover { background: #dc2626; color: white; transform: translateY(-2px); }
  .btn-excel { background: #f0fdf4; color: #15803d; }
  .btn-excel:hover { background: #15803d; color: white; transform: translateY(-2px); }

  .btn-analyst { display: flex; align-items: center; gap: 8px; padding: 10px 24px; background: #eff6ff; color: #1d4ed8; border: none; border-radius: 30px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-analyst svg { width: 16px; height: 16px; }
  .btn-analyst:hover { background: #1d4ed8; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(29,78,216,0.3); }

  .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 18px; border: 1px solid #f0ecfa; }
  .empty-state svg { width: 60px; height: 60px; color: #c4bcda; margin-bottom: 15px; }
  .empty-state h3 { font-size: 18px; font-weight: 700; color: #1e1b2e; margin-bottom: 6px; }
  .empty-state p { font-size: 14px; color: #9189a8; }

  @media (max-width: 768px) {
    .dash-content { padding: 20px 16px; }
    .dash-header { flex-direction: column; align-items: flex-start; }
    .dash-grid { grid-template-columns: 1fr; }
    .powerbi-frame { height: 300px; }
  }
`;