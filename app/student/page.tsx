"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface pour les éléments du menu
interface MenuItem {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  notificationKey?: string;
}

// Composant NotificationBadge
const NotificationBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    dashboard: 0,
    calendar: 1, // Réponse d'un prof à un créneau proposé
    resources: 3, // Nouvelles ressources + exercices reçus
    messages: 3, // Messages non lus
    notes: 1 // Nouvelles notes ajoutées
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        loadNotifications();
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadNotifications = async () => {
    // Mock data - replace with actual Supabase queries
    // This would typically query for:
    // - Unread teacher responses to slot proposals
    // - New resources shared by teachers
    // - New exercises assigned
    // - Unread messages from teachers
    setNotifications({
      dashboard: 0,
      calendar: 1, // Réponse acceptée pour le créneau du 15/01
      resources: 3, // Nouveau chapitre de maths + exercices physique + devoir chimie
      messages: 3, // Messages de 2 professeurs
      notes: 1 // Nouvelles notes ajoutées
    });
  };

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

  const menuItems: MenuItem[] = [
    {
      title: "Tableau de bord",
      description: "Aperçu de votre activité et progression",
      icon: "🎯",
      href: "/student/dashboard",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      notificationKey: "dashboard"
    },
    {
      title: "Ajouter un professeur",
      description: "Connectez-vous avec un code professeur",
      icon: "👨‍🏫",
      href: "/student/add-teacher",
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      title: "Calendrier des cours",
      description: "Proposer des créneaux à vos professeurs",
      icon: "📅",
      href: "/student/calendar",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      notificationKey: "calendar"
    },
    {
      title: "Ressources & Exercices",
      description: "Documents, images, PDF et liens de vos profs",
      icon: "📚",
      href: "/student/resources-exercises",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      notificationKey: "resources"
    },
    {
      title: "Messages",
      description: "Communiquer avec vos professeurs",
      icon: "💬",
      href: "/student/messages",
      color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
      notificationKey: "messages"
    },
    {
      title: "Notes & Progression",
      description: "Suivi des notes et analytics de progression",
      icon: "�",
      href: "/student/notes-analytics",
      color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      notificationKey: "notes"
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
              <div className={`${item.color} border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md relative`}>
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
                {item.notificationKey && notifications[item.notificationKey as keyof typeof notifications] > 0 && (
                  <NotificationBadge count={notifications[item.notificationKey as keyof typeof notifications]} />
                )}
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