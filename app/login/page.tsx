"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        // Récupérer la session pour connaître le rôle
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #f4f4f8;
        }

        /* Left panel */
        .login-left {
          width: 45%;
          background: #6B21A8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }

        .login-left::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 48px;
          z-index: 1;
        }

        .brand-icon {
          width: 52px;
          height: 52px;
          background: #F97316;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-icon svg {
          width: 26px;
          height: 26px;
          fill: white;
        }

        .brand-name {
          font-size: 28px;
          font-weight: 800;
          color: white;
          letter-spacing: 2px;
        }

        .brand-name span {
          color: #F97316;
        }

        .left-tagline {
          z-index: 1;
          text-align: center;
        }

        .left-tagline h2 {
          font-size: 32px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          margin-bottom: 16px;
        }

        .left-tagline p {
          font-size: 15px;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 320px;
        }

        .left-divider {
          width: 48px;
          height: 4px;
          background: #F97316;
          border-radius: 2px;
          margin: 28px auto;
        }

        .left-badge {
          z-index: 1;
          margin-top: 48px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px;
          padding: 16px 24px;
          text-align: center;
          backdrop-filter: blur(8px);
        }

        .left-badge p {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.5px;
        }

        .left-badge strong {
          color: #F97316;
        }

        /* Right panel */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          animation: fadeUp 0.6s ease-out;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-header {
          margin-bottom: 36px;
        }

        .login-header h1 {
          font-size: 26px;
          font-weight: 700;
          color: #1e1b2e;
          margin-bottom: 8px;
        }

        .login-header p {
          font-size: 14px;
          color: #9189a8;
        }

        .login-header .accent-bar {
          width: 36px;
          height: 4px;
          background: #6B21A8;
          border-radius: 2px;
          margin-bottom: 16px;
        }

        /* Error */
        .error-box {
          background: #fff0f0;
          border-left: 4px solid #ef4444;
          color: #b91c1c;
          padding: 14px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        /* Form */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #3d2e6b;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9189a8;
          width: 18px;
          height: 18px;
        }

        .form-group input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1.5px solid #e2ddf0;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #1e1b2e;
          background: #fafafa;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }

        .form-group input:focus {
          border-color: #6B21A8;
          background: white;
          box-shadow: 0 0 0 4px rgba(107,33,168,0.08);
        }

        .form-group input::placeholder {
          color: #c4bcda;
        }

        .forgot-link {
          text-align: right;
          margin-top: -12px;
          margin-bottom: 28px;
        }

        .forgot-link button {
          font-size: 12px;
          color: #6B21A8;
          text-decoration: none;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
        }

        .forgot-link button:hover {
          text-decoration: underline;
        }

        /* Submit button */
        .btn-submit {
          width: 100%;
          padding: 14px;
          background: #6B21A8;
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-submit:hover:not(:disabled) {
          background: #581c87;
          box-shadow: 0 6px 24px rgba(107,33,168,0.35);
          transform: translateY(-1px);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-submit .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Arrow icon in button */
        .btn-arrow {
          width: 18px;
          height: 18px;
        }

        /* Footer */
        .login-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #b8b0cc;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* Left decorative panel */}
        <div className="login-left">
          <div className="brand-logo">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div className="brand-name">PEDAGO <span>BI</span></div>
          </div>

          <div className="left-tagline">
            <h2>Pilotez votre établissement avec précision</h2>
            <div className="left-divider" />
            <p style={{ textAlign: "center" }}>
           Accédez en temps réel à vos indicateurs clés, exploitez des analyses approfondies et prenez les décisions qui font la différence
          </p>
          </div>

          <div className="left-badge">
            <p style={{ marginTop: 4 }}>Plateforme de Business Intelligence</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <div className="accent-bar" />
              <h1>Connexion</h1>
              <p>Bienvenue sur votre espace PEDAGO BI</p>
            </div>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Adresse email</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pedago.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="forgot-link">
                <button 
                  type="button"
                  onClick={() => alert("Fonctionnalité à venir - Contactez votre administrateur")}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              © 2026 PEDAGO BI — Tous droits réservés
            </div>
          </div>
        </div>
      </div>
    </>
  );
}