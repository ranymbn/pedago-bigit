"use client";

import { useRouter } from "next/navigation";

interface RetourProps {
  fallbackUrl?: string;
}

export default function Retour({ fallbackUrl = "/admin" }: RetourProps) {
  const router = useRouter();

  return (
    <div className="retour-wrapper">
      <button
        onClick={() => router.back()}
        className="retour-btn-modern"
        title="Retour"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Retour
      </button>
    </div>
  );
}