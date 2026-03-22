"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface UserNavbarProps {
  showBack?: boolean;
  backUrl?: string;
}

export default function UserNavbar({ showBack = false, backUrl = "/dashboard" }: UserNavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const prenom = session?.user?.name?.split(" ")[0] || "Utilisateur";
  const initiale = prenom.charAt(0).toUpperCase();
  const role = session?.user?.role || "VIEWER";

  const getRoleColor = () => {
    switch(role) {
      case "MANAGER": return "#F97316";
      case "ANALYST": return "#3b82f6";
      default: return "#10b981";
    }
  };

  const getRoleLabel = () => {
    switch(role) {
      case "MANAGER": return "Manager";
      case "ANALYST": return "Analyste";
      default: return "Viewer";
    }
  };

  return (
    <>
      <style>{userNavStyles}</style>

      {/* Navbar principale */}
      <nav className="un-navbar">
        <div className="un-brand">
          <div className="un-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span className="un-brand-name">PEDAGO <span>BI</span></span>
        </div>

        <div className="un-nav-right">
          <div className="un-user-pill">
            <div className="un-avatar">{initiale}</div>
            <div className="un-user-meta">
              <span className="un-user-name">{session?.user?.name}</span>
              <span className="un-role-badge" style={{ color: getRoleColor() }}>{getRoleLabel()}</span>
            </div>
          </div>
          <button className="un-btn-logout" onClick={() => setShowLogoutConfirm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Bouton retour si nécessaire */}
      {showBack && (
        <div className="un-subbar">
          <button className="un-back-btn" onClick={() => router.push(backUrl)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Retour
          </button>
        </div>
      )}

      {/* Modal de confirmation déconnexion */}
      {showLogoutConfirm && (
        <div className="un-overlay">
          <div className="un-modal">
            <div className="un-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2>Déconnexion</h2>
            <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="un-modal-actions">
              <button className="un-btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Annuler
              </button>
              <button className="un-btn-confirm" onClick={() => signOut({ callbackUrl: "/login" })}>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const userNavStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  .un-navbar {
    font-family: 'Outfit', sans-serif;
    background: #6B21A8;
    height: 64px;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 4px 16px rgba(107,33,168,0.25);
  }

  .un-brand { display: flex; align-items: center; gap: 12px; }
  .un-brand-icon {
    width: 38px; height: 38px;
    background: #F97316; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }
  .un-brand-icon svg { width: 20px; height: 20px; fill: white; }
  .un-brand-name { font-size: 20px; font-weight: 800; color: white; letter-spacing: 2px; }
  .un-brand-name span { color: #F97316; }

  .un-nav-right { display: flex; align-items: center; gap: 12px; }

  .un-user-pill {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.12);
    padding: 5px 14px 5px 5px;
    border-radius: 40px;
  }
  .un-avatar {
    width: 36px; height: 36px;
    background: #F97316; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px; color: white;
  }
  .un-user-meta { display: flex; flex-direction: column; gap: 1px; }
  .un-user-name { font-size: 13px; font-weight: 600; color: white; }
  .un-role-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

  .un-btn-logout {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 9px; border: none;
    background: rgba(239,68,68,0.18); color: #fca5a5;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s, color 0.15s, transform 0.1s;
  }
  .un-btn-logout svg { width: 15px; height: 15px; }
  .un-btn-logout:hover { background: rgba(239,68,68,0.35); color: white; transform: translateY(-1px); }

  .un-subbar {
    font-family: 'Outfit', sans-serif;
    background: white;
    border-bottom: 1px solid #ede9fe;
    padding: 10px 40px;
    box-shadow: 0 1px 4px rgba(107,33,168,0.06);
  }

  .un-back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 18px;
    background: #f5f3ff;
    color: #6B21A8;
    border: 1.5px solid #ddd6fe;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.15s;
  }
  .un-back-btn svg { width: 15px; height: 15px; }
  .un-back-btn:hover {
    background: #6B21A8; color: white;
    border-color: #6B21A8;
    transform: translateX(-3px);
  }

  .un-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,46,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; z-index: 9999;
  }
  .un-modal {
    background: white; border-radius: 18px;
    padding: 36px 32px; max-width: 400px; width: 100%;
    text-align: center;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    font-family: 'Outfit', sans-serif;
  }
  .un-modal-icon {
    width: 56px; height: 56px; background: #fee2e2; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .un-modal-icon svg { width: 26px; height: 26px; color: #dc2626; }
  .un-modal h2 { font-size: 20px; font-weight: 700; color: #1e1b2e; margin-bottom: 10px; }
  .un-modal p { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 28px; }
  .un-modal-actions { display: flex; gap: 12px; justify-content: center; }

  .un-btn-cancel {
    padding: 11px 22px; border-radius: 9px;
    border: 1.5px solid #e2ddf0; background: white; color: #6b7280;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .un-btn-cancel:hover { background: #f9f7ff; border-color: #c4bcda; }

  .un-btn-confirm {
    padding: 11px 22px; border-radius: 9px; border: none;
    background: #dc2626; color: white;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: background 0.15s, box-shadow 0.15s;
  }
  .un-btn-confirm:hover { background: #b91c1c; box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

  @media (max-width: 768px) {
    .un-navbar { padding: 0 16px; }
    .un-user-meta { display: none; }
    .un-subbar { padding: 10px 16px; }
  }
`;