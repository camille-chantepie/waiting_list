"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeacherCalendar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "requests" | "availability" | "history">("upcoming");
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-indigo-600">Calendrier des cours</h1>
                <p className="text-sm text-gray-600">
                  {user.user_metadata?.prenom} {user.user_metadata?.nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/teacher" className="text-gray-600 hover:text-gray-800">
                Menu principal
              </Link>
              <Link href="/teacher/dashboard" className="text-gray-600 hover:text-gray-800">
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Gestion du calendrier
            </h2>
            <p className="text-gray-600">
              Gérez vos disponibilités, cours et demandes de créneaux
            </p>
          </div>
          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une disponibilité
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border p-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTab("upcoming")}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === "upcoming"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">📅</span>
              Cours à venir
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">0</span>
            </button>
            <button
              onClick={() => setSelectedTab("requests")}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === "requests"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">🔔</span>
              Demandes
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">0</span>
            </button>
            <button
              onClick={() => setSelectedTab("availability")}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === "availability"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">🕐</span>
              Disponibilités
            </button>
            <button
              onClick={() => setSelectedTab("history")}
              className={`flex-1 min-w-fit px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === "history"
                  ? "bg-purple-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">📖</span>
              Historique
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border p-12">
              <div className="text-center text-gray-500">
                {selectedTab === "upcoming" && (
                  <>
                    <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Aucun cours planifié</h3>
                    <p className="mb-4">
                      Les cours confirmés avec vos étudiants apparaîtront ici
                    </p>
                  </>
                )}
                {selectedTab === "requests" && (
                  <>
                    <div className="space-y-4">
                      {/* Example request with attached files */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Demande de cours - Marie Dupont
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Date :</span> 15 octobre 2025 à 14h00
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Matière :</span> Mathématiques - Équations du second degré
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Message :</span> J&apos;ai des difficultés avec les exercices du chapitre 3, voici ma copie pour que vous puissiez voir mes erreurs.
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            En attente
                          </span>
                        </div>

                        {/* Attached Files Section */}
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                            <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Documents joints (2)
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">copie_equations_marie.pdf</p>
                                  <p className="text-xs text-gray-500">1.2 MB</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                  Télécharger
                                </button>
                                <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50">
                                  Aperçu
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">exercices_chapitre3.jpg</p>
                                  <p className="text-xs text-gray-500">850 KB</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                  Télécharger
                                </button>
                                <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50">
                                  Aperçu
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            Accepter
                          </button>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                            Refuser
                          </button>
                          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Proposer un autre créneau
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Empty state for when no requests */}
                    <div className="mt-8 text-center text-gray-400">
                      <svg className="h-20 w-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm">Plus de demandes de créneaux</p>
                    </div>
                  </>
                )}
                {selectedTab === "availability" && (
                  <>
                    <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Aucune disponibilité définie</h3>
                    <p className="mb-4">
                      Ajoutez vos créneaux disponibles pour que vos étudiants puissent réserver
                    </p>
                    <button
                      onClick={() => setShowAvailabilityModal(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Ajouter une disponibilité →
                    </button>
                  </>
                )}
                {selectedTab === "history" && (
                  <>
                    <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Aucun cours passé</h3>
                    <p className="mb-4">
                      L&apos;historique de vos cours terminés apparaîtra ici
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Cours cette semaine</span>
                  <span className="text-2xl font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">Heures totales</span>
                  <span className="text-2xl font-bold">0h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-100">En attente</span>
                  <span className="text-2xl font-bold">0</span>
                </div>
              </div>
            </div>

            {/* Next Class */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prochain cours</h3>
              <div className="text-center py-8 text-gray-500">
                <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Aucun cours prévu</p>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé hebdomadaire</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lundi</span>
                  <span className="font-semibold text-gray-800">0 cours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mardi</span>
                  <span className="font-semibold text-gray-800">0 cours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mercredi</span>
                  <span className="font-semibold text-gray-800">0 cours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Jeudi</span>
                  <span className="font-semibold text-gray-800">0 cours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Vendredi</span>
                  <span className="font-semibold text-gray-800">0 cours</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Astuce</h4>
                  <p className="text-sm text-gray-600">
                    Définissez vos créneaux de disponibilité à l&apos;avance pour faciliter la réservation par vos étudiants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for adding availability */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Ajouter une disponibilité</h3>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="recurrence" className="block text-sm font-semibold text-gray-700 mb-2">
                    Récurrence
                  </label>
                  <select
                    id="recurrence"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="once">Une fois</option>
                    <option value="weekly">Chaque semaine</option>
                    <option value="biweekly">Toutes les 2 semaines</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-2">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-2">
                    Heure de fin *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  id="notes"
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Ajouter la disponibilité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
