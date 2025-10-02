"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeacherStudents() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    getSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Accès non autorisé</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/teacher" className="text-indigo-600 hover:text-indigo-800">
                ← Retour au tableau de bord
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">Mes étudiants</h1>
            </div>
            <Link href="/teacher/new-student" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Nouvel étudiant
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Étudiants actifs</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Cours cette semaine</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Nouveaux messages</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Évaluations en attente</div>
          </div>
        </div>

        {/* Liste des étudiants */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Liste de vos étudiants</h2>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucun étudiant pour le moment
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre premier étudiant pour commencer à enseigner
              </p>
              <Link href="/teacher/new-student" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-flex items-center">
                <span className="mr-2">➕</span>
                Ajouter un étudiant
              </Link>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/teacher/calendar" className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:bg-blue-100 transition-colors">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">📅</span>
              <h3 className="font-semibold">Calendrier</h3>
            </div>
            <p className="text-gray-600 text-sm">Gérer vos créneaux et planifier les cours</p>
          </Link>

          <Link href="/teacher/resources" className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:bg-green-100 transition-colors">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">📚</span>
              <h3 className="font-semibold">Ressources</h3>
            </div>
            <p className="text-gray-600 text-sm">Accéder aux ressources pédagogiques</p>
          </Link>

          <Link href="/teacher/generate-code" className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 hover:bg-purple-100 transition-colors">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🔐</span>
              <h3 className="font-semibold">Générer un code</h3>
            </div>
            <p className="text-gray-600 text-sm">Créer un code de paiement pour vos cours</p>
          </Link>
        </div>
      </main>
    </div>
  );
}