"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Secteur {
  id: string;
  nom: string;
  users: {
    user: {
      id: string;
      nom: string;
      email: string;
      role: string;
    }
  }[];
}

export default function SecteursPage() {
  const { data: session, status } = useSession();
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [secteurToEdit, setSecteurToEdit] = useState<Secteur | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [secteurToDelete, setSecteurToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [nouveauNom, setNouveauNom] = useState("");
  const [nomModif, setNomModif] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSecteurs();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchSecteurs = async () => {
    try {
      const res = await fetch("/api/secteurs");
      const data = await res.json();
      setSecteurs(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAjout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/secteurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nouveauNom })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }
      setNouveauNom("");
      setShowAjoutModal(false);
      fetchSecteurs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleModifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secteurToEdit) return;
    setError("");
    try {
      const res = await fetch(`/api/secteurs/${secteurToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nomModif })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la modification");
      }
      setShowModifierModal(false);
      setSecteurToEdit(null);
      fetchSecteurs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!secteurToDelete) return;
    try {
      const res = await fetch(`/api/secteurs/${secteurToDelete}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }
      setShowDeleteConfirm(false);
      setSecteurToDelete(null);
      fetchSecteurs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredSecteurs = secteurs.filter(s =>
    s.nom.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="sc-loading">
          <div className="sc-spinner" />
          <p>Chargement...</p>
        </div>
      </>
    );
  }

  if (status === "unauthenticated" || !session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <>
      <style>{styles}</style>

      <div className="sc-root">

        {/* Header */}
        <div className="sc-header">
          <div className="sc-header-left">
            <div className="sc-breadcrumb">
              <span>🏠</span>
              <span className="bc-sep">›</span>
              <span>Administration</span>
              <span className="bc-sep">›</span>
              <span className="bc-active">Secteurs</span>
            </div>
            <h1 className="sc-title">Gestion des secteurs</h1>
            <p className="sc-subtitle">{secteurs.length} secteur{secteurs.length > 1 ? "s" : ""} enregistré{secteurs.length > 1 ? "s" : ""}</p>
          </div>
          <button className="sc-btn-add" onClick={() => { setError(""); setShowAjoutModal(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nouveau secteur
          </button>
        </div>

        {/* Search */}
        <div className="sc-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un secteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="sc-table-card">
          <table className="sc-table">
            <thead>
              <tr>
                <th>Secteur</th>
                <th>Utilisateurs assignés</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSecteurs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="sc-empty">Aucun secteur trouvé.</td>
                </tr>
              ) : (
                filteredSecteurs.map((secteur) => (
                  <tr key={secteur.id}>
                    <td>
                      <div className="sc-secteur-cell">
                        <div className="sc-secteur-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        </div>
                        <span className="sc-secteur-name">{secteur.nom}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sc-users-wrap">
                        {secteur.users.length === 0 ? (
                          <span className="sc-no-user">Aucun utilisateur</span>
                        ) : (
                          secteur.users.map((u) => (
                            <span key={u.user.id} className="sc-user-chip">{u.user.nom}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="sc-action-btns">
                        <button
                          className="sc-btn-edit"
                          onClick={() => {
                            setSecteurToEdit(secteur);
                            setNomModif(secteur.nom);
                            setError("");
                            setShowModifierModal(true);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Modifier
                        </button>
                        <button
                          className="sc-btn-delete"
                          onClick={() => { setSecteurToDelete(secteur.id); setShowDeleteConfirm(true); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Ajout */}
        {showAjoutModal && (
          <div className="sc-overlay">
            <div className="sc-modal">
              <div className="sc-modal-header">
                <div className="sc-modal-header-left">
                  <div className="sc-modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div>
                    <h2>Nouveau secteur</h2>
                    <p>Remplissez les informations ci-dessous</p>
                  </div>
                </div>
                <button className="sc-modal-close" onClick={() => setShowAjoutModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="sc-modal-body">
                {error && <div className="sc-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                <form onSubmit={handleAjout}>
                  <div className="sc-group">
                    <label className="sc-label">Nom du secteur</label>
                    <div className="sc-input-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <input
                        type="text"
                        className="sc-input"
                        placeholder="Ex: Finance, RH, Marketing..."
                        value={nouveauNom}
                        onChange={(e) => setNouveauNom(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <hr className="sc-divider" />
                  <div className="sc-modal-actions">
                    <button type="button" className="sc-btn-cancel" onClick={() => setShowAjoutModal(false)}>Annuler</button>
                    <button type="submit" className="sc-btn-submit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                      Créer le secteur
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Modification */}
        {showModifierModal && secteurToEdit && (
          <div className="sc-overlay">
            <div className="sc-modal">
              <div className="sc-modal-header">
                <div className="sc-modal-header-left">
                  <div className="sc-modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h2>Modifier le secteur</h2>
                    <p>Mettez à jour le nom ci-dessous</p>
                  </div>
                </div>
                <button className="sc-modal-close" onClick={() => { setShowModifierModal(false); setSecteurToEdit(null); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="sc-modal-body">
                <div className="sc-notice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Modification de <strong style={{ marginLeft: 4 }}>{secteurToEdit.nom}</strong>
                </div>
                {error && <div className="sc-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                <form onSubmit={handleModifier}>
                  <div className="sc-group">
                    <label className="sc-label">Nom du secteur</label>
                    <div className="sc-input-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <input
                        type="text"
                        className="sc-input"
                        value={nomModif}
                        onChange={(e) => setNomModif(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <hr className="sc-divider" />
                  <div className="sc-modal-actions">
                    <button type="button" className="sc-btn-cancel" onClick={() => { setShowModifierModal(false); setSecteurToEdit(null); }}>Annuler</button>
                    <button type="submit" className="sc-btn-submit sc-btn-orange">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
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
          <div className="sc-overlay">
            <div className="sc-modal sc-modal-sm">
              <div className="sc-delete-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <h2 className="sc-delete-title">Confirmer la suppression</h2>
              <p className="sc-delete-text">Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce secteur ?</p>
              <div className="sc-modal-actions sc-modal-actions-center">
                <button className="sc-btn-cancel" onClick={() => { setShowDeleteConfirm(false); setSecteurToDelete(null); }}>Annuler</button>
                <button className="sc-btn-confirm-delete" onClick={handleDelete}>Supprimer définitivement</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sc-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: #f4f4f8;
    padding: 32px 40px;
  }

  .sc-loading {
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

  .sc-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2ddf0;
    border-top-color: #6B21A8;
    border-radius: 50%;
    animation: sc-spin 0.7s linear infinite;
  }

  @keyframes sc-spin { to { transform: rotate(360deg); } }

  /* Header */
  .sc-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .sc-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #9189a8;
    margin-bottom: 8px;
  }

  .bc-sep { color: #c4bcda; }
  .bc-active { color: #6B21A8; font-weight: 600; }

  .sc-title { font-size: 26px; font-weight: 800; color: #1e1b2e; }
  .sc-subtitle { font-size: 13px; color: #9189a8; margin-top: 4px; }

  .sc-btn-add {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #6B21A8;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 20px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  }

  .sc-btn-add svg { width: 16px; height: 16px; }
  .sc-btn-add:hover { background: #581c87; box-shadow: 0 6px 20px rgba(107,33,168,0.35); transform: translateY(-1px); }

  /* Search */
  .sc-search-wrap { position: relative; margin-bottom: 20px; }

  .sc-search-wrap svg {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    width: 18px; height: 18px; color: #9189a8;
  }

  .sc-search-wrap input {
    width: 100%; max-width: 420px;
    padding: 12px 16px 12px 44px;
    border: 1.5px solid #e2ddf0; border-radius: 10px;
    font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e1b2e;
    background: white; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .sc-search-wrap input:focus { border-color: #6B21A8; box-shadow: 0 0 0 4px rgba(107,33,168,0.08); }
  .sc-search-wrap input::placeholder { color: #c4bcda; }

  /* Table */
  .sc-table-card {
    background: white; border-radius: 14px;
    box-shadow: 0 2px 12px rgba(107,33,168,0.07); overflow: hidden;
  }

  .sc-table { width: 100%; border-collapse: collapse; }

  .sc-table thead { background: #6B21A8; }

  .sc-table thead th {
    padding: 14px 20px; text-align: left;
    font-size: 12px; font-weight: 700;
    color: rgba(255,255,255,0.85); letter-spacing: 0.8px; text-transform: uppercase;
  }

  .sc-table tbody tr { border-bottom: 1px solid #f0ecfa; transition: background 0.15s; }
  .sc-table tbody tr:last-child { border-bottom: none; }
  .sc-table tbody tr:hover { background: #faf8ff; }
  .sc-table tbody td { padding: 14px 20px; font-size: 14px; color: #3d2e6b; }

  .sc-empty { text-align: center; color: #9189a8; padding: 40px !important; font-size: 14px; }

  .sc-secteur-cell { display: flex; align-items: center; gap: 12px; }

  .sc-secteur-icon {
    width: 36px; height: 36px; border-radius: 9px;
    background: #ede9fe; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  .sc-secteur-icon svg { width: 16px; height: 16px; color: #6B21A8; }
  .sc-secteur-name { font-weight: 600; color: #1e1b2e; }

  .sc-users-wrap { display: flex; flex-wrap: wrap; gap: 6px; }

  .sc-user-chip {
    padding: 3px 10px; background: #f0ecfa; color: #6B21A8;
    border-radius: 20px; font-size: 12px; font-weight: 500;
  }

  .sc-no-user { font-size: 13px; color: #c4bcda; font-style: italic; }

  .sc-action-btns { display: flex; gap: 8px; justify-content: flex-end; }

  .sc-btn-edit, .sc-btn-delete {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; border: none; transition: background 0.15s, transform 0.1s;
  }

  .sc-btn-edit svg, .sc-btn-delete svg { width: 14px; height: 14px; }

  .sc-btn-edit { background: #ede9fe; color: #6B21A8; }
  .sc-btn-edit:hover { background: #6B21A8; color: white; transform: translateY(-1px); }

  .sc-btn-delete { background: #fee2e2; color: #dc2626; }
  .sc-btn-delete:hover { background: #dc2626; color: white; transform: translateY(-1px); }

  /* Modal */
  .sc-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,46,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; z-index: 1000;
  }

  .sc-modal {
    background: white; border-radius: 18px;
    width: 100%; max-width: 460px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18); overflow: hidden;
  }

  .sc-modal-sm { max-width: 400px; padding: 36px 32px; text-align: center; }

  .sc-modal-header {
    background: #6B21A8; padding: 24px 28px;
    display: flex; align-items: center; justify-content: space-between;
  }

  .sc-modal-header-left { display: flex; align-items: center; gap: 12px; }

  .sc-modal-icon {
    width: 40px; height: 40px; background: rgba(255,255,255,0.15);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
  }

  .sc-modal-icon svg { width: 20px; height: 20px; color: white; }

  .sc-modal-header h2 { font-size: 18px; font-weight: 700; color: white; margin: 0; font-family: 'Outfit', sans-serif; }
  .sc-modal-header p  { font-size: 12px; color: rgba(255,255,255,0.6); margin: 2px 0 0; font-family: 'Outfit', sans-serif; }

  .sc-modal-close {
    width: 32px; height: 32px; background: rgba(255,255,255,0.12);
    border: none; border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s; color: white;
  }

  .sc-modal-close:hover { background: rgba(255,255,255,0.22); }
  .sc-modal-close svg { width: 16px; height: 16px; }

  .sc-modal-body { padding: 28px; font-family: 'Outfit', sans-serif; }

  .sc-notice {
    background: #f9f7ff; border: 1.5px solid #e2ddf0; border-radius: 10px;
    padding: 10px 14px; font-size: 12px; color: #6B21A8;
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }

  .sc-notice svg { width: 14px; height: 14px; flex-shrink: 0; }

  .sc-error {
    background: #fff0f0; border-left: 4px solid #ef4444; color: #b91c1c;
    padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }

  .sc-error svg { width: 16px; height: 16px; flex-shrink: 0; }

  .sc-group { margin-bottom: 18px; }

  .sc-label {
    display: block; font-size: 12px; font-weight: 700; color: #3d2e6b;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
  }

  .sc-input-wrap { position: relative; }

  .sc-input-wrap svg {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    width: 16px; height: 16px; color: #9189a8; pointer-events: none;
  }

  .sc-input {
    width: 100%; padding: 11px 14px 11px 40px;
    border: 1.5px solid #e2ddf0; border-radius: 10px;
    font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e1b2e;
    background: #fafafa; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }

  .sc-input:focus { border-color: #6B21A8; background: white; box-shadow: 0 0 0 4px rgba(107,33,168,0.08); }
  .sc-input::placeholder { color: #c4bcda; }

  .sc-divider { border: none; border-top: 1px solid #f0ecfa; margin: 24px 0; }

  .sc-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .sc-modal-actions-center { justify-content: center; margin-top: 24px; }

  .sc-btn-cancel {
    padding: 11px 20px; border-radius: 10px; border: 1.5px solid #e2ddf0;
    background: white; color: #6b7280; font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .sc-btn-cancel:hover { background: #f9f7ff; border-color: #c4bcda; }

  .sc-btn-submit {
    padding: 11px 24px; border-radius: 10px; border: none;
    background: #6B21A8; color: white; font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  }

  .sc-btn-submit svg { width: 16px; height: 16px; }
  .sc-btn-submit:hover { background: #581c87; box-shadow: 0 6px 20px rgba(107,33,168,0.35); transform: translateY(-1px); }

  .sc-btn-orange { background: #F97316 !important; }
  .sc-btn-orange:hover { background: #ea6a05 !important; box-shadow: 0 6px 20px rgba(249,115,22,0.35) !important; }

  /* Delete modal */
  .sc-delete-icon-wrap {
    width: 56px; height: 56px; background: #fee2e2; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
  }

  .sc-delete-icon-wrap svg { width: 26px; height: 26px; color: #dc2626; }

  .sc-delete-title { font-size: 20px; font-weight: 700; color: #1e1b2e; margin-bottom: 10px; font-family: 'Outfit', sans-serif; }
  .sc-delete-text  { font-size: 14px; color: #6b7280; line-height: 1.6; font-family: 'Outfit', sans-serif; }

  .sc-btn-confirm-delete {
    padding: 11px 22px; border-radius: 9px; border: none;
    background: #dc2626; color: white; font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .sc-btn-confirm-delete:hover { background: #b91c1c; box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

  @media (max-width: 768px) {
    .sc-root { padding: 20px 16px; }
    .sc-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .sc-btn-add { width: 100%; justify-content: center; }
  }
`;