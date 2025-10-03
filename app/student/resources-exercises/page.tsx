"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'video' | 'link' | 'exercise';
  url: string;
  subject: string;
  teacherName: string;
  description?: string;
  uploadDate: string;
  size?: string;
  status?: 'todo' | 'completed' | 'corrected'; // Pour les exercices
  dueDate?: string; // Pour les exercices
  grade?: number; // Pour les exercices corrigés
}

export default function ResourcesAndExercises() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resources' | 'exercises'>('resources');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "todo" | "completed" | "corrected">("all");
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        loadResources();
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadResources = async () => {
    // Mock data - replace with actual Supabase query
    const mockResources: Resource[] = [
      // Ressources pédagogiques
      {
        id: "1",
        title: "Chapitre 5 - Les équations du second degré",
        type: "pdf",
        url: "/documents/math-chapitre5.pdf",
        subject: "Mathématiques",
        teacherName: "M. Dubois",
        description: "Cours complet avec exercices corrigés",
        uploadDate: "2025-09-28",
        size: "2.3 MB"
      },
      {
        id: "2",
        title: "Vidéo explicative - Les forces en physique",
        type: "video",
        url: "https://youtube.com/watch?v=example",
        subject: "Physique",
        teacherName: "Mme Martin",
        description: "Vidéo de 15 minutes sur les forces fondamentales",
        uploadDate: "2025-09-25"
      },
      {
        id: "3",
        title: "Tableau périodique interactif",
        type: "link",
        url: "https://ptable.com",
        subject: "Chimie",
        teacherName: "M. Lefort",
        description: "Site web pour explorer les éléments chimiques",
        uploadDate: "2025-09-20"
      },
      {
        id: "4",
        title: "Formules de trigonométrie",
        type: "image",
        url: "/images/trigonometry-formulas.png",
        subject: "Mathématiques",
        teacherName: "M. Dubois",
        description: "Aide-mémoire visuel",
        uploadDate: "2025-09-18",
        size: "850 KB"
      },
      // Exercices
      {
        id: "5",
        title: "Devoir maison - Équations du second degré",
        type: "exercise",
        url: "/exercises/dm-equations.pdf",
        subject: "Mathématiques",
        teacherName: "M. Dubois",
        description: "10 exercices à rendre pour le 5 octobre",
        uploadDate: "2025-09-30",
        size: "1.2 MB",
        status: "todo",
        dueDate: "2025-10-05"
      },
      {
        id: "6",
        title: "TP Chimie - Synthèse de l&apos;aspirine",
        type: "exercise",
        url: "/exercises/tp-aspirine.pdf",
        subject: "Chimie",
        teacherName: "M. Lefort",
        description: "Compte-rendu de TP à compléter",
        uploadDate: "2025-09-25",
        size: "900 KB",
        status: "completed",
        dueDate: "2025-09-28"
      },
      {
        id: "7",
        title: "Contrôle - Forces et mouvement",
        type: "exercise",
        url: "/exercises/controle-forces.pdf",
        subject: "Physique",
        teacherName: "Mme Martin",
        description: "Contrôle du 20 septembre",
        uploadDate: "2025-09-22",
        size: "600 KB",
        status: "corrected",
        dueDate: "2025-09-20",
        grade: 16
      }
    ];

    setResources(mockResources);
  };

  const getResources = () => {
    return resources.filter(resource => resource.type !== 'exercise');
  };

  const getExercises = () => {
    return resources.filter(resource => resource.type === 'exercise');
  };

  const getFilteredResources = () => {
    let filtered = getResources();
    if (selectedCategory !== "all") {
      filtered = filtered.filter(resource => resource.subject === selectedCategory);
    }
    return filtered;
  };

  const getFilteredExercises = () => {
    let filtered = getExercises();
    if (selectedCategory !== "all") {
      filtered = filtered.filter(exercise => exercise.subject === selectedCategory);
    }
    if (selectedStatus !== "all") {
      filtered = filtered.filter(exercise => exercise.status === selectedStatus);
    }
    return filtered;
  };

  const getSubjects = () => {
    return Array.from(new Set(resources.map(resource => resource.subject)));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'link': return '🔗';
      case 'exercise': return '📝';
      default: return '📎';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'image': return 'Image';
      case 'video': return 'Vidéo';
      case 'link': return 'Lien web';
      case 'exercise': return 'Exercice';
      default: return type;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'todo': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-yellow-100 text-yellow-800';
      case 'corrected': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'todo': return 'À faire';
      case 'completed': return 'Rendu';
      case 'corrected': return 'Corrigé';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const updateExerciseStatus = (id: string, newStatus: 'todo' | 'completed' | 'corrected') => {
    setResources(resources.map(resource => 
      resource.id === id ? { ...resource, status: newStatus } : resource
    ));
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
            <h1 className="text-xl font-semibold text-gray-800">Ressources & Exercices</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'resources'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Ressources ({getResources().length})
              </button>
              <button
                onClick={() => setActiveTab('exercises')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'exercises'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 Exercices ({getExercises().length})
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">Matière :</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Toutes les matières</option>
                {getSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {activeTab === 'exercises' && (
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700">Statut :</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="todo">À faire</option>
                  <option value="completed">Rendus</option>
                  <option value="corrected">Corrigés</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Ressources pédagogiques 
                  {selectedCategory !== "all" && ` - ${selectedCategory}`}
                </h3>

                {getFilteredResources().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📚</div>
                    <p>Aucune ressource disponible</p>
                    <p className="text-sm mt-2">Vos professeurs partageront bientôt du contenu ici</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredResources()
                      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                      .map((resource) => (
                        <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 mb-1 truncate" title={resource.title}>
                                {resource.title}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {resource.subject}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                  {getTypeLabel(resource.type)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{resource.teacherName}</p>
                              {resource.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                              )}
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(resource.uploadDate)}</span>
                                {resource.size && <span>{resource.size}</span>}
                              </div>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-3 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                              >
                                Ouvrir
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div>
            {/* Exercise Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {getExercises().filter(ex => ex.status === 'todo').length}
                    </div>
                    <div className="text-red-800 font-medium text-sm">À faire</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {getExercises().filter(ex => ex.status === 'completed').length}
                    </div>
                    <div className="text-yellow-800 font-medium text-sm">Rendus</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {getExercises().filter(ex => ex.status === 'corrected').length}
                    </div>
                    <div className="text-green-800 font-medium text-sm">Corrigés</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Exercices et devoirs
                  {selectedCategory !== "all" && ` - ${selectedCategory}`}
                  {selectedStatus !== "all" && ` - ${getStatusLabel(selectedStatus)}`}
                </h3>

                {getFilteredExercises().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📝</div>
                    <p>Aucun exercice dans cette catégorie</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredExercises()
                      .sort((a, b) => {
                        if (a.status === 'todo' && b.status !== 'todo') return -1;
                        if (a.status !== 'todo' && b.status === 'todo') return 1;
                        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
                      })
                      .map((exercise) => (
                        <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-2xl">{getTypeIcon(exercise.type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-800">{exercise.title}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exercise.status)}`}>
                                    {getStatusLabel(exercise.status)}
                                  </span>
                                  {exercise.grade && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      {exercise.grade}/20
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                                  <span>{exercise.subject}</span>
                                  <span>{exercise.teacherName}</span>
                                  {exercise.dueDate && (
                                    <span className={`font-medium ${
                                      new Date(exercise.dueDate) < new Date() && exercise.status === 'todo'
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}>
                                      À rendre le {formatDate(exercise.dueDate)}
                                    </span>
                                  )}
                                </div>
                                {exercise.description && (
                                  <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    Reçu le {formatDate(exercise.uploadDate)}
                                    {exercise.size && ` • ${exercise.size}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {exercise.status === 'todo' && (
                                <button
                                  onClick={() => updateExerciseStatus(exercise.id, 'completed')}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                  Marquer comme rendu
                                </button>
                              )}
                              <a
                                href={exercise.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                              >
                                Ouvrir
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
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