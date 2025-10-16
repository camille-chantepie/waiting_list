"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface SlotProposal {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'cancelled';
  proposed_by_type: 'student' | 'teacher';
  created_at: string;
  updated_at: string;
  teacher: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  student: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  relation_id: string;
}

export default function TeacherProposals() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<SlotProposal[]>([]);
  const [filter, setFilter] = useState<'all' | 'proposed' | 'accepted' | 'rejected' | 'cancelled'>('all');
  const [selectedProposal, setSelectedProposal] = useState<SlotProposal | null>(null);
  const [showModal, setShowModal] = useState(false);

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
      const response = await fetch(`/api/proposals?teacher_id=${teacherId}`);
      if (!response.ok) {
        console.error('Erreur lors du chargement des propositions');
        return;
      }
      
      const result = await response.json();
      console.log('Propositions chargées:', result);
      setProposals(result.data || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des propositions:', error);
    }
  };

  const handleProposalAction = async (proposalId: string, action: 'accepted' | 'rejected') => {
    try {
      if (!user?.id) {
        alert('Utilisateur non connecté');
        return;
      }

      const response = await fetch('/api/proposals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          status: action,
          teacher_id: user.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
        return;
      }

      const result = await response.json();
      console.log('Proposition mise à jour:', result);
      
      // Recharger les propositions
      await loadProposals(user.id);
      
      setShowModal(false);
      setSelectedProposal(null);
      
      const actionText = action === 'accepted' ? 'acceptée' : 'rejetée';
      alert(`✅ Proposition ${actionText} !`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la proposition');
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'proposed': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Rejetée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
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
              <Link href="/teacher" className="text-indigo-600 hover:text-indigo-800">
                ← Retour au tableau de bord
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Propositions de créneaux</h1>
            <div className="w-40"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Créneaux proposés par vos élèves</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {proposals.length} proposition{proposals.length !== 1 ? 's' : ''} au total
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Toutes', count: proposals.length },
              { key: 'proposed', label: 'En attente', count: proposals.filter(p => p.status === 'proposed').length },
              { key: 'accepted', label: 'Acceptées', count: proposals.filter(p => p.status === 'accepted').length },
              { key: 'rejected', label: 'Rejetées', count: proposals.filter(p => p.status === 'rejected').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'all' ? 'Aucune proposition reçue' : `Aucune proposition ${getStatusText(filter).toLowerCase()}`}
            </h3>
            <p className="text-gray-600">
              Les propositions de créneaux de vos élèves apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {proposal.student.prenom.charAt(0)}{proposal.student.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{proposal.student.prenom} {proposal.student.nom}</h3>
                      <p className="text-sm text-gray-600">{proposal.title || 'Cours particulier'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(proposal.status)}`}>
                      {getStatusText(proposal.status)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Proposé le {formatDate(proposal.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Date proposée</div>
                    <div className="font-semibold">{formatDate(proposal.start_time)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Horaire</div>
                    <div className="font-semibold">{formatTime(proposal.start_time)} - {formatTime(proposal.end_time)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Durée</div>
                    <div className="font-semibold">
                      {Math.round((new Date(proposal.end_time).getTime() - new Date(proposal.start_time).getTime()) / (1000 * 60))} min
                    </div>
                  </div>
                </div>

                {proposal.description && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-blue-800 font-medium mb-1">Message de l&apos;élève :</div>
                    <div className="text-blue-700 whitespace-pre-wrap">{proposal.description}</div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setShowModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Voir les détails
                  </button>
                  
                  {proposal.status === 'proposed' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProposalAction(proposal.id, 'rejected')}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Rejeter
                      </button>
                      <button
                        onClick={() => handleProposalAction(proposal.id, 'accepted')}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Accepter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Détails de la proposition
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Élève</label>
                    <div className="text-gray-800">{selectedProposal.student.prenom} {selectedProposal.student.nom}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Matière / Sujet</label>
                    <div className="text-gray-800">{selectedProposal.title || 'Cours particulier'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <div className="text-gray-800">{formatDate(selectedProposal.start_time)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Horaire</label>
                    <div className="text-gray-800">{formatTime(selectedProposal.start_time)} - {formatTime(selectedProposal.end_time)}</div>
                  </div>
                </div>

                {selectedProposal.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Message</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap">
                      {selectedProposal.description}
                    </div>
                  </div>
                )}

                {selectedProposal.status === 'proposed' && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => handleProposalAction(selectedProposal.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Rejeter cette proposition
                    </button>
                    <button
                      onClick={() => handleProposalAction(selectedProposal.id, 'accepted')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accepter cette proposition
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}