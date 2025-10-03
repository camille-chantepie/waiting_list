"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface ConnectedTeacher {
  id: string;
  nom: string;
  prenom: string;
  matiere: string;
  email?: string;
  connected_at: string;
  lastMessage?: string;
  nextClass?: {
    date: string;
    time: string;
    type: string;
  };
  stats?: {
    totalClasses: number;
    pendingSlots: number;
    averageGrade: number;
  };
}

export default function MyTeachers() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectedTeachers, setConnectedTeachers] = useState<ConnectedTeacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<ConnectedTeacher | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'message' | 'notes'>('schedule');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await loadConnectedTeachers(session.user.id);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadConnectedTeachers = async (userId: string) => {
    try {
      // Pour l'instant, on récupère depuis localStorage pour la démo
      const storedTeachers = localStorage.getItem(`connectedTeachers_${userId}`);
      if (storedTeachers) {
        const teachers = JSON.parse(storedTeachers);
        // Ajouter des données enrichies pour la démo
        const enrichedTeachers = teachers.map((teacher: any) => ({
          ...teacher,
          email: `${teacher.prenom.toLowerCase()}.${teacher.nom.toLowerCase()}@academie.fr`,
          lastMessage: "Il y a 2 jours",
          nextClass: Math.random() > 0.5 ? {
            date: "2025-10-08",
            time: "14:00",
            type: "Cours particulier"
          } : null,
          stats: {
            totalClasses: Math.floor(Math.random() * 20) + 5,
            pendingSlots: Math.floor(Math.random() * 3),
            averageGrade: Math.round((Math.random() * 8 + 12) * 10) / 10
          }
        }));
        setConnectedTeachers(enrichedTeachers);
      }
      
      // TODO: Remplacer par une vraie requête Supabase
      // const { data, error } = await supabase
      //   .from('student_teacher_connections')
      //   .select(`
      //     teacher_id,
      //     connected_at,
      //     teachers:teacher_id (
      //       id,
      //       user_metadata
      //     )
      //   `)
      //   .eq('student_id', userId)
      //   .eq('status', 'active');
      
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
    }
  };

  const openModal = (teacher: ConnectedTeacher, type: 'schedule' | 'message' | 'notes') => {
    setSelectedTeacher(teacher);
    setModalType(type);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const disconnectTeacher = async (teacherId: string) => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter de ce professeur ?')) {
      try {
        // Mise à jour locale
        const updatedTeachers = connectedTeachers.filter(t => t.id !== teacherId);
        setConnectedTeachers(updatedTeachers);
        
        // Mise à jour localStorage pour la démo
        if (user?.id) {
          localStorage.setItem(`connectedTeachers_${user.id}`, JSON.stringify(updatedTeachers));
        }
        
        // TODO: Mise à jour Supabase
        // await supabase
        //   .from('student_teacher_connections')
        //   .update({ status: 'disconnected' })
        //   .eq('student_id', user.id)
        //   .eq('teacher_id', teacherId);
        
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/student" className="text-indigo-600 hover:text-indigo-800">
                ← Retour au tableau de bord
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Mes Professeurs</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Mes professeurs connectés</h2>
            <Link 
              href="/student/add-teacher"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Ajouter un professeur
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{connectedTeachers.length}</div>
              <div className="text-blue-800 font-medium">Professeurs connectés</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {connectedTeachers.reduce((sum, t) => sum + (t.stats?.totalClasses || 0), 0)}
              </div>
              <div className="text-green-800 font-medium">Cours total</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {connectedTeachers.reduce((sum, t) => sum + (t.stats?.pendingSlots || 0), 0)}
              </div>
              <div className="text-purple-800 font-medium">Créneaux en attente</div>
            </div>
          </div>
        </div>

        {/* Teachers List */}
        {connectedTeachers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun professeur connecté</h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter un professeur avec son code pour accéder à ses cours et ressources.
            </p>
            <Link 
              href="/student/add-teacher"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ajouter mon premier professeur
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {connectedTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                {/* Teacher Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {teacher.prenom.charAt(0)}{teacher.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {teacher.prenom} {teacher.nom}
                      </h3>
                      <p className="text-indigo-600 font-medium">{teacher.matiere}</p>
                      <p className="text-sm text-gray-500">{teacher.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnectTeacher(teacher.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Se déconnecter"
                  >
                    ✕
                  </button>
                </div>

                {/* Teacher Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Connecté depuis</span>
                    <span className="font-medium">{formatDate(teacher.connected_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dernier message</span>
                    <span className="font-medium">{teacher.lastMessage}</span>
                  </div>
                  {teacher.nextClass && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Prochain cours</span>
                      <span className="font-medium text-green-600">
                        {formatDate(teacher.nextClass.date)} à {teacher.nextClass.time}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{teacher.stats?.totalClasses}</div>
                    <div className="text-xs text-gray-600">Cours</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{teacher.stats?.pendingSlots}</div>
                    <div className="text-xs text-gray-600">En attente</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{teacher.stats?.averageGrade}/20</div>
                    <div className="text-xs text-gray-600">Moyenne</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openModal(teacher, 'schedule')}
                    className="bg-green-100 text-green-800 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    📅 Programmer
                  </button>
                  <button
                    onClick={() => openModal(teacher, 'message')}
                    className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    💬 Message
                  </button>
                  <button
                    onClick={() => openModal(teacher, 'notes')}
                    className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    📊 Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Modal */}
        {showModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {modalType === 'schedule' && '📅 Programmer un cours'}
                  {modalType === 'message' && '💬 Envoyer un message'}
                  {modalType === 'notes' && '📊 Consulter les notes'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Avec {selectedTeacher.prenom} {selectedTeacher.nom} ({selectedTeacher.matiere})
                </p>
              </div>

              {modalType === 'schedule' && (
                <div className="space-y-4">
                  <p className="text-gray-600">Proposer un créneau à votre professeur</p>
                  <Link
                    href={`/student/calendar?teacher=${selectedTeacher.id}`}
                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Aller au calendrier
                  </Link>
                </div>
              )}

              {modalType === 'message' && (
                <div className="space-y-4">
                  <p className="text-gray-600">Communiquer avec votre professeur</p>
                  <Link
                    href={`/student/messages?teacher=${selectedTeacher.id}`}
                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Ouvrir la messagerie
                  </Link>
                </div>
              )}

              {modalType === 'notes' && (
                <div className="space-y-4">
                  <p className="text-gray-600">Consulter vos notes dans cette matière</p>
                  <Link
                    href={`/student/notes-analytics?subject=${encodeURIComponent(selectedTeacher.matiere)}`}
                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Voir mes notes
                  </Link>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-4 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}