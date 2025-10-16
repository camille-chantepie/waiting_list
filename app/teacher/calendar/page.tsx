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
  const [pendingProposals, setPendingProposals] = useState<any[]>([]);
  const [acceptedProposals, setAcceptedProposals] = useState<any[]>([]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await loadProposals(session.user.id);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadProposals = async (teacherId: string) => {
    try {
      // Charger les propositions en attente
      const pendingResponse = await fetch(`/api/proposals?teacher_id=${teacherId}&status=proposed`);
      if (pendingResponse.ok) {
        const result = await pendingResponse.json();
        setPendingProposals(result.data || []);
      }
      
      // Charger les propositions acceptées
      const acceptedResponse = await fetch(`/api/proposals?teacher_id=${teacherId}&status=accepted`);
      if (acceptedResponse.ok) {
        const result = await acceptedResponse.json();
        setAcceptedProposals(result.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des propositions:', error);
    }
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
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">{acceptedProposals.length}</span>
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
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-white/20">{pendingProposals.length}</span>
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
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              {selectedTab === "upcoming" && (
                <div className="space-y-4">
                  {acceptedProposals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-xl font-semibold mb-2">Aucun cours planifié</h3>
                      <p className="mb-4">Les cours confirmés avec vos étudiants apparaîtront ici</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Cours confirmés ({acceptedProposals.length})</h3>
                      {acceptedProposals.map((proposal: any) => (
                        <div key={proposal.id} className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-green-600">
                                  {proposal.student.prenom.charAt(0)}{proposal.student.nom.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{proposal.title || 'Cours particulier'}</h4>
                                <p className="text-sm text-gray-600">{proposal.student.prenom} {proposal.student.nom}</p>
                              </div>
                            </div>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Confirmé</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">📅 Date:</span>
                              <span className="ml-2 font-medium">{new Date(proposal.start_time).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">🕐 Heure:</span>
                              <span className="ml-2 font-medium">{new Date(proposal.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(proposal.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          {proposal.description && (
                            <p className="mt-3 text-sm text-gray-700 bg-white rounded p-2">{proposal.description}</p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              {selectedTab === "requests" && (
                <div className="space-y-4">
                  {pendingProposals.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <svg className="h-20 w-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-lg font-medium text-gray-600 mb-2">Aucune demande de créneau</p>
                      <p className="text-sm text-gray-500">Les demandes de vos étudiants apparaîtront ici</p>
                      <Link href="/teacher/proposals" className="inline-block mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                        Voir toutes les propositions →
                      </Link>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Demandes en attente ({pendingProposals.length})</h3>
                      {pendingProposals.map((proposal: any) => (
                        <div key={proposal.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-orange-600">
                                  {proposal.student.prenom.charAt(0)}{proposal.student.nom.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{proposal.title || 'Cours particulier'}</h4>
                                <p className="text-sm text-gray-600">{proposal.student.prenom} {proposal.student.nom}</p>
                              </div>
                            </div>
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">En attente</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">📅 Date:</span>
                              <span className="ml-2 font-medium">{new Date(proposal.start_time).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">🕐 Heure:</span>
                              <span className="ml-2 font-medium">{new Date(proposal.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(proposal.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          {proposal.description && (
                            <p className="mb-3 text-sm text-gray-700 bg-white rounded p-2">{proposal.description}</p>
                          )}
                          <Link
                            href="/teacher/proposals"
                            className="block text-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            Répondre à cette demande
                          </Link>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              {selectedTab === "availability" && (
                <div className="text-center text-gray-500">
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
                </div>
              )}
              {selectedTab === "history" && (
                <div className="text-center text-gray-500">
                  <svg className="h-32 w-32 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Aucun cours passé</h3>
                  <p className="mb-4">
                    L&apos;historique de vos cours terminés apparaîtra ici
                  </p>
                </div>
              )}
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
