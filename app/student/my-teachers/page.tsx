"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface ConnectedTeacher {
  relation_id: string;
  teacher: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  connected_at: string;
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
      const response = await fetch(`/api/relations?student_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load teachers');
      }
      const result = await response.json();
      setConnectedTeachers(result.data || []);
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

  const disconnectTeacher = async (relationId: string) => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter de ce professeur ?')) {
      try {
        const response = await fetch(`/api/relations?relation_id=${relationId}&student_id=${user.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to disconnect');
        }
        
        // Recharger la liste
        await loadConnectedTeachers(user.id);
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Impossible de se déconnecter. Veuillez réessayer.');
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{connectedTeachers.length}</div>
              <div className="text-blue-800 font-medium">Professeurs connectés</div>
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
            {connectedTeachers.map((item) => (
              <div key={item.relation_id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                {/* Teacher Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {item.teacher.prenom.charAt(0)}{item.teacher.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.teacher.prenom} {item.teacher.nom}
                      </h3>
                      <p className="text-sm text-gray-500">{item.teacher.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnectTeacher(item.relation_id)}
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
                    <span className="font-medium">{formatDate(item.connected_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openModal(item, 'schedule')}
                    className="bg-green-100 text-green-800 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    📅 Programmer
                  </button>
                  <button
                    onClick={() => openModal(item, 'message')}
                    className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    💬 Message
                  </button>
                  <button
                    onClick={() => openModal(item, 'notes')}
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
                  Avec {selectedTeacher.teacher.prenom} {selectedTeacher.teacher.nom}
                </p>
              </div>

              {modalType === 'schedule' && (
                <div className="space-y-4">
                  <p className="text-gray-600">Proposer un créneau à votre professeur</p>
                  <Link
                    href={`/student/calendar?relation=${selectedTeacher.relation_id}`}
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
                    href={`/student/messages?relation=${selectedTeacher.relation_id}`}
                    className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Ouvrir la messagerie
                  </Link>
                </div>
              )}

              {modalType === 'notes' && (
                <div className="space-y-4">
                  <p className="text-gray-600">Consulter vos notes</p>
                  <Link
                    href={`/student/notes-analytics?teacher=${selectedTeacher.teacher.id}`}
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