"use client";

import { useState } from "react";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";

export default function HomePage() {
  const [showForms, setShowForms] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleRoleSelection = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
    setShowForms(true);
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowForms(true);
    setSelectedRole(null);
  };

  const handleBackToHome = () => {
    setShowForms(false);
    setShowLogin(false);
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-16">
        {!showForms ? (
          <>
            {/* Hero Section amélioré */}
            <div className="text-center mb-16">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Akadêmos
                </h1>
                <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                  Gérez vos cours particuliers et vos élèves en toute simplicité
                </p>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  Connecte étudiants et professeurs pour un apprentissage personnalisé et efficace dans toutes les matières.
                </p>
              </div>
            </div>

            {/* Choix de rôle */}
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">
                Commencer avec Akadêmos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Étudiant */}
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-blue-100 hover:border-blue-300" 
                     onClick={() => handleRoleSelection('student')}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform shadow-lg">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-blue-600">Étudiant</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Suivez votre progression, uploadez vos copies et réservez vos cours facilement.
                    </p>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-full font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Commencer comme étudiant
                    </button>
                  </div>
                </div>

                {/* Professeur */}
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-indigo-100 hover:border-indigo-300"
                     onClick={() => handleRoleSelection('teacher')}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform shadow-lg">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Professeur</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Gérez vos élèves, acceptez les créneaux et suivez leur progression.
                    </p>
                    <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-6 rounded-full font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Enseigner avec Akadêmos
                    </button>
                  </div>
                </div>
              </div>

              {/* Login Option */}
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">Vous avez déjà un compte ?</p>
                <button 
                  onClick={handleLoginClick}
                  className="bg-white text-gray-800 border-2 border-gray-300 py-3 px-8 rounded-full font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Me connecter
                </button>
              </div>
            </div>

            {/* Témoignages */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold mb-6 text-gray-800">Ils nous font confiance</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Découvrez pourquoi professeurs et élèves choisissent Akadêmos
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold">S</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Sarah M.</p>
                      <p className="text-sm text-gray-600">Professeure</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic">
                    &ldquo;Akadêmos m&apos;a fait gagner 3 heures par semaine dans la gestion de mes élèves. L&apos;interface est si intuitive !&rdquo;
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold">P</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Pierre D.</p>
                      <p className="text-sm text-gray-600">Prof. Physique</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic">
                    &ldquo;Mes cours sont maintenant mieux organisés et mes élèves sont plus motivés grâce au suivi en temps réel.&rdquo;
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold">E</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Emma L.</p>
                      <p className="text-sm text-gray-600">Élève Terminale S</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic">
                    &ldquo;Je peux enfin suivre ma progression facilement ! Mon prof me donne des retours personnalisés super rapidement.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Fonctionnalités */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold mb-6 text-gray-800">Fonctionnalités principales</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Tout ce dont vous avez besoin pour un apprentissage efficace
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">Ressources</h3>
                  <p className="text-gray-600">
                    Cours et exercices organisés par niveau et matière
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-indigo-600">Progression</h3>
                  <p className="text-gray-600">
                    Suivi personnalisé avec graphiques et statistiques
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-green-600">Communication</h3>
                  <p className="text-gray-600">
                    Échanges directs et feedback instantané avec les professeurs
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Formulaires d'inscription et connexion */}
            <div className="text-center mb-12">
              <button 
                onClick={() => {
                  setShowForms(false);
                  setSelectedRole(null);
                  setShowLogin(false);
                }}
                className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
              <h2 className="text-3xl font-semibold mb-6 text-gray-800">
                {showLogin ? 'Connexion à Akadêmos' : 'Rejoignez Akadêmos'}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {showLogin 
                  ? 'Connectez-vous à votre espace personnel'
                  : `Créez votre compte ${selectedRole === 'student' ? 'étudiant' : 'professeur'} et commencez votre aventure d'apprentissage`
                }
              </p>
            </div>
            
            {showLogin ? (
              <LoginForm onBack={() => {
                setShowForms(false);
                setShowLogin(false);
                setSelectedRole(null);
              }} />
            ) : (
              selectedRole && <SignupForm role={selectedRole} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
