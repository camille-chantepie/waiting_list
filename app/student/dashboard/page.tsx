"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teachers: 0,
    upcomingClasses: 0,
    completedExercises: 0,
    averageProgress: 0
  });

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-blue-600">Akadêmos - Tableau de bord</h1>
                <p className="text-sm text-gray-600">
                  Bienvenue, {user.user_metadata?.prenom} {user.user_metadata?.nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/student" className="text-gray-600 hover:text-gray-800">
                Menu principal
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
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Bonjour {user.user_metadata?.prenom} ! 👋
          </h2>
          <p className="text-blue-100 text-lg">
            Voici un aperçu de votre activité d&apos;apprentissage
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Total</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.teachers}</div>
            <div className="text-gray-600 text-sm">Professeurs</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">À venir</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.upcomingClasses}</div>
            <div className="text-gray-600 text-sm">Cours planifiés</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✏️</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Complétés</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.completedExercises}</div>
            <div className="text-gray-600 text-sm">Exercices</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Moyenne</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{stats.averageProgress}%</div>
            <div className="text-gray-600 text-sm">Progression</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prochains cours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Prochains cours</h3>
              <Link href="/student/calendar" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Aucun cours planifié pour le moment</p>
                <Link href="/student/calendar" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                  Proposer un créneau
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications récentes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Notifications récentes</h3>
              <Link href="/student/messages" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>Aucune notification</p>
              </div>
            </div>
          </div>

          {/* Ressources récentes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Ressources récentes</h3>
              <Link href="/student/resources" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p>Aucune ressource disponible</p>
              </div>
            </div>
          </div>

          {/* Exercices en cours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Exercices en cours</h3>
              <Link href="/student/exercises" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Aucun exercice en cours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/student/add-teacher" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
              <span className="text-2xl mr-3">👨‍🏫</span>
              <div>
                <div className="font-semibold text-gray-800">Ajouter un professeur</div>
                <div className="text-sm text-gray-600">Entrer un code prof</div>
              </div>
            </Link>
            <Link href="/student/calendar" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <div className="font-semibold text-gray-800">Proposer un créneau</div>
                <div className="text-sm text-gray-600">Planifier un cours</div>
              </div>
            </Link>
            <Link href="/student/messages" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
              <span className="text-2xl mr-3">💬</span>
              <div>
                <div className="font-semibold text-gray-800">Messages</div>
                <div className="text-sm text-gray-600">Contacter vos profs</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
