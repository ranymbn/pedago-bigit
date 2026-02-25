"use client";

import { useState, useEffect } from "react";

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
    motDePasse: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Erreur lors du chargement");
        }

        setFormData({
          nom: data.nom || "",
          email: data.email || "",
          role: data.role || "VIEWER",
          motDePasse: ""
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Ne pas envoyer le mot de passe s'il est vide
      const dataToSend = { ...formData };
      if (!dataToSend.motDePasse) {
        delete dataToSend.motDePasse;
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la modification");
      }

      onUserUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <p className="text-center">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Modifier l'utilisateur</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nouveau mot de passe (laisser vide pour ne pas changer)
            </label>
            <input
              type="password"
              value={formData.motDePasse}
              onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="VIEWER">Viewer</option>
              <option value="MANAGER">Manager</option>
              <option value="ANALYST">Analyst</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Modification..." : "Modifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}