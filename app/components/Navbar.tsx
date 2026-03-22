"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleDeconnexion = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const prenom = session?.user?.name?.split(" ")[0] || "Utilisateur";
  const initiale = prenom.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <span className="navbar-brand">PEDAGO <span>BI</span></span>
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">{initiale}</div>
          <span className="navbar-username">{prenom}</span>
        </div>
        <button onClick={handleDeconnexion} className="navbar-logout" title="Déconnexion">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}