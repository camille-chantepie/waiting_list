"use client";

import { useState } from "react";

interface TeacherFormData {
  nom: string;
  prenom: string;
  dateNaissance: string;
  nationalite: string;
  mail: string;
}

export default function TeacherForm() {
  const [formData, setFormData] = useState<TeacherFormData>({
    nom: "",
    prenom: "",
    dateNaissance: "",
    nationalite: "",
    mail: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        setSuccess(true);
        setFormData({
          nom: "",
          prenom: "",
          dateNaissance: "",
          nationalite: "",
          mail: "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Erreur de réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">Inscription Professeur</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            value={formData.nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            required
            value={formData.prenom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700 mb-1">
            Date de naissance
          </label>
          <input
            type="date"
            id="dateNaissance"
            name="dateNaissance"
            required
            value={formData.dateNaissance}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="nationalite" className="block text-sm font-medium text-gray-700 mb-1">
            Nationalité
          </label>
          <input
            type="text"
            id="nationalite"
            name="nationalite"
            required
            value={formData.nationalite}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="mail" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="mail"
            name="mail"
            required
            value={formData.mail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/50"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-2 px-4 rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Inscription en cours..." : "S'inscrire comme professeur"}
        </button>

        {success && (
          <p className="text-green-600 text-sm text-center">Inscription réussie !</p>
        )}
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
      </form>
    </div>
  );
}