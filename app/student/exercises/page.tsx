"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Exercises() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"todo" | "completed" | "corrected">("todo");

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    getSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-blue-600">Exercices & Corrections</h1>
                <p className="text-sm text-gray-600">
                  {user.user_metadata?.prenom} {user.user_metadata?.nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/student" className="text-gray-600 hover:text-gray-800">
                Menu principal
              </Link>
              <Link href="/student/dashboard" className="text-gray-600 hover:text-gray-800">
                Tableau de bord
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Mes exercices
          </h2>
          <p className="text-gray-600">
            Consultez vos exercices à faire et accédez aux corrections
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border p-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTab("todo")}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === "todo"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">📝</span>
              À faire
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">0</span>
            </button>
            <button
              onClick={() => setSelectedTab("completed")}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === "completed"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">✅</span>
              Rendus
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">0</span>
            </button>
            <button
              onClick={() => setSelectedTab("corrected")}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === "corrected"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">✨</span>
              Corrigés
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">0</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border p-12">
              <div className="text-center text-gray-500">
                {selectedTab === "todo" && (
                  <>
                    <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Aucun exercice en attente</h3>
                    <p className="mb-4">
                      Les exercices envoyés par vos professeurs apparaîtront ici
                    </p>
                  </>
                )}
                {selectedTab === "completed" && (
                  <>
                    <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Aucun exercice rendu</h3>
                    <p className="mb-4">
                      Vos exercices complétés en attente de correction apparaîtront ici
                    </p>
                  </>
                )}
                {selectedTab === "corrected" && (
                  <>
                    <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Aucune correction disponible</h3>
                    <p className="mb-4">
                      Les corrections de vos exercices apparaîtront ici une fois envoyées par vos professeurs
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Ma progression</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-100 text-sm">Taux de complétion</span>
                    <span className="text-xl font-bold">0%</span>
                  </div>
                  <div className="w-full bg-blue-800/30 rounded-full h-3">
                    <div className="bg-white h-3 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-400/30">
                  <span className="text-blue-100 text-sm">Exercices complétés</span>
                  <span className="text-xl font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Moyenne générale</span>
                  <span className="text-xl font-bold">-</span>
                </div>
              </div>
            </div>

            {/* Recent Corrections */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Corrections récentes</h3>
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-sm">Aucune correction</p>
              </div>
            </div>

            {/* Deadlines */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prochaines échéances</h3>
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Aucune échéance</p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Astuce</h4>
                  <p className="text-sm text-gray-600">
                    Rendez vos exercices à temps pour recevoir des retours détaillés de vos professeurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📝</span>
              <span className="text-xs text-gray-500 bg-orange-100 px-2 py-1 rounded">À faire</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
            <div className="text-gray-600 text-sm">Exercices en attente</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">✅</span>
              <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">Rendus</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
            <div className="text-gray-600 text-sm">En attente de correction</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">✨</span>
              <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">Corrigés</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
            <div className="text-gray-600 text-sm">Corrections reçues</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🎯</span>
              <span className="text-xs text-gray-500 bg-purple-100 px-2 py-1 rounded">Score</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">-</div>
            <div className="text-gray-600 text-sm">Moyenne générale</div>
          </div>
        </div>
      </main>
    </div>
  );
}
