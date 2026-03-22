"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface AdminNavbarProps {
  showBack?: boolean; // afficher le bouton retour vers /admin
}

export default function AdminNavbar({ showBack = false }: AdminNavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const prenom = session?.user?.name?.split(" ")[0] || "Admin";
  const initiale = prenom.charAt(0).toUpperCase();
  const role = session?.user?.role || "ADMIN";

  return (
    <>
      <style>{navStyles}</style>

      {/* ── Navbar principale ── */}
      <nav className="an-navbar">
        <div className="an-brand">
          <div className="an-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span className="an-brand-name">PEDAGO <span>BI</span></span>
        </div>

        <div className="an-nav-right">
          <div className="an-user-pill">
            <div className="an-avatar">{initiale}</div>
            <div className="an-user-meta">
              <span className="an-user-name">{session?.user?.name}</span>
              <span className="an-role-badge">{role}</span>
            </div>
          </div>
          <button className="an-btn-logout" onClick={() => setShowLogoutConfirm(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* ── Barre retour (sous la navbar, visible seulement sur les sous-pages) ── */}
      {showBack && (
        <div className="an-subbar">
          <button className="an-back-btn" onClick={() => router.push("/admin")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Retour au panneau d'administration
          </button>
        </div>
      )}

      {/* ── Modal confirmation déconnexion ── */}
      {showLogoutConfirm && (
        <div className="an-overlay">
          <div className="an-modal">
            <div className="an-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2>Déconnexion</h2>
            <p>Êtes-vous sûr de vouloir vous déconnecter de votre espace administrateur ?</p>
            <div className="an-modal-actions">
              <button className="an-btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Annuler
              </button>
              <button className="an-btn-confirm" onClick={() => signOut({ callbackUrl: "/login" })}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  /* ── Navbar ── */
  .an-navbar {
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

  .an-brand { display: flex; align-items: center; gap: 12px; }
  .an-brand-icon {
    width: 38px; height: 38px;
    background: #F97316; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }
  .an-brand-icon svg { width: 20px; height: 20px; fill: white; }
  .an-brand-name { font-size: 20px; font-weight: 800; color: white; letter-spacing: 2px; }
  .an-brand-name span { color: #F97316; }

  .an-nav-right { display: flex; align-items: center; gap: 12px; }

  .an-user-pill {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.12);
    padding: 5px 14px 5px 5px;
    border-radius: 40px;
  }
  .an-avatar {
    width: 36px; height: 36px;
    background: #F97316; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px; color: white;
  }
  .an-user-meta { display: flex; flex-direction: column; gap: 1px; }
  .an-user-name { font-size: 13px; font-weight: 600; color: white; font-family: 'Outfit', sans-serif; }
  .an-role-badge { font-size: 10px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', sans-serif; }

  .an-btn-logout {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 9px; border: none;
    background: rgba(239,68,68,0.18); color: #fca5a5;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s, color 0.15s, transform 0.1s;
  }
  .an-btn-logout svg { width: 15px; height: 15px; flex-shrink: 0; }
  .an-btn-logout:hover { background: rgba(239,68,68,0.35); color: white; transform: translateY(-1px); }

  /* ── Sous-barre retour ── */
  .an-subbar {
    font-family: 'Outfit', sans-serif;
    background: white;
    border-bottom: 1px solid #ede9fe;
    padding: 10px 40px;
    box-shadow: 0 1px 4px rgba(107,33,168,0.06);
  }

  .an-back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 18px;
    background: #f5f3ff;
    color: #6B21A8;
    border: 1.5px solid #ddd6fe;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s;
  }
  .an-back-btn svg { width: 15px; height: 15px; transition: transform 0.2s; }
  .an-back-btn:hover {
    background: #6B21A8; color: white;
    border-color: #6B21A8;
    transform: translateX(-3px);
    box-shadow: 0 4px 14px rgba(107,33,168,0.25);
  }
  .an-back-btn:hover svg { transform: translateX(-2px); }

  /* ── Modal déconnexion ── */
  .an-overlay {
    position: fixed; inset: 0;
    background: rgba(30,27,46,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; z-index: 9999;
  }
  .an-modal {
    background: white; border-radius: 18px;
    padding: 36px 32px; max-width: 400px; width: 100%;
    text-align: center;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    font-family: 'Outfit', sans-serif;
    animation: an-pop 0.2s ease;
  }
  @keyframes an-pop { from { opacity:0; transform: scale(0.95); } to { opacity:1; transform: scale(1); } }
  .an-modal-icon {
    width: 56px; height: 56px; background: #fee2e2; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .an-modal-icon svg { width: 26px; height: 26px; color: #dc2626; }
  .an-modal h2 { font-size: 20px; font-weight: 700; color: #1e1b2e; margin-bottom: 10px; }
  .an-modal p  { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 28px; }
  .an-modal-actions { display: flex; gap: 12px; justify-content: center; }

  .an-btn-cancel {
    padding: 11px 22px; border-radius: 9px;
    border: 1.5px solid #e2ddf0; background: white; color: #6b7280;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .an-btn-cancel:hover { background: #f9f7ff; border-color: #c4bcda; }

  .an-btn-confirm {
    display: flex; align-items: center; gap: 7px;
    padding: 11px 22px; border-radius: 9px; border: none;
    background: #dc2626; color: white;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: background 0.15s, box-shadow 0.15s;
  }
  .an-btn-confirm svg { width: 16px; height: 16px; }
  .an-btn-confirm:hover { background: #b91c1c; box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .an-navbar { padding: 0 16px; }
    .an-subbar  { padding: 10px 16px; }
    .an-user-meta { display: none; }
    .an-btn-logout span { display: none; }
    .an-back-btn { font-size: 12px; padding: 7px 14px; }
  }
`;