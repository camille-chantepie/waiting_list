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
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Ajouter un professeur",
      description: "Rechercher et ajouter un nouveau professeur",
      icon: "👨‍🏫",
      href: "/student/add-teacher",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      title: "Messagerie",
      description: "Communiquer avec vos professeurs",
      icon: "💬",
      href: "/student/messages",
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      title: "Calendrier des cours",
      description: "Gérer vos créneaux et rendez-vous",
      icon: "📅",
      href: "/student/calendar",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    },
    {
      title: "Ressources pédagogiques",
      description: "Accéder aux cours et matériaux",
      icon: "📚",
      href: "/student/resources",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
    },
    {
      title: "Cours",
      description: "Vos cours planifiés et historique",
      icon: "🎓",
      href: "/student/courses",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
    },
    {
      title: "Fiches",
      description: "Fiches de révision et résumés",
      icon: "📄",
      href: "/student/sheets",
      color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
    },
    {
      title: "Leçons",
      description: "Contenu des leçons et supports",
      icon: "📖",
      href: "/student/lessons",
      color: "bg-pink-50 border-pink-200 hover:bg-pink-100"
    },
    {
      title: "Exercices & corrections",
      description: "Exercices pratiques et leurs corrections",
      icon: "✏️",
      href: "/student/exercises",
      color: "bg-teal-50 border-teal-200 hover:bg-teal-100"
    },
    {
      title: "Tableau de bord",
      description: "Vos résultats et suivi de progression",
      icon: "📊",
      href: "/student/dashboard",
      color: "bg-red-50 border-red-200 hover:bg-red-100"
    }
  ];

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
                <h1 className="text-xl font-semibold text-blue-600">Akadêmos - Étudiant</h1>
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
            Mon espace étudiant
          </h2>
          <p className="text-gray-600">
            Gérez vos cours, communiquez avec vos professeurs et suivez votre progression
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Professeurs</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Cours planifiés</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600 text-sm">Exercices complétés</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600 mb-2">0%</div>
            <div className="text-gray-600 text-sm">Progression moyenne</div>
          </div>
        </div>
      </main>
    </div>
  );
}