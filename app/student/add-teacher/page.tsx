"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AddTeacher() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teacherCode, setTeacherCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [connectedTeachers, setConnectedTeachers] = useState<any[]>([]);

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
      const teachers = result.data || [];
      setConnectedTeachers(teachers);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (!user || !user.id) {
        setMessage({ type: 'error', text: 'Vous devez être connecté pour ajouter un professeur.' });
        setSubmitting(false);
        return;
      }

      if (teacherCode.length < 6) {
        setMessage({ type: 'error', text: 'Le code doit contenir au moins 6 caractères' });
        setSubmitting(false);
        return;
      }

      // Appeler l'API de connexion
      const response = await fetch('/api/relations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: user.id,
          teacher_code: teacherCode.toUpperCase().trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: result.error || 'Code invalide. Veuillez vérifier et réessayer.' });
        setSubmitting(false);
        return;
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Félicitations ! Vous êtes maintenant connecté à ${result.teacher.prenom} ${result.teacher.nom}. Redirection...` 
        });
        setTeacherCode("");
        
        // Recharger la liste des professeurs connectés
        await loadConnectedTeachers(user.id);
        
        // Redirection vers Mes professeurs après 2 secondes
        setTimeout(() => {
          window.location.href = '/student/my-teachers';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Une erreur est survenue lors de la connexion.' });
      }
      
    } catch (error) {
      console.error('Erreur dans handleSubmit:', error);
      setMessage({ type: 'error', text: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}. Veuillez réessayer.` });
    } finally {
      setSubmitting(false);
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-blue-600">Ajouter un professeur</h1>
                <p className="text-sm text-gray-600">
                  {user.user_metadata?.prenom} {user.user_metadata?.nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/student" className="text-gray-600 hover:text-gray-800">
                Menu principal
              </Link>
              <Link href="/student/dashboard" className="text-gray-600 hover:text-gray-800">
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Connectez-vous à un professeur
          </h2>
          <p className="text-gray-600">
            Entrez le code unique fourni par votre professeur pour établir la connexion
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="teacherCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Code professeur
              </label>
              <input
                type="text"
                id="teacherCode"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123XYZ"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-mono tracking-wider"
                required
                disabled={submitting}
              />
              <p className="text-sm text-gray-500 mt-2">
                Le code d'invitation fourni par votre professeur (6 à 10 caractères).
              </p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-start">
                  <svg className="h-5 w-5 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    {message.type === 'success' ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !teacherCode}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter au professeur'
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Comment obtenir un code ?</h3>
                <p className="text-sm text-gray-600">
                  Demandez à votre professeur de générer un code unique pour vous. 
                  Il peut le faire depuis son tableau de bord enseignant.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Connexion automatique</h3>
                <p className="text-sm text-gray-600">
                  Dès que vous entrez un code valide, vous êtes automatiquement 
                  connecté à votre professeur. Aucune attente !
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Code sécurisé</h3>
                <p className="text-sm text-gray-600">
                  Chaque code est unique et permet d'établir une connexion sécurisée 
                  entre vous et votre professeur.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Teachers Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mes professeurs</h3>
          
          {connectedTeachers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="h-20 w-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium mb-2">Aucun professeur connecté</p>
              <p className="text-sm">Utilisez le formulaire ci-dessus pour ajouter votre premier professeur</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedTeachers.map((item: any, index: number) => (
                <div key={item.relation_id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {item.teacher.prenom} {item.teacher.nom}
                        </h4>
                        <p className="text-sm text-gray-600">{item.teacher.email}</p>
                        <p className="text-xs text-gray-500">
                          Connecté le {new Date(item.connected_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Connecté
                      </span>
                      <Link 
                        href="/student/messages"
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Contacter
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
