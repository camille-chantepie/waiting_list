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

  const menuItems = [
    {
      title: "Tableau de bord",
      description: "Vue d'ensemble de votre activité",
      icon: "📊",
      href: "/teacher/dashboard",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
    },
    {
      title: "Mes étudiants",
      description: "Gérer et générer des codes d'accès",
      icon: "👥",
      href: "/teacher/my-students",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      title: "Calendrier des cours",
      description: "Gérer disponibilités et demandes de créneaux",
      icon: "�",
      href: "/teacher/calendar",
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      title: "Ressources pédagogiques",
      description: "Partager liens et documents avec vos étudiants",
      icon: "�",
      href: "/teacher/resources",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
    },
    {
      title: "Mon compte",
      description: "Paramètres et informations personnelles",
      icon: "⚙️",
      href: "/teacher/account",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-indigo-600">Akadêmos - Professeur</h1>
                <p className="text-sm text-gray-600">
                  Bienvenue, {user.user_metadata?.prenom} {user.user_metadata?.nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                Accueil
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
            Mon espace professeur
          </h2>
          <p className="text-gray-600">
            Gérez vos étudiants, planifiez vos cours et suivez les progrès
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className={`${item.color} border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md`}>
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Étudiants actifs</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Cours cette semaine</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Créneaux en attente</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Ressources partagées</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600 mb-2">0€</div>
            <div className="text-gray-600 text-sm">Revenus ce mois</div>
          </div>
        </div>
      </main>
    </div>
  );
}