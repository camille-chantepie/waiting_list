"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeStudents: 0,
    coursesThisWeek: 0,
    pendingSlots: 0,
    revenueThisMonth: 0
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-indigo-600">Tableau de bord - Professeur</h1>
                <p className="text-sm text-gray-600">
                  Bienvenue, {user.user_metadata?.prenom} {user.user_metadata?.nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/teacher" className="text-gray-600 hover:text-gray-800">
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
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Bonjour {user.user_metadata?.prenom} ! 👋
          </h2>
          <p className="text-indigo-100 text-lg">
            Voici un aperçu de votre activité d&apos;enseignement
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Actifs</span>
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.activeStudents}</div>
            <div className="text-gray-600 text-sm">Étudiants</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Cette semaine</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.coursesThisWeek}</div>
            <div className="text-gray-600 text-sm">Cours planifiés</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">En attente</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{stats.pendingSlots}</div>
            <div className="text-gray-600 text-sm">Demandes de créneaux</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Ce mois</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.revenueThisMonth}€</div>
            <div className="text-gray-600 text-sm">Revenus</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prochains cours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Prochains cours</h3>
              <Link href="/teacher/calendar" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Aucun cours planifié pour le moment</p>
                <Link href="/teacher/calendar" className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block">
                  Gérer mes disponibilités
                </Link>
              </div>
            </div>
          </div>

          {/* Demandes de créneaux en attente */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Demandes en attente</h3>
              <Link href="/teacher/calendar" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>Aucune demande de créneau</p>
              </div>
            </div>
          </div>

          {/* Étudiants récents */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Mes étudiants</h3>
              <Link href="/teacher/my-students" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Aucun étudiant</p>
                <Link href="/teacher/my-students" className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block">
                  Générer un code pour un nouvel étudiant
                </Link>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Activité récente</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Aucune activité récente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/teacher/my-students" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <div className="font-semibold text-gray-800">Mes étudiants</div>
                <div className="text-sm text-gray-600">Gérer et ajouter</div>
              </div>
            </Link>
            <Link href="/teacher/calendar" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <div className="font-semibold text-gray-800">Calendrier</div>
                <div className="text-sm text-gray-600">Gérer mes cours</div>
              </div>
            </Link>
            <Link href="/teacher/resources" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
              <span className="text-2xl mr-3">📚</span>
              <div>
                <div className="font-semibold text-gray-800">Ressources</div>
                <div className="text-sm text-gray-600">Partager du contenu</div>
              </div>
            </Link>
            <Link href="/teacher/account" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
              <span className="text-2xl mr-3">⚙️</span>
              <div>
                <div className="font-semibold text-gray-800">Mon compte</div>
                <div className="text-sm text-gray-600">Paramètres</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
