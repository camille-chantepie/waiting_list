"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeacherMessages() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedRelation, setSelectedRelation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await loadStudents(session.user.id);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  useEffect(() => {
    if (selectedRelation) {
      loadMessages(selectedRelation.relation_id);
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        loadMessages(selectedRelation.relation_id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRelation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadStudents = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/relations?teacher_id=${teacherId}`);
      if (!response.ok) {
        console.error('Erreur lors du chargement des étudiants');
        return;
      }
      
      const result = await response.json();
      console.log('Students loaded:', result);
      
      const relations = result.data || [];
      setStudents(relations);
      
      // Sélectionner le premier étudiant par défaut
      if (relations.length > 0) {
        setSelectedRelation(relations[0]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadMessages = async (relationId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/messages?relation_id=${relationId}&user_id=${user.id}`);
      if (!response.ok) {
        console.error('Erreur lors du chargement des messages');
        return;
      }
      
      const result = await response.json();
      setMessages(result.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRelation || !user?.id) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relation_id: selectedRelation.relation_id,
          sender_id: user.id,
          sender_type: 'teacher',
          content: newMessage.trim()
        })
      });

      if (!response.ok) {
        alert('Erreur lors de l\'envoi du message');
        return;
      }

      setNewMessage("");
      await loadMessages(selectedRelation.relation_id);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-indigo-600">Messages</h1>
                <p className="text-sm text-gray-600">
                  {user.user_metadata?.prenom} {user.user_metadata?.nom}
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
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden" style={{ height: '75vh' }}>
          <div className="flex h-full">
            {/* Liste des étudiants */}
            <div className="w-1/3 border-r flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Mes étudiants</h2>
                <p className="text-sm text-gray-600">{students.length} étudiant(s)</p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {students.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <svg className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm mb-2">Aucun étudiant</p>
                    <Link href="/teacher/my-students" className="text-indigo-600 hover:text-indigo-800 text-sm">
                      Partagez votre code →
                    </Link>
                  </div>
                ) : (
                  students.map((relation) => (
                    <button
                      key={relation.relation_id}
                      onClick={() => setSelectedRelation(relation)}
                      className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                        selectedRelation?.relation_id === relation.relation_id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-indigo-600">
                            {relation.student.prenom.charAt(0)}{relation.student.nom.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {relation.student.prenom} {relation.student.nom}
                          </div>
                          <div className="text-sm text-gray-600 truncate">{relation.student.email}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Zone de conversation */}
            <div className="flex-1 flex flex-col">
              {selectedRelation ? (
                <>
                  {/* En-tête de conversation */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">
                          {selectedRelation.student.prenom.charAt(0)}{selectedRelation.student.nom.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {selectedRelation.student.prenom} {selectedRelation.student.nom}
                        </div>
                        <div className="text-sm text-gray-600">{selectedRelation.student.email}</div>
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
                      messages.map((message) => {
                        const isTeacher = message.sender_type === 'teacher';
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isTeacher ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isTeacher
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <p className={`text-xs mt-1 ${isTeacher ? 'text-indigo-200' : 'text-gray-500'}`}>
                                {new Date(message.created_at).toLocaleString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Zone de saisie */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-end space-x-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Écrivez votre message... (Entrée pour envoyer)"
                        rows={2}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed h-[72px]"
                      >
                        {sending ? (
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="h-24 w-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p>Sélectionnez un étudiant pour voir la conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
