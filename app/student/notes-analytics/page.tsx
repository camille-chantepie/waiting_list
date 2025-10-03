"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Note {
  id: string;
  subject: string;
  teacherName: string;
  grade: number;
  maxGrade: number;
  date: string;
  type: 'exam' | 'test' | 'homework' | 'exercise';
  comment?: string;
}

interface ProgressData {
  subject: string;
  data: { date: string; grade: number }[];
  average: number;
  trend: 'up' | 'down' | 'stable';
}

export default function StudentNotesAndAnalytics() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'analytics'>('notes');
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [newNote, setNewNote] = useState({
    subject: "",
    teacherName: "",
    grade: "",
    maxGrade: "20",
    date: "",
    type: "exam" as const,
    comment: ""
  });

  // Analytics state
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        loadNotes();
        loadProgressData();
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadNotes = async () => {
    // Mock data - replace with actual Supabase query
    const mockNotes: Note[] = [
      {
        id: "1",
        subject: "Mathématiques",
        teacherName: "M. Dubois",
        grade: 16,
        maxGrade: 20,
        date: "2025-09-28",
        type: "exam",
        comment: "Très bon travail sur les équations"
      },
      {
        id: "2",
        subject: "Physique",
        teacherName: "Mme Martin",
        grade: 14,
        maxGrade: 20,
        date: "2025-09-25",
        type: "test",
        comment: "Effort à faire sur la mécanique"
      },
      {
        id: "3",
        subject: "Mathématiques",
        teacherName: "M. Dubois",
        grade: 18,
        maxGrade: 20,
        date: "2025-09-20",
        type: "homework",
        comment: "Excellente maîtrise des dérivées"
      }
    ];

    setNotes(mockNotes);
  };

  const loadProgressData = async () => {
    // Mock data for demonstration
    const mockData: ProgressData[] = [
      {
        subject: "Mathématiques",
        data: [
          { date: "2025-07-01", grade: 12 },
          { date: "2025-07-15", grade: 14 },
          { date: "2025-08-01", grade: 15 },
          { date: "2025-08-15", grade: 16 },
          { date: "2025-09-01", grade: 17 },
          { date: "2025-09-15", grade: 18 },
        ],
        average: 15.3,
        trend: 'up'
      },
      {
        subject: "Physique",
        data: [
          { date: "2025-07-01", grade: 10 },
          { date: "2025-07-15", grade: 12 },
          { date: "2025-08-01", grade: 13 },
          { date: "2025-08-15", grade: 14 },
          { date: "2025-09-01", grade: 14 },
          { date: "2025-09-15", grade: 15 },
        ],
        average: 13,
        trend: 'up'
      }
    ];

    setProgressData(mockData);
  };

  // Notes functions
  const addNote = async () => {
    if (!newNote.subject || !newNote.grade || !newNote.date) return;

    const note: Note = {
      id: Date.now().toString(),
      subject: newNote.subject,
      teacherName: newNote.teacherName || "Non spécifié",
      grade: parseFloat(newNote.grade),
      maxGrade: parseInt(newNote.maxGrade),
      date: newNote.date,
      type: newNote.type,
      comment: newNote.comment
    };

    setNotes([...notes, note]);
    setNewNote({
      subject: "",
      teacherName: "",
      grade: "",
      maxGrade: "20",
      date: "",
      type: "exam",
      comment: ""
    });
    setShowAddModal(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const calculateAverage = (subject?: string) => {
    const filteredNotes = subject ? notes.filter(note => note.subject === subject) : notes;
    if (filteredNotes.length === 0) return 0;
    
    const sum = filteredNotes.reduce((acc, note) => acc + (note.grade / note.maxGrade * 20), 0);
    return Math.round((sum / filteredNotes.length) * 100) / 100;
  };

  const getSubjects = () => {
    return Array.from(new Set(notes.map(note => note.subject)));
  };

  const getFilteredNotes = () => {
    if (selectedSubject === "all") return notes;
    return notes.filter(note => note.subject === selectedSubject);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'test': return 'bg-orange-100 text-orange-800';
      case 'homework': return 'bg-blue-100 text-blue-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam': return 'Examen';
      case 'test': return 'Contrôle';
      case 'homework': return 'Devoir';
      case 'exercise': return 'Exercice';
      default: return type;
    }
  };

  // Analytics functions
  const renderSimpleChart = (data: { date: string; grade: number }[], subject: string) => {
    const maxGrade = Math.max(...data.map(d => d.grade));
    const minGrade = Math.min(...data.map(d => d.grade));
    const range = maxGrade - minGrade || 1;

    return (
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-3">{subject}</h4>
        <div className="relative h-32">
          <svg width="100%" height="100%" className="overflow-visible">
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.grade - minGrade) / range) * 80;
              
              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="#3B82F6"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                  {index < data.length - 1 && (
                    <line
                      x1={`${x}%`}
                      y1={`${y}%`}
                      x2={`${(index + 1) / (data.length - 1) * 100}%`}
                      y2={`${100 - ((data[index + 1].grade - minGrade) / range) * 80}%`}
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxGrade}</span>
            <span>{Math.round((maxGrade + minGrade) / 2)}</span>
            <span>{minGrade}</span>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{new Date(data[0].date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
          <span>{new Date(data[data.length - 1].date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
        </div>
      </div>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getOverallTrend = () => {
    if (progressData.length === 0) return 'stable';
    const upTrends = progressData.filter(data => data.trend === 'up').length;
    const downTrends = progressData.filter(data => data.trend === 'down').length;
    
    if (upTrends > downTrends) return 'up';
    if (downTrends > upTrends) return 'down';
    return 'stable';
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
            <h1 className="text-xl font-semibold text-gray-800">Notes & Progression</h1>
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
                onClick={() => setActiveTab('notes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Mes Notes
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Analytics & Progression
              </button>
            </nav>
          </div>
        </div>

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            {/* Notes Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Suivi de mes notes</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Ajouter une note
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{calculateAverage().toFixed(1)}/20</div>
                  <div className="text-blue-800 font-medium">Moyenne générale</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{notes.length}</div>
                  <div className="text-green-800 font-medium">Notes enregistrées</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{getSubjects().length}</div>
                  <div className="text-purple-800 font-medium">Matières</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Filtrer par matière :</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Toutes les matières</option>
                  {getSubjects().map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes List */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Mes notes {selectedSubject !== "all" && `en ${selectedSubject}`}
                  {selectedSubject !== "all" && (
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      (Moyenne: {calculateAverage(selectedSubject).toFixed(1)}/20)
                    </span>
                  )}
                </h3>

                {getFilteredNotes().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">📊</div>
                    <p>Aucune note enregistrée</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 text-indigo-600 hover:text-indigo-800"
                    >
                      Ajouter votre première note
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredNotes()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-800">{note.subject}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                                  {getTypeLabel(note.type)}
                                </span>
                                <span className="text-sm text-gray-500">{note.teacherName}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold text-indigo-600">
                                  {note.grade}/{note.maxGrade}
                                  <span className="text-sm font-normal text-gray-500 ml-2">
                                    ({((note.grade / note.maxGrade) * 20).toFixed(1)}/20)
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(note.date).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                              {note.comment && (
                                <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{note.comment}&rdquo;</p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-red-600 hover:text-red-800 ml-4"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            {/* Analytics Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Analytics & Progression</h2>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1month">1 mois</option>
                  <option value="3months">3 mois</option>
                  <option value="6months">6 mois</option>
                  <option value="1year">1 an</option>
                </select>
              </div>

              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTrendIcon(getOverallTrend())}</span>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {progressData.length > 0 ? 
                          (progressData.reduce((acc, data) => acc + data.average, 0) / progressData.length).toFixed(1)
                          : '0'
                        }/20
                      </div>
                      <div className="text-indigo-800 font-medium">Moyenne générale</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{progressData.length}</div>
                      <div className="text-green-800 font-medium">Matières suivies</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {progressData.filter(data => data.trend === 'up').length}
                      </div>
                      <div className="text-purple-800 font-medium">En progression</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {progressData.map((data) => renderSimpleChart(data.data, data.subject))}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Recommandations</h3>
              <div className="space-y-3">
                {progressData.map((data) => (
                  <div key={data.subject} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{getTrendIcon(data.trend)}</span>
                    <div>
                      <div className="font-medium text-gray-800">{data.subject}</div>
                      <div className="text-sm text-gray-600">
                        {data.trend === 'up' && `Excellente progression ! Continuez ainsi (Moyenne: ${data.average.toFixed(1)}/20)`}
                        {data.trend === 'down' && `Attention, baisse de niveau. Planifiez plus de révisions (Moyenne: ${data.average.toFixed(1)}/20)`}
                        {data.trend === 'stable' && `Progression stable. Essayez de nouveaux exercices (Moyenne: ${data.average.toFixed(1)}/20)`}
                      </div>
                    </div>
                  </div>
                ))}
                {progressData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-6xl mb-4">📈</div>
                    <p>Ajoutez des notes pour voir votre progression !</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une note</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                  <input
                    type="text"
                    value={newNote.subject}
                    onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ex: Mathématiques"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professeur</label>
                  <input
                    type="text"
                    value={newNote.teacherName}
                    onChange={(e) => setNewNote({...newNote, teacherName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ex: M. Dubois"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note obtenue</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newNote.grade}
                      onChange={(e) => setNewNote({...newNote, grade: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="16"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note sur</label>
                    <input
                      type="number"
                      value={newNote.maxGrade}
                      onChange={(e) => setNewNote({...newNote, maxGrade: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newNote.date}
                    onChange={(e) => setNewNote({...newNote, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d&apos;évaluation</label>
                  <select
                    value={newNote.type}
                    onChange={(e) => setNewNote({...newNote, type: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="exam">Examen</option>
                    <option value="test">Contrôle</option>
                    <option value="homework">Devoir</option>
                    <option value="exercise">Exercice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
                  <textarea
                    value={newNote.comment}
                    onChange={(e) => setNewNote({...newNote, comment: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    placeholder="Commentaire du professeur ou notes personnelles"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addNote}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}