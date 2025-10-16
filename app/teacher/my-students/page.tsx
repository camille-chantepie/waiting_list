"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyStudents() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [teacherCode, setTeacherCode] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await loadTeacherCode(session.user.id);
        await loadStudents(session.user.id);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadTeacherCode = async (userId: string) => {
    try {
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('code_invitation')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading teacher code:', error);
        return;
      }

      if (teacher?.code_invitation) {
        setTeacherCode(teacher.code_invitation);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadStudents = async (userId: string) => {
    try {
      const response = await fetch(`/api/relations?teacher_id=${userId}`);
      if (!response.ok) {
        console.error('Error loading students');
        return;
      }
      
      const result = await response.json();
      console.log('Students loaded:', result);
      
      setStudents(result.data || []);
      setStudentsCount(result.data?.length || 0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const copyToClipboard = () => {
    if (teacherCode) {
      navigator.clipboard.writeText(teacherCode);
      alert("Code copié dans le presse-papiers !");
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-indigo-600">Mes étudiants</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Gestion des étudiants
          </h2>
          <p className="text-gray-600">
            Partagez votre code unique avec vos étudiants pour qu&apos;ils puissent se connecter à vous
          </p>
        </div>

        {/* Mon code unique */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Mon code d&apos;invitation unique</h3>
              <p className="text-indigo-100 mb-6">
                Partagez ce code avec tous vos étudiants. Ils pourront l&apos;utiliser pour se connecter à vous.
              </p>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 inline-block">
                {teacherCode ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold font-mono tracking-wider">
                      {teacherCode}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copier
                    </button>
                  </div>
                ) : (
                  <div className="text-2xl">Chargement...</div>
                )}
              </div>
            </div>
            <div className="ml-8">
              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Comment ça marche ?
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">👥</span>
              <span className="text-xs text-gray-500 bg-indigo-100 px-2 py-1 rounded">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{studentsCount}</div>
            <div className="text-gray-600 text-sm">Étudiants connectés</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">💬</span>
              <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">Messages</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
            <div className="text-gray-600 text-sm">Non lus</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📅</span>
              <span className="text-xs text-gray-500 bg-orange-100 px-2 py-1 rounded">Cette semaine</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
            <div className="text-gray-600 text-sm">Cours planifiés</div>
          </div>
        </div>

        {/* Students List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Liste des étudiants</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div>
              {studentsCount === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <svg className="h-24 w-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Aucun étudiant</p>
                  <p className="text-sm mb-4">Partagez votre code d&apos;invitation pour inviter vos premiers étudiants</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((relation: any) => (
                    <div key={relation.relation_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-indigo-600">
                            {relation.student.prenom.charAt(0)}{relation.student.nom.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {relation.student.prenom} {relation.student.nom}
                          </div>
                          <div className="text-sm text-gray-600">{relation.student.email}</div>
                          <div className="text-xs text-gray-500">
                            Connecté le {new Date(relation.connected_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/teacher/messages?student=${relation.student.id}`}
                          className="text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-lg hover:bg-indigo-50"
                        >
                          Message
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Comment ça marche ?</h3>
              <ul className="space-y-3 text-sm text-indigo-100">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Partagez votre code unique avec vos étudiants</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Ils utilisent ce code pour se connecter à vous</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Vous pouvez ensuite communiquer et gérer leurs cours</span>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Astuce</h4>
                  <p className="text-sm text-gray-600">
                    Un seul code pour tous vos étudiants ! Vous pouvez le partager sur vos réseaux sociaux, votre site web, ou par email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal avec instructions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Comment utiliser votre code ?</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-indigo-600 font-bold">1</span>
                  Copiez votre code unique
                </h4>
                <p className="text-gray-600 text-sm ml-11">
                  Cliquez sur le bouton &quot;Copier&quot; à côté de votre code en haut de la page.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-indigo-600 font-bold">2</span>
                  Partagez-le avec vos étudiants
                </h4>
                <p className="text-gray-600 text-sm ml-11">
                  Envoyez votre code par email, SMS, ou partagez-le sur vos réseaux sociaux.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-indigo-600 font-bold">3</span>
                  Ils s&apos;inscrivent
                </h4>
                <p className="text-gray-600 text-sm ml-11">
                  Vos étudiants créent un compte et entrent votre code pour se connecter à vous.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 text-green-600 font-bold">✓</span>
                  C&apos;est fait !
                </h4>
                <p className="text-gray-600 text-sm ml-11">
                  Vous verrez apparaître vos étudiants dans cette liste et pourrez communiquer avec eux.
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
