"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AjoutUtilisateur from "./AjoutUtilisateur";
import ModifierUtilisateur from "./ModifierUtilisateur";
import AdminNavbar from "../../components/AdminNavbar"; // ✅ même navbar que /admin + bouton retour

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
    if (session?.user?.role === "ADMIN") fetchUsers();
    else setLoading(false);
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEdit = (id: string) => { setUserToEdit(id); setShowModifierModal(true); };
  const handleDeleteClick = (id: string) => { setUserToDelete(id); setShowDeleteConfirm(true); };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users/${userToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur suppression");
      fetchUsers(); setShowDeleteConfirm(false); setUserToDelete(null);
    } catch (e: any) { alert(e.message); }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) return (
    <><style>{styles}</style>
    <div className="u-loading"><div className="u-spinner"/><p>Chargement...</p></div></>
  );

  if (status === "unauthenticated" || !session) redirect("/login");
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <>
      <style>{styles}</style>

      {/* ✅ Même navbar que /admin, prop showBack ajoute le bouton retour */}
      <AdminNavbar showBack />

      <div className="u-root">

        {/* En-tête */}
        <div className="u-page-header">
          <h1 className="u-page-title">Gestion des utilisateurs</h1>
          <p className="u-page-sub">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Barre d'actions */}
        <div className="u-actions-bar">
          <div className="u-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="u-btn-add" onClick={() => setShowAjoutModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nouvel utilisateur
          </button>
        </div>

        {/* Tableau */}
        <div className="u-table-card">
          <table className="u-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="u-empty">Aucun utilisateur trouvé.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="u-user-cell">
                      <div className="u-avatar">{user.nom.charAt(0).toUpperCase()}</div>
                      <span className="u-user-name">{user.nom}</span>
                    </div>
                  </td>
                  <td className="u-email">{user.email}</td>
                  <td>
                    <span className={`u-role-badge u-role-${user.role.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>
                    <div className="u-action-btns">
                      <button className="u-btn-edit" onClick={() => handleEdit(user.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifier
                      </button>
                      <button className="u-btn-delete" onClick={() => handleDeleteClick(user.id)}>
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
              ))}
            </tbody>
          </table>
        </div>

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
          <div className="u-overlay">
            <div className="u-modal">
              <div className="u-modal-del-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <h2>Confirmer la suppression</h2>
              <p>Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <div className="u-modal-actions">
                <button className="u-btn-cancel" onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}>Annuler</button>
                <button className="u-btn-confirm-del" onClick={handleDeleteConfirm}>Supprimer définitivement</button>
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

  .u-root { font-family: 'Outfit', sans-serif; min-height: calc(100vh - 104px); background: #f4f4f8; padding: 28px 40px; }

  .u-loading { font-family: 'Outfit', sans-serif; min-height: 100vh; background: #f4f4f8; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #9189a8; font-size: 14px; }
  .u-spinner { width: 40px; height: 40px; border: 3px solid #e2ddf0; border-top-color: #6B21A8; border-radius: 50%; animation: u-spin 0.7s linear infinite; }
  @keyframes u-spin { to { transform: rotate(360deg); } }

  .u-page-header { margin-bottom: 20px; }
  .u-page-title { font-size: 24px; font-weight: 800; color: #1e1b2e; }
  .u-page-sub { font-size: 13px; color: #9189a8; margin-top: 4px; }

  .u-actions-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
  .u-search-wrap { position: relative; flex: 1; max-width: 420px; }
  .u-search-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #9189a8; }
  .u-search-wrap input { width: 100%; padding: 11px 16px 11px 44px; border: 1.5px solid #e2ddf0; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #1e1b2e; background: white; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .u-search-wrap input:focus { border-color: #6B21A8; box-shadow: 0 0 0 4px rgba(107,33,168,0.08); }
  .u-search-wrap input::placeholder { color: #c4bcda; }
  .u-btn-add { display: flex; align-items: center; gap: 8px; background: #6B21A8; color: white; border: none; border-radius: 10px; padding: 11px 20px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.2s, box-shadow 0.2s, transform 0.1s; }
  .u-btn-add svg { width: 16px; height: 16px; }
  .u-btn-add:hover { background: #581c87; box-shadow: 0 6px 20px rgba(107,33,168,0.3); transform: translateY(-1px); }

  .u-table-card { background: white; border-radius: 14px; box-shadow: 0 2px 12px rgba(107,33,168,0.07); overflow: hidden; }
  .u-table { width: 100%; border-collapse: collapse; }
  .u-table thead { background: #6B21A8; }
  .u-table thead th { padding: 14px 20px; text-align: left; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: 0.8px; text-transform: uppercase; }
  .u-table tbody tr { border-bottom: 1px solid #f0ecfa; transition: background 0.15s; }
  .u-table tbody tr:last-child { border-bottom: none; }
  .u-table tbody tr:hover { background: #faf8ff; }
  .u-table tbody td { padding: 14px 20px; font-size: 14px; color: #3d2e6b; }
  .u-empty { text-align: center; color: #9189a8; padding: 40px !important; font-size: 14px; }

  .u-user-cell { display: flex; align-items: center; gap: 12px; }
  .u-avatar { width: 36px; height: 36px; border-radius: 50%; background: #6B21A8; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
  .u-user-name { font-weight: 600; color: #1e1b2e; }
  .u-email { color: #6b7280; font-size: 13px; }

  .u-role-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; }
  .u-role-admin   { background: #ede9fe; color: #6B21A8; }
  .u-role-manager { background: #fff7ed; color: #c2410c; }
  .u-role-analyst { background: #eff6ff; color: #1d4ed8; }
  .u-role-user    { background: #f0fdf4; color: #15803d; }

  .u-action-btns { display: flex; gap: 8px; justify-content: flex-end; }
  .u-btn-edit, .u-btn-delete { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: background 0.15s, transform 0.1s; }
  .u-btn-edit svg, .u-btn-delete svg { width: 14px; height: 14px; }
  .u-btn-edit { background: #ede9fe; color: #6B21A8; }
  .u-btn-edit:hover { background: #6B21A8; color: white; transform: translateY(-1px); }
  .u-btn-delete { background: #fee2e2; color: #dc2626; }
  .u-btn-delete:hover { background: #dc2626; color: white; transform: translateY(-1px); }

  .u-overlay { position: fixed; inset: 0; background: rgba(30,27,46,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 9999; }
  .u-modal { background: white; border-radius: 18px; padding: 36px 32px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.18); font-family: 'Outfit', sans-serif; animation: u-pop 0.2s ease; }
  @keyframes u-pop { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  .u-modal-del-icon { width: 56px; height: 56px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .u-modal-del-icon svg { width: 26px; height: 26px; color: #dc2626; }
  .u-modal h2 { font-size: 20px; font-weight: 700; color: #1e1b2e; margin-bottom: 10px; }
  .u-modal p { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 28px; }
  .u-modal-actions { display: flex; gap: 12px; justify-content: center; }
  .u-btn-cancel { padding: 11px 22px; border-radius: 9px; border: 1.5px solid #e2ddf0; background: white; color: #6b7280; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
  .u-btn-cancel:hover { background: #f9f7ff; border-color: #c4bcda; }
  .u-btn-confirm-del { padding: 11px 22px; border-radius: 9px; border: none; background: #dc2626; color: white; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s, box-shadow 0.15s; }
  .u-btn-confirm-del:hover { background: #b91c1c; box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

  @media (max-width: 768px) {
    .u-root { padding: 20px 16px; }
    .u-actions-bar { flex-direction: column; align-items: stretch; }
    .u-search-wrap { max-width: 100%; }
    .u-btn-add { width: 100%; justify-content: center; }
    .u-email { display: none; }
  }
`;