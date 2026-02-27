"use client";

import { useState, useEffect } from "react";

interface Secteur {
  id: string;
  nom: string;
}

interface ModifierUtilisateurProps {
  userId: string;
  onUserUpdated: () => void;
  onClose: () => void;
}

export default function ModifierUtilisateur({ userId, onUserUpdated, onClose }: ModifierUtilisateurProps) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    role: "VIEWER",
    motDePasse: "",
    secteurs: [] as string[]
  });
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger l'utilisateur
        const userRes = await fetch(`/api/users/${userId}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.error || "Erreur lors du chargement");

        // Charger les secteurs disponibles
        const secteursRes = await fetch("/api/secteurs");
        const secteursData = await secteursRes.json();
        setSecteurs(secteursData);

        // Charger les secteurs de l'utilisateur
        const userSecteursRes = await fetch(`/api/users/${userId}/secteurs`);
        const userSecteursData = await userSecteursRes.json();

        setFormData({
          nom: userData.nom || "",
          email: userData.email || "",
          role: userData.role || "VIEWER",
          motDePasse: "",
          secteurs: userSecteursData.map((s: Secteur) => s.id)
        });
      } catch (err: any) {
        const msg = err.message || "";
        if (msg.includes("<!DOCTYPE") || msg.includes("not valid JSON")) {
          setError("Impossible de charger les données. Vérifiez votre connexion ou reconnectez-vous.");
        } else {
          setError(msg);
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Mettre à jour l'utilisateur
      const dataToSend: any = {
        nom: formData.nom,
        email: formData.email,
        role: formData.role
      };
      if (formData.motDePasse) {
        dataToSend.motDePasse = formData.motDePasse;
      }

      const userRes = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.error || "Erreur lors de la modification");

      // 2. Récupérer les secteurs actuels
      const secteursRes = await fetch(`/api/users/${userId}/secteurs`);
      const secteursActuels = await secteursRes.json();
      const secteursActuelsIds = secteursActuels.map((s: Secteur) => s.id);

      // 3. Ajouter les nouveaux secteurs
      for (const secteurId of formData.secteurs) {
        if (!secteursActuelsIds.includes(secteurId)) {
          await fetch(`/api/users/${userId}/secteurs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secteurId })
          });
        }
      }

      // 4. Retirer les secteurs qui ne sont plus sélectionnés
      for (const secteurId of secteursActuelsIds) {
        if (!formData.secteurs.includes(secteurId)) {
          await fetch(`/api/users/${userId}/secteurs?secteurId=${secteurId}`, {
            method: "DELETE"
          });
        }
      }

      onUserUpdated();
      onClose();
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("<!DOCTYPE") || msg.includes("not valid JSON")) {
        setError("Une erreur serveur est survenue. Veuillez réessayer ou reconnectez-vous.");
      } else {
        setError(msg);
      }
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

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

    .mj-overlay {
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

    .mj-card {
      background: white;
      border-radius: 18px;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
      overflow: hidden;
    }

    .mj-header {
      background: #6B21A8;
      padding: 24px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .mj-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mj-header-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mj-header-icon svg { width: 20px; height: 20px; color: white; }

    .mj-header h2 { font-size: 18px; font-weight: 700; color: white; margin: 0; }
    .mj-header p  { font-size: 12px; color: rgba(255,255,255,0.6); margin: 2px 0 0; }

    .mj-close {
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

    .mj-close:hover { background: rgba(255,255,255,0.22); }
    .mj-close svg { width: 16px; height: 16px; }

    .mj-body { 
      padding: 28px;
      max-height: 70vh;
      overflow-y: auto;
    }

    /* Loading state */
    .mj-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 40px 28px;
      color: #9189a8;
      font-size: 14px;
    }

    .mj-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2ddf0;
      border-top-color: #6B21A8;
      border-radius: 50%;
      animation: mj-spin 0.7s linear infinite;
    }

    @keyframes mj-spin { to { transform: rotate(360deg); } }

    /* Notice */
    .mj-notice {
      background: #f9f7ff;
      border: 1.5px solid #e2ddf0;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12px;
      color: #6B21A8;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mj-notice svg { width: 14px; height: 14px; flex-shrink: 0; }

    /* Error */
    .mj-error {
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

    .mj-error svg { width: 16px; height: 16px; flex-shrink: 0; }

    .mj-group { margin-bottom: 18px; }

    .mj-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #3d2e6b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .mj-label-opt {
      font-size: 10px;
      font-weight: 500;
      color: #9189a8;
      text-transform: none;
      letter-spacing: 0;
      margin-left: 6px;
    }

    .mj-input-wrap { position: relative; }

    .mj-input-wrap svg {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: #9189a8;
      pointer-events: none;
    }

    .mj-input {
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

    .mj-input:focus {
      border-color: #6B21A8;
      background: white;
      box-shadow: 0 0 0 4px rgba(107,33,168,0.08);
    }

    .mj-input::placeholder { color: #c4bcda; }

    .mj-select-wrap { position: relative; }

    .mj-select-icon {
      position: absolute;
      left: 13px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: #9189a8;
      pointer-events: none;
    }

    .mj-select {
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

    .mj-select:focus {
      border-color: #6B21A8;
      background: white;
      box-shadow: 0 0 0 4px rgba(107,33,168,0.08);
    }

    .mj-select-chevron {
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
    .mj-secteurs-container {
      border: 1.5px solid #e2ddf0;
      border-radius: 10px;
      padding: 12px;
      max-height: 150px;
      overflow-y: auto;
      background: #fafafa;
    }

    .mj-secteur-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
    }

    .mj-secteur-checkbox {
      width: 16px;
      height: 16px;
      accent-color: #6B21A8;
      cursor: pointer;
    }

    .mj-secteur-label {
      font-size: 14px;
      color: #1e1b2e;
      cursor: pointer;
    }

    .mj-empty-secteurs {
      color: #9189a8;
      font-size: 13px;
      text-align: center;
      padding: 10px;
    }

    .mj-role-preview {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #9189a8;
    }

    .mj-role-dot { width: 8px; height: 8px; border-radius: 50%; }

    .mj-divider {
      border: none;
      border-top: 1px solid #f0ecfa;
      margin: 24px 0;
    }

    .mj-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .mj-btn-cancel {
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

    .mj-btn-cancel:hover { background: #f9f7ff; border-color: #c4bcda; }

    .mj-btn-submit {
      padding: 11px 24px;
      border-radius: 10px;
      border: none;
      background: #F97316;
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

    .mj-btn-submit:hover:not(:disabled) {
      background: #ea6a05;
      box-shadow: 0 6px 20px rgba(249,115,22,0.35);
      transform: translateY(-1px);
    }

    .mj-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .mj-btn-submit svg { width: 16px; height: 16px; }

    .mj-btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: white;
      border-radius: 50%;
      animation: mj-spin 0.7s linear infinite;
    }
  `;

  // Loading state
  if (initialLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="mj-overlay">
          <div className="mj-card">
            <div className="mj-header">
              <div className="mj-header-left">
                <div className="mj-header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div>
                  <h2>Modifier l'utilisateur</h2>
                  <p>Chargement des données...</p>
                </div>
              </div>
              <button className="mj-close" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="mj-loading">
              <div className="mj-spinner" />
              <span>Chargement des informations...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="mj-overlay">
        <div className="mj-card">

          {/* Header */}
          <div className="mj-header">
            <div className="mj-header-left">
              <div className="mj-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h2>Modifier l'utilisateur</h2>
                <p>Mettez à jour les informations ci-dessous</p>
              </div>
            </div>
            <button className="mj-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="mj-body">

            {/* Info notice */}
            <div className="mj-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Modification de l'utilisateur <strong style={{ marginLeft: 4 }}>{formData.nom}</strong>
            </div>

            {error && (
              <div className="mj-error">
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
              <div className="mj-group">
                <label className="mj-label">Nom complet</label>
                <div className="mj-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    className="mj-input"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mj-group">
                <label className="mj-label">Adresse email</label>
                <div className="mj-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    className="mj-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="mj-group">
                <label className="mj-label">
                  Nouveau mot de passe
                  <span className="mj-label-opt">(laisser vide pour ne pas changer)</span>
                </label>
                <div className="mj-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    className="mj-input"
                    placeholder="••••••••"
                    value={formData.motDePasse}
                    onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                  />
                </div>
              </div>

              {/* Rôle */}
              <div className="mj-group">
                <label className="mj-label">Rôle</label>
                <div className="mj-select-wrap">
                  <svg className="mj-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <select
                    className="mj-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <svg className="mj-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div className="mj-role-preview">
                  <div className="mj-role-dot" style={{ background: roleColors[formData.role] }} />
                  <span>Rôle sélectionné : <strong>{formData.role}</strong></span>
                </div>
              </div>

              {/* Secteurs */}
              <div className="mj-group">
                <label className="mj-label">Secteurs</label>
                <div className="mj-secteurs-container">
                  {secteurs.length === 0 ? (
                    <div className="mj-empty-secteurs">
                      Aucun secteur disponible
                    </div>
                  ) : (
                    secteurs.map((secteur) => (
                      <div key={secteur.id} className="mj-secteur-item">
                        <input
                          type="checkbox"
                          id={`secteur-${secteur.id}`}
                          className="mj-secteur-checkbox"
                          checked={formData.secteurs.includes(secteur.id)}
                          onChange={() => toggleSecteur(secteur.id)}
                        />
                        <label htmlFor={`secteur-${secteur.id}`} className="mj-secteur-label">
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

              <hr className="mj-divider" />

              {/* Actions */}
              <div className="mj-actions">
                <button type="button" className="mj-btn-cancel" onClick={onClose}>
                  Annuler
                </button>
                <button type="submit" className="mj-btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="mj-btn-spinner" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Enregistrer les modifications
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