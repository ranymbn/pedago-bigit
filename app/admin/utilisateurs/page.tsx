"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AjoutUtilisateur from "./AjoutUtilisateur";
import ModifierUtilisateur from "./ModifierUtilisateur";

interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId: string) => {
    setUserToEdit(userId);
    setShowModifierModal(true);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users/${userToDelete}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }
      fetchUsers();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading") {
    return (
      <>
        <style>{styles}</style>
        <div className="pedago-loading">
          <div className="pedago-spinner" />
          <p>Chargement de la session...</p>
        </div>
      </>
    );
  }

  if (status === "unauthenticated" || !session) redirect("/login");

  if (session?.user?.role !== "ADMIN") {
    return (
      <>
        <style>{styles}</style>
        <div className="pedago-loading">
          <div className="access-denied-icon">⛔</div>
          <h2>Accès non autorisé</h2>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
          <p className="role-tag">Rôle actuel : <strong>{session?.user?.role || "non défini"}</strong></p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="pedago-loading">
          <div className="pedago-spinner" />
          <p>Chargement des utilisateurs...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="admin-root">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-left">
            <div className="admin-breadcrumb">
              <span>🏠</span>
              <span className="bc-sep">›</span>
              <span>Administration</span>
              <span className="bc-sep">›</span>
              <span className="bc-active">Utilisateurs</span>
            </div>
            <h1 className="admin-title">Gestion des utilisateurs</h1>
            <p className="admin-subtitle">{users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-add" onClick={() => setShowAjoutModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Nouvel utilisateur
            </button>
            <button 
              className="btn-secteurs" 
              onClick={() => window.location.href = "/admin/secteurs"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              Gérer les secteurs
            </button>
            <button 
              className="btn-dashboards" 
              onClick={() => window.location.href = "/admin/dashboards"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
              Gérer les dashboards
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou rôle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.nom.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{user.nom}</span>
                      </div>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => handleEdit(user.id)} title="Modifier">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Modifier
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteClick(user.id)} title="Supprimer">
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

        {/* Modals */}
        {showAjoutModal && (
          <AjoutUtilisateur
            onUserAdded={() => { fetchUsers(); setShowAjoutModal(false); }}
            onClose={() => setShowAjoutModal(false)}
          />
        )}

        {showModifierModal && userToEdit && (
          <ModifierUtilisateur
            userId={userToEdit}
            onUserUpdated={() => { fetchUsers(); setShowModifierModal(false); setUserToEdit(null); }}
            onClose={() => { setShowModifierModal(false); setUserToEdit(null); }}
          />
        )}

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <h2>Confirmer la suppression</h2>
              <p>Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                >
                  Annuler
                </button>
                <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>
                  Supprimer définitivement
                </button>
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

  .admin-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: #f4f4f8;
    padding: 32px 40px;
  }

  /* Loading / Error */
  .pedago-loading {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #6B21A8;
    background: #f4f4f8;
  }

  .pedago-loading h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1e1b2e;
  }

  .pedago-loading p {
    color: #6b7280;
    font-size: 14px;
  }

  .pedago-loading .role-tag {
    background: #ede9fe;
    color: #6B21A8;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
  }

  .access-denied-icon { font-size: 48px; }

  .pedago-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2ddf0;
    border-top-color: #6B21A8;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Header */
  .admin-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .admin-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #9189a8;
    margin-bottom: 8px;
  }

  .bc-sep { color: #c4bcda; }
  .bc-active { color: #6B21A8; font-weight: 600; }

  .admin-title {
    font-size: 26px;
    font-weight: 800;
    color: #1e1b2e;
    letter-spacing: -0.3px;
  }

  .admin-subtitle {
    font-size: 13px;
    color: #9189a8;
    margin-top: 4px;
  }

  .btn-add {
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

  .btn-add svg { width: 16px; height: 16px; }

  .btn-add:hover {
    background: #581c87;
    box-shadow: 0 6px 20px rgba(107,33,168,0.35);
    transform: translateY(-1px);
  }

  .btn-secteurs {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F97316;
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

  .btn-secteurs svg { width: 16px; height: 16px; }

  .btn-secteurs:hover {
    background: #e85d0e;
    box-shadow: 0 6px 20px rgba(249,115,22,0.35);
    transform: translateY(-1px);
  }

  .btn-dashboards {
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

  .btn-dashboards svg { width: 16px; height: 16px; }

  .btn-dashboards:hover {
    background: #581c87;
    box-shadow: 0 6px 20px rgba(107,33,168,0.35);
    transform: translateY(-1px);
  }

  /* Search */
  .search-wrap {
    position: relative;
    margin-bottom: 20px;
  }

  .search-wrap svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: #9189a8;
  }

  .search-wrap input {
    width: 100%;
    max-width: 420px;
    padding: 12px 16px 12px 44px;
    border: 1.5px solid #e2ddf0;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    color: #1e1b2e;
    background: white;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .search-wrap input:focus {
    border-color: #6B21A8;
    box-shadow: 0 0 0 4px rgba(107,33,168,0.08);
  }

  .search-wrap input::placeholder { color: #c4bcda; }

  /* Table */
  .table-card {
    background: white;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(107,33,168,0.07);
    overflow: hidden;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table thead {
    background: #6B21A8;
  }

  .users-table thead th {
    padding: 14px 20px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .users-table tbody tr {
    border-bottom: 1px solid #f0ecfa;
    transition: background 0.15s;
  }

  .users-table tbody tr:last-child { border-bottom: none; }
  .users-table tbody tr:hover { background: #faf8ff; }

  .users-table tbody td {
    padding: 14px 20px;
    font-size: 14px;
    color: #3d2e6b;
  }

  .empty-state {
    text-align: center;
    color: #9189a8;
    padding: 40px !important;
    font-size: 14px;
  }

  /* User cell */
  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #6B21A8;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .user-name {
    font-weight: 600;
    color: #1e1b2e;
  }

  .email-cell { color: #6b7280; font-size: 13px; }

  /* Role badges */
  .role-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .role-admin   { background: #ede9fe; color: #6B21A8; }
  .role-manager { background: #fff7ed; color: #c2410c; }
  .role-viewer  { background: #f0fdf4; color: #15803d; }
  .role-analyst { background: #e0f2fe; color: #0369a1; }

  /* Action buttons */
  .action-btns {
    display: flex;
    gap: 8px;
  }

  .btn-edit, .btn-delete {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background 0.15s, transform 0.1s;
  }

  .btn-edit svg, .btn-delete svg {
    width: 14px;
    height: 14px;
  }

  .btn-edit {
    background: #ede9fe;
    color: #6B21A8;
  }

  .btn-edit:hover {
    background: #6B21A8;
    color: white;
    transform: translateY(-1px);
  }

  .btn-delete {
    background: #fee2e2;
    color: #dc2626;
  }

  .btn-delete:hover {
    background: #dc2626;
    color: white;
    transform: translateY(-1px);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(30,27,46,0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1000;
  }

  .modal-card {
    background: white;
    border-radius: 16px;
    padding: 36px 32px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }

  .modal-icon-wrap {
    width: 56px;
    height: 56px;
    background: #fee2e2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .modal-icon-wrap svg {
    width: 26px;
    height: 26px;
    color: #dc2626;
  }

  .modal-card h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1e1b2e;
    margin-bottom: 10px;
  }

  .modal-card p {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 28px;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn-cancel {
    padding: 11px 22px;
    border-radius: 9px;
    border: 1.5px solid #e2ddf0;
    background: white;
    color: #6b7280;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-cancel:hover { background: #f9f7ff; }

  .btn-confirm-delete {
    padding: 11px 22px;
    border-radius: 9px;
    border: none;
    background: #dc2626;
    color: white;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .btn-confirm-delete:hover {
    background: #b91c1c;
    box-shadow: 0 4px 16px rgba(220,38,38,0.35);
  }

  @media (max-width: 768px) {
    .admin-root { padding: 20px 16px; }
    .admin-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .btn-add, .btn-secteurs, .btn-dashboards { width: 100%; justify-content: center; }
    .email-cell { display: none; }
  }
`;