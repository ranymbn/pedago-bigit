"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Secteur {
  id: string;
  nom: string;
}

interface Dashboard {
  id: string;
  titre: string;
  description: string | null;
  urlPowerBI: string;
  secteurId: string;
  secteur: Secteur;
  kpis: any[];
}

export default function AdminDashboardsPage() {
  const { data: session, status } = useSession();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [dashboardToEdit, setDashboardToEdit] = useState<Dashboard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ titre: "", description: "", urlPowerBI: "", secteurId: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.role === "ADMIN") fetchData();
    else setLoading(false);
  }, [session]);

  const fetchData = async () => {
    try {
      const [dr, sr] = await Promise.all([fetch("/api/dashboards"), fetch("/api/secteurs")]);
      setDashboards(await dr.json());
      setSecteurs(await sr.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAjout = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!formData.secteurId) { setError("Veuillez sélectionner un secteur"); return; }
    try {
      const res = await fetch("/api/dashboards", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, description: formData.description || null })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur création");
      resetForm(); setShowAjoutModal(false); fetchData();
    } catch (err: any) { setError(err.message); }
  };

  const handleModifier = async (e: React.FormEvent) => {
    e.preventDefault(); if (!dashboardToEdit) return; setError("");
    try {
      const res = await fetch(`/api/dashboards/${dashboardToEdit.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, description: formData.description || null })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur modification");
      setShowModifierModal(false); setDashboardToEdit(null); resetForm(); fetchData();
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async () => {
    if (!dashboardToDelete) return;
    try {
      const res = await fetch(`/api/dashboards/${dashboardToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur suppression");
      setShowDeleteConfirm(false); setDashboardToDelete(null); fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const openEditModal = (d: Dashboard) => {
    setDashboardToEdit(d);
    setFormData({ titre: d.titre, description: d.description || "", urlPowerBI: d.urlPowerBI, secteurId: d.secteurId });
    setError(""); setShowModifierModal(true);
  };

  const resetForm = () => { setFormData({ titre: "", description: "", urlPowerBI: "", secteurId: "" }); setError(""); };

  const filteredDashboards = dashboards.filter(d =>
    d.titre.toLowerCase().includes(search.toLowerCase()) ||
    d.secteur.nom.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) return (
    <><style>{styles}</style>
    <div className="db-loading"><div className="db-spinner"/><p>Chargement...</p></div></>
  );

  if (status === "unauthenticated" || !session || session.user?.role !== "ADMIN") redirect("/login");

  return (
    <><style>{styles}</style>
    <div className="db-root">

      {/* Header */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-breadcrumb">
            <span>🏠</span><span className="bc-sep">›</span>
            <span>Administration</span><span className="bc-sep">›</span>
            <span className="bc-active">Dashboards</span>
          </div>
          <h1 className="db-title">Gestion des dashboards</h1>
          <p className="db-subtitle">{dashboards.length} dashboard{dashboards.length > 1 ? "s" : ""} enregistré{dashboards.length > 1 ? "s" : ""}</p>
        </div>
        <button className="db-btn-add" onClick={() => { resetForm(); setShowAjoutModal(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau dashboard
        </button>
      </div>

      {/* Search */}
      <div className="db-search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Rechercher par titre ou secteur..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="db-table-card">
        <table className="db-table">
          <thead>
            <tr>
              <th>Dashboard</th>
              <th>Secteur</th>
              <th>URL Power BI</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDashboards.length === 0 ? (
              <tr><td colSpan={4} className="db-empty">Aucun dashboard trouvé.</td></tr>
            ) : filteredDashboards.map((d) => (
              <tr key={d.id}>
                <td>
                  <div className="db-titre-cell">
                    <div className="db-titre-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                      </svg>
                    </div>
                    <div>
                      <div className="db-titre-name">{d.titre}</div>
                      {d.description && <div className="db-titre-desc">{d.description}</div>}
                    </div>
                  </div>
                </td>
                <td><span className="db-secteur-badge">{d.secteur.nom}</span></td>
                <td>
                  <a href={d.urlPowerBI} target="_blank" rel="noopener noreferrer" className="db-url-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    {d.urlPowerBI.length > 40 ? d.urlPowerBI.substring(0, 40) + "..." : d.urlPowerBI}
                  </a>
                </td>
                <td>
                  <div className="db-action-btns">
                    <button className="db-btn-edit" onClick={() => openEditModal(d)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Modifier
                    </button>
                    <button className="db-btn-delete" onClick={() => { setDashboardToDelete(d.id); setShowDeleteConfirm(true); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout */}
      {showAjoutModal && (
        <div className="db-overlay">
          <div className="db-modal">
            <div className="db-modal-header">
              <div className="db-modal-header-left">
                <div className="db-modal-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <div><h2>Nouveau dashboard</h2><p>Remplissez les informations ci-dessous</p></div>
              </div>
              <button className="db-modal-close" onClick={() => { resetForm(); setShowAjoutModal(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="db-modal-body">
              {error && <div className="db-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
              <form onSubmit={handleAjout}>
                <FormFields formData={formData} setFormData={setFormData} secteurs={secteurs} />
                <hr className="db-divider"/>
                <div className="db-modal-actions">
                  <button type="button" className="db-btn-cancel" onClick={() => { resetForm(); setShowAjoutModal(false); }}>Annuler</button>
                  <button type="submit" className="db-btn-submit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Créer le dashboard
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification */}
      {showModifierModal && dashboardToEdit && (
        <div className="db-overlay">
          <div className="db-modal">
            <div className="db-modal-header">
              <div className="db-modal-header-left">
                <div className="db-modal-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div><h2>Modifier le dashboard</h2><p>Mettez à jour les informations</p></div>
              </div>
              <button className="db-modal-close" onClick={() => { setShowModifierModal(false); setDashboardToEdit(null); resetForm(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="db-modal-body">
              <div className="db-notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Modification de <strong style={{ marginLeft: 4 }}>{dashboardToEdit.titre}</strong>
              </div>
              {error && <div className="db-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
              <form onSubmit={handleModifier}>
                <FormFields formData={formData} setFormData={setFormData} secteurs={secteurs} />
                <hr className="db-divider"/>
                <div className="db-modal-actions">
                  <button type="button" className="db-btn-cancel" onClick={() => { setShowModifierModal(false); setDashboardToEdit(null); resetForm(); }}>Annuler</button>
                  <button type="submit" className="db-btn-submit db-btn-orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteConfirm && (
        <div className="db-overlay">
          <div className="db-modal db-modal-sm">
            <div className="db-delete-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h2 className="db-delete-title">Confirmer la suppression</h2>
            <p className="db-delete-text">Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce dashboard ?</p>
            <div className="db-modal-actions db-modal-actions-center">
              <button className="db-btn-cancel" onClick={() => { setShowDeleteConfirm(false); setDashboardToDelete(null); }}>Annuler</button>
              <button className="db-btn-confirm-delete" onClick={handleDelete}>Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

    </div></>
  );
}

// Composant champs réutilisable
function FormFields({ formData, setFormData, secteurs }: {
  formData: { titre: string; description: string; urlPowerBI: string; secteurId: string };
  setFormData: (d: any) => void;
  secteurs: Secteur[];
}) {
  return (
    <>
      <div className="db-group">
        <label className="db-label">Titre</label>
        <div className="db-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          <input type="text" className="db-input" placeholder="Nom du dashboard" value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} required />
        </div>
      </div>
      <div className="db-group">
        <label className="db-label">Description <span className="db-label-opt">(optionnel)</span></label>
        <textarea className="db-textarea" placeholder="Brève description du contenu..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
      </div>
      <div className="db-group">
        <label className="db-label">URL Power BI</label>
        <div className="db-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <input type="url" className="db-input" placeholder="https://app.powerbi.com/..." value={formData.urlPowerBI} onChange={(e) => setFormData({ ...formData, urlPowerBI: e.target.value })} required />
        </div>
      </div>
      <div className="db-group">
        <label className="db-label">Secteur</label>
        <div className="db-select-wrap">
          <svg className="db-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <select className="db-select" value={formData.secteurId} onChange={(e) => setFormData({ ...formData, secteurId: e.target.value })} required>
            <option value="">Sélectionner un secteur</option>
            {secteurs.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
          <svg className="db-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .db-root { font-family: 'Outfit', sans-serif; min-height: 100vh; background: #f4f4f8; padding: 32px 40px; }

  .db-loading { font-family: 'Outfit', sans-serif; min-height: 100vh; background: #f4f4f8; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #9189a8; font-size: 14px; }
  .db-spinner { width: 40px; height: 40px; border: 3px solid #e2ddf0; border-top-color: #6B21A8; border-radius: 50%; animation: db-spin 0.7s linear infinite; }
  @keyframes db-spin { to { transform: rotate(360deg); } }

  .db-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; }
  .db-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #9189a8; margin-bottom: 8px; }
  .bc-sep { color: #c4bcda; } .bc-active { color: #6B21A8; font-weight: 600; }
  .db-title { font-size: 26px; font-weight: 800; color: #1e1b2e; }
  .db-subtitle { font-size: 13px; color: #9189a8; margin-top: 4px; }

  .db-btn-add { display: flex; align-items: center; gap: 8px; background: #6B21A8; color: white; border: none; border-radius: 10px; padding: 12px 20px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s, box-shadow 0.2s, transform 0.1s; }
  .db-btn-add svg { width: 16px; height: 16px; }
  .db-btn-add:hover { background: #581c87; box-shadow: 0 6px 20px rgba(107,33,168,0.35); transform: translateY(-1px); }

  .db-search-wrap { position: relative; margin-bottom: 20px; }
  .db-search-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #9189a8; }
  .db-search-wrap input { width: 100%; max-width: 420px; padding: 12px 16px 12px 44px; border: 1.5px solid #e2ddf0; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e1b2e; background: white; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .db-search-wrap input:focus { border-color: #6B21A8; box-shadow: 0 0 0 4px rgba(107,33,168,0.08); }
  .db-search-wrap input::placeholder { color: #c4bcda; }

  .db-table-card { background: white; border-radius: 14px; box-shadow: 0 2px 12px rgba(107,33,168,0.07); overflow: hidden; }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table thead { background: #6B21A8; }
  .db-table thead th { padding: 14px 20px; text-align: left; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: 0.8px; text-transform: uppercase; }
  .db-table tbody tr { border-bottom: 1px solid #f0ecfa; transition: background 0.15s; }
  .db-table tbody tr:last-child { border-bottom: none; }
  .db-table tbody tr:hover { background: #faf8ff; }
  .db-table tbody td { padding: 14px 20px; font-size: 14px; color: #3d2e6b; }
  .db-empty { text-align: center; color: #9189a8; padding: 40px !important; font-size: 14px; }

  .db-titre-cell { display: flex; align-items: center; gap: 12px; }
  .db-titre-icon { width: 36px; height: 36px; border-radius: 9px; background: #ede9fe; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .db-titre-icon svg { width: 16px; height: 16px; color: #6B21A8; }
  .db-titre-name { font-weight: 600; color: #1e1b2e; }
  .db-titre-desc { font-size: 12px; color: #9189a8; margin-top: 2px; }

  .db-secteur-badge { display: inline-block; padding: 3px 12px; background: #ede9fe; color: #6B21A8; border-radius: 20px; font-size: 12px; font-weight: 600; }

  .db-url-link { display: flex; align-items: center; gap: 6px; color: #6B21A8; font-size: 12px; text-decoration: none; transition: color 0.15s; }
  .db-url-link svg { width: 13px; height: 13px; flex-shrink: 0; }
  .db-url-link:hover { color: #F97316; }

  .db-action-btns { display: flex; gap: 8px; justify-content: flex-end; }
  .db-btn-edit, .db-btn-delete { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: background 0.15s, transform 0.1s; }
  .db-btn-edit svg, .db-btn-delete svg { width: 14px; height: 14px; }
  .db-btn-edit { background: #ede9fe; color: #6B21A8; }
  .db-btn-edit:hover { background: #6B21A8; color: white; transform: translateY(-1px); }
  .db-btn-delete { background: #fee2e2; color: #dc2626; }
  .db-btn-delete:hover { background: #dc2626; color: white; transform: translateY(-1px); }

  .db-overlay { position: fixed; inset: 0; background: rgba(30,27,46,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
  .db-modal { background: white; border-radius: 18px; width: 100%; max-width: 500px; box-shadow: 0 24px 64px rgba(0,0,0,0.18); overflow: hidden; max-height: 90vh; overflow-y: auto; }
  .db-modal-sm { max-width: 400px; padding: 36px 32px; text-align: center; overflow: visible; }

  .db-modal-header { background: #6B21A8; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 1; }
  .db-modal-header-left { display: flex; align-items: center; gap: 12px; }
  .db-modal-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .db-modal-icon svg { width: 20px; height: 20px; color: white; }
  .db-modal-header h2 { font-size: 18px; font-weight: 700; color: white; margin: 0; font-family: 'Outfit', sans-serif; }
  .db-modal-header p { font-size: 12px; color: rgba(255,255,255,0.6); margin: 2px 0 0; font-family: 'Outfit', sans-serif; }
  .db-modal-close { width: 32px; height: 32px; background: rgba(255,255,255,0.12); border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; color: white; }
  .db-modal-close:hover { background: rgba(255,255,255,0.22); }
  .db-modal-close svg { width: 16px; height: 16px; }

  .db-modal-body { padding: 28px; font-family: 'Outfit', sans-serif; }

  .db-notice { background: #f9f7ff; border: 1.5px solid #e2ddf0; border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #6B21A8; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .db-notice svg { width: 14px; height: 14px; flex-shrink: 0; }

  .db-error { background: #fff0f0; border-left: 4px solid #ef4444; color: #b91c1c; padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .db-error svg { width: 16px; height: 16px; flex-shrink: 0; }

  .db-group { margin-bottom: 18px; }
  .db-label { display: block; font-size: 12px; font-weight: 700; color: #3d2e6b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .db-label-opt { font-size: 10px; font-weight: 500; color: #9189a8; text-transform: none; letter-spacing: 0; margin-left: 6px; }

  .db-input-wrap { position: relative; }
  .db-input-wrap svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9189a8; pointer-events: none; }
  .db-input { width: 100%; padding: 11px 14px 11px 40px; border: 1.5px solid #e2ddf0; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e1b2e; background: #fafafa; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .db-input:focus { border-color: #6B21A8; background: white; box-shadow: 0 0 0 4px rgba(107,33,168,0.08); }
  .db-input::placeholder { color: #c4bcda; }

  .db-textarea { width: 100%; padding: 11px 14px; border: 1.5px solid #e2ddf0; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e1b2e; background: #fafafa; outline: none; resize: vertical; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .db-textarea:focus { border-color: #6B21A8; background: white; box-shadow: 0 0 0 4px rgba(107,33,168,0.08); }
  .db-textarea::placeholder { color: #c4bcda; }

  .db-select-wrap { position: relative; }
  .db-select-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9189a8; pointer-events: none; }
  .db-select { width: 100%; padding: 11px 36px 11px 40px; border: 1.5px solid #e2ddf0; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e1b2e; background: #fafafa; outline: none; appearance: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
  .db-select:focus { border-color: #6B21A8; background: white; box-shadow: 0 0 0 4px rgba(107,33,168,0.08); }
  .db-select-chevron { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9189a8; pointer-events: none; }

  .db-divider { border: none; border-top: 1px solid #f0ecfa; margin: 24px 0; }
  .db-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .db-modal-actions-center { justify-content: center; margin-top: 24px; }

  .db-btn-cancel { padding: 11px 20px; border-radius: 10px; border: 1.5px solid #e2ddf0; background: white; color: #6b7280; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
  .db-btn-cancel:hover { background: #f9f7ff; border-color: #c4bcda; }

  .db-btn-submit { padding: 11px 24px; border-radius: 10px; border: none; background: #6B21A8; color: white; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s, box-shadow 0.2s, transform 0.1s; }
  .db-btn-submit svg { width: 16px; height: 16px; }
  .db-btn-submit:hover { background: #581c87; box-shadow: 0 6px 20px rgba(107,33,168,0.35); transform: translateY(-1px); }
  .db-btn-orange { background: #F97316 !important; }
  .db-btn-orange:hover { background: #ea6a05 !important; box-shadow: 0 6px 20px rgba(249,115,22,0.35) !important; }

  .db-delete-icon-wrap { width: 56px; height: 56px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .db-delete-icon-wrap svg { width: 26px; height: 26px; color: #dc2626; }
  .db-delete-title { font-size: 20px; font-weight: 700; color: #1e1b2e; margin-bottom: 10px; font-family: 'Outfit', sans-serif; }
  .db-delete-text { font-size: 14px; color: #6b7280; line-height: 1.6; font-family: 'Outfit', sans-serif; }
  .db-btn-confirm-delete { padding: 11px 22px; border-radius: 9px; border: none; background: #dc2626; color: white; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s, box-shadow 0.15s; }
  .db-btn-confirm-delete:hover { background: #b91c1c; box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

  @media (max-width: 768px) {
    .db-root { padding: 20px 16px; }
    .db-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .db-btn-add { width: 100%; justify-content: center; }
  }
`;