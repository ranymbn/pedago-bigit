"use client";

import { useState, useEffect } from "react";

interface Secteur {
  id: string;
  nom: string;
}

interface AjoutUtilisateurProps {
  onUserAdded: () => void;
  onClose: () => void;
}

export default function AjoutUtilisateur({ onUserAdded, onClose }: AjoutUtilisateurProps) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    role: "VIEWER",
    secteurs: [] as string[]
  });
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Charger la liste des secteurs
  useEffect(() => {
    fetchSecteurs();
  }, []);

  const fetchSecteurs = async () => {
    try {
      const res = await fetch("/api/secteurs");
      const data = await res.json();
      setSecteurs(data);
    } catch (error) {
      console.error("Erreur chargement secteurs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Créer l'utilisateur
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          email: formData.email,
          motDePasse: formData.motDePasse,
          role: formData.role
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création");
      }

      // 2. Attribuer les secteurs
      if (formData.secteurs.length > 0) {
        for (const secteurId of formData.secteurs) {
          await fetch(`/api/users/${data.id}/secteurs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secteurId })
          });
        }
      }

      onUserAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecteur = (secteurId: string) => {
    setFormData(prev => ({
      ...prev,
      secteurs: prev.secteurs.includes(secteurId)
        ? prev.secteurs.filter(id => id !== secteurId)
        : [...prev.secteurs, secteurId]
    }));
  };

  const roleColors: Record<string, string> = {
    VIEWER:  "#9189a8",
    MANAGER: "#c2410c",
    ANALYST: "#0369a1",
    ADMIN:   "#6B21A8",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .aj-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30, 27, 46, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 1000;
          font-family: 'Outfit', sans-serif;
        }

        .aj-card {
          background: white;
          border-radius: 18px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }

        /* Header */
        .aj-header {
          background: #6B21A8;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .aj-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aj-header-icon {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .aj-header-icon svg {
          width: 20px;
          height: 20px;
          color: white;
        }

        .aj-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .aj-header p {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin: 2px 0 0;
        }

        .aj-close {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.12);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          color: white;
        }

        .aj-close:hover { background: rgba(255,255,255,0.22); }
        .aj-close svg { width: 16px; height: 16px; }

        /* Body */
        .aj-body { 
          padding: 28px;
          max-height: 70vh;
          overflow-y: auto;
        }

        /* Error */
        .aj-error {
          background: #fff0f0;
          border-left: 4px solid #ef4444;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .aj-error svg { width: 16px; height: 16px; flex-shrink: 0; }

        /* Form group */
        .aj-group { margin-bottom: 18px; }

        .aj-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #3d2e6b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .aj-input-wrap { position: relative; }

        .aj-input-wrap svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9189a8;
          pointer-events: none;
        }

        .aj-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid #e2ddf0;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #1e1b2e;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .aj-input:focus {
          border-color: #6B21A8;
          background: white;
          box-shadow: 0 0 0 4px rgba(107,33,168,0.08);
        }

        .aj-input::placeholder { color: #c4bcda; }

        /* Select */
        .aj-select-wrap { position: relative; }

        .aj-select-wrap .aj-select-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9189a8;
          pointer-events: none;
        }

        .aj-select {
          width: 100%;
          padding: 11px 36px 11px 40px;
          border: 1.5px solid #e2ddf0;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #1e1b2e;
          background: #fafafa;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .aj-select:focus {
          border-color: #6B21A8;
          background: white;
          box-shadow: 0 0 0 4px rgba(107,33,168,0.08);
        }

        .aj-select-chevron {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9189a8;
          pointer-events: none;
        }

        /* Secteurs */
        .aj-secteurs-container {
          border: 1.5px solid #e2ddf0;
          border-radius: 10px;
          padding: 12px;
          max-height: 150px;
          overflow-y: auto;
          background: #fafafa;
        }

        .aj-secteur-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
        }

        .aj-secteur-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #6B21A8;
          cursor: pointer;
        }

        .aj-secteur-label {
          font-size: 14px;
          color: #1e1b2e;
          cursor: pointer;
        }

        .aj-empty-secteurs {
          color: #9189a8;
          font-size: 13px;
          text-align: center;
          padding: 10px;
        }

        /* Role preview badge */
        .aj-role-preview {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #9189a8;
        }

        .aj-role-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Divider */
        .aj-divider {
          border: none;
          border-top: 1px solid #f0ecfa;
          margin: 24px 0;
        }

        /* Footer actions */
        .aj-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .aj-btn-cancel {
          padding: 11px 20px;
          border-radius: 10px;
          border: 1.5px solid #e2ddf0;
          background: white;
          color: #6b7280;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .aj-btn-cancel:hover {
          background: #f9f7ff;
          border-color: #c4bcda;
        }

        .aj-btn-submit {
          padding: 11px 24px;
          border-radius: 10px;
          border: none;
          background: #6B21A8;
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        }

        .aj-btn-submit:hover:not(:disabled) {
          background: #581c87;
          box-shadow: 0 6px 20px rgba(107,33,168,0.35);
          transform: translateY(-1px);
        }

        .aj-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .aj-btn-submit svg { width: 16px; height: 16px; }

        .aj-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: aj-spin 0.7s linear infinite;
        }

        @keyframes aj-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="aj-overlay">
        <div className="aj-card">

          {/* Header */}
          <div className="aj-header">
            <div className="aj-header-left">
              <div className="aj-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </div>
              <div>
                <h2>Nouvel utilisateur</h2>
                <p>Remplissez les informations ci-dessous</p>
              </div>
            </div>
            <button className="aj-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="aj-body">

            {error && (
              <div className="aj-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Nom */}
              <div className="aj-group">
                <label className="aj-label">Nom complet</label>
                <div className="aj-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    className="aj-input"
                    placeholder="Jean Dupont"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="aj-group">
                <label className="aj-label">Adresse email</label>
                <div className="aj-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    className="aj-input"
                    placeholder="jean.dupont@pedago.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="aj-group">
                <label className="aj-label">Mot de passe</label>
                <div className="aj-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    className="aj-input"
                    placeholder="••••••••"
                    value={formData.motDePasse}
                    onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Rôle */}
              <div className="aj-group">
                <label className="aj-label">Rôle</label>
                <div className="aj-select-wrap">
                  <svg className="aj-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <select
                    className="aj-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <svg className="aj-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div className="aj-role-preview">
                  <div
                    className="aj-role-dot"
                    style={{ background: roleColors[formData.role] }}
                  />
                  <span>Rôle sélectionné : <strong>{formData.role}</strong></span>
                </div>
              </div>

              {/* Secteurs */}
              <div className="aj-group">
                <label className="aj-label">Secteurs</label>
                <div className="aj-secteurs-container">
                  {secteurs.length === 0 ? (
                    <div className="aj-empty-secteurs">
                      Aucun secteur disponible
                    </div>
                  ) : (
                    secteurs.map((secteur) => (
                      <div key={secteur.id} className="aj-secteur-item">
                        <input
                          type="checkbox"
                          id={`secteur-${secteur.id}`}
                          className="aj-secteur-checkbox"
                          checked={formData.secteurs.includes(secteur.id)}
                          onChange={() => toggleSecteur(secteur.id)}
                        />
                        <label htmlFor={`secteur-${secteur.id}`} className="aj-secteur-label">
                          {secteur.nom}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour aucun secteur
                </p>
              </div>

              <hr className="aj-divider" />

              {/* Actions */}
              <div className="aj-actions">
                <button type="button" className="aj-btn-cancel" onClick={onClose}>
                  Annuler
                </button>
                <button type="submit" className="aj-btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="aj-spinner" />
                      Création...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      Créer l'utilisateur
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}