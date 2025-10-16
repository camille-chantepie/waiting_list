"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Teacher {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Relation {
  relation_id: string;
  teacher: Teacher;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_type: 'teacher' | 'student';
  created_at: string;
  is_read: boolean;
}

export default function StudentMessages() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedRelation, setSelectedRelation] = useState<Relation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await loadRelations(session.user.id);
      }
      setLoading(false);
    };
    getSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Si un relation_id est dans l'URL, sélectionner cette relation
    const relationParam = searchParams?.get('relation');
    if (relationParam && relations.length > 0) {
      const relation = relations.find(r => r.relation_id === relationParam);
      if (relation) {
        setSelectedRelation(relation);
      }
    }
  }, [searchParams, relations]);

  useEffect(() => {
    if (selectedRelation) {
      loadMessages(selectedRelation.relation_id);
    }
  }, [selectedRelation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadRelations = async (userId: string) => {
    try {
      const response = await fetch(`/api/relations?student_id=${userId}`);
      if (!response.ok) throw new Error('Failed to load relations');
      const result = await response.json();
      setRelations(result.data || []);
      
      // Sélectionner automatiquement la première relation si disponible
      if (result.data && result.data.length > 0 && !selectedRelation) {
        setSelectedRelation(result.data[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des relations:', error);
    }
  };

  const loadMessages = async (relationId: string) => {
    try {
      const response = await fetch(`/api/messages?relation_id=${relationId}&user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to load messages');
      const result = await response.json();
      setMessages(result.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRelation || !user) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relation_id: selectedRelation.relation_id,
          sender_id: user.id,
          sender_type: 'student',
          content: newMessage.trim()
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage("");
      await loadMessages(selectedRelation.relation_id);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Impossible d\'envoyer le message. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
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
            <div className="flex items-center space-x-4">
              <Link href="/student" className="text-blue-600 hover:text-blue-800">
                ← Retour au tableau de bord
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">Messagerie</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <div className="bg-white rounded-xl shadow-sm border p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Mes professeurs</h2>
            <div className="space-y-3">
              {relations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Aucune conversation pour le moment</p>
                  <Link href="/student/add-teacher" className="text-blue-600 hover:text-blue-800 text-sm">
                    Ajouter un professeur
                  </Link>
                </div>
              ) : (
                relations.map((relation) => (
                  <button
                    key={relation.relation_id}
                    onClick={() => setSelectedRelation(relation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRelation?.relation_id === relation.relation_id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {relation.teacher.prenom.charAt(0)}{relation.teacher.nom.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {relation.teacher.prenom} {relation.teacher.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{relation.teacher.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Zone de conversation */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border flex flex-col max-h-[calc(100vh-200px)]">
            {!selectedRelation ? (
              <div className="p-6 h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <p>Sélectionnez un professeur pour commencer à discuter</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header de la conversation */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedRelation.teacher.prenom.charAt(0)}{selectedRelation.teacher.nom.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {selectedRelation.teacher.prenom} {selectedRelation.teacher.nom}
                      </h3>
                      <p className="text-xs text-gray-500">{selectedRelation.teacher.email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>Aucun message. Commencez la conversation !</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'student' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_type === 'student'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_type === 'student' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <form onSubmit={sendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
