"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Note {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  grade: number;
  maxGrade: number;
  date: string;
  type: 'exam' | 'test' | 'homework' | 'exercise';
  comment?: string;
}

export default function TeacherNotes() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [newNote, setNewNote] = useState({
    studentId: "",
    subject: "",
    grade: "",
    maxGrade: "20",
    date: "",
    type: "exam" as const,
    comment: ""
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        loadStudents();
        loadNotes();
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadStudents = async () => {
    // TODO: Load from Supabase
    // Mock data for now
    const mockStudents: Student[] = [
      { id: "1", name: "Marie Dupont", email: "marie.dupont@email.com" },
      { id: "2", name: "Pierre Martin", email: "pierre.martin@email.com" },
      { id: "3", name: "Sophie Durand", email: "sophie.durand@email.com" }
    ];
    setStudents(mockStudents);
  };

  const loadNotes = async () => {
    // TODO: Load from Supabase
    // Mock data for now
    const mockNotes: Note[] = [
      {
        id: "1",
        studentId: "1",
        studentName: "Marie Dupont",
        subject: "Mathématiques",
        grade: 16,
        maxGrade: 20,
        date: "2025-09-15",
        type: "exam",
        comment: "Bon travail sur les équations"
      },
      {
        id: "2",
        studentId: "2",
        studentName: "Pierre Martin",
        subject: "Mathématiques",
        grade: 14,
        maxGrade: 20,
        date: "2025-09-20",
        type: "test",
        comment: "Revoir les bases"
      },
      {
        id: "3",
        studentId: "1",
        studentName: "Marie Dupont",
        subject: "Mathématiques",
        grade: 18,
        maxGrade: 20,
        date: "2025-09-25",
        type: "homework",
        comment: "Excellent progrès !"
      }
    ];
    setNotes(mockNotes);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedStudentData = students.find(s => s.id === newNote.studentId);
    
    const note: Note = {
      id: Date.now().toString(),
      studentId: newNote.studentId,
      studentName: selectedStudentData?.name || "",
      subject: newNote.subject,
      grade: parseFloat(newNote.grade),
      maxGrade: parseFloat(newNote.maxGrade),
      date: newNote.date,
      type: newNote.type,
      comment: newNote.comment
    };

    // TODO: Save to Supabase and notify student
    setNotes(prev => [note, ...prev]);
    setShowAddModal(false);
    resetForm();

    // TODO: Send notification to student
    console.log(`Notification sent to ${selectedStudentData?.name}: New grade added`);
  };

  const resetForm = () => {
    setNewNote({
      studentId: "",
      subject: "",
      grade: "",
      maxGrade: "20",
      date: "",
      type: "exam",
      comment: ""
    });
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      exam: "Examen",
      test: "Contrôle",
      homework: "Devoir",
      exercise: "Exercice"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      exam: "bg-red-100 text-red-800",
      test: "bg-orange-100 text-orange-800",
      homework: "bg-blue-100 text-blue-800",
      exercise: "bg-green-100 text-green-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredNotes = selectedStudent === "all" 
    ? notes 
    : notes.filter(note => note.studentId === selectedStudent);

  const calculateStudentAverage = (studentId: string) => {
    const studentNotes = notes.filter(note => note.studentId === studentId);
    if (studentNotes.length === 0) return 0;
    
    const total = studentNotes.reduce((sum, note) => sum + (note.grade / note.maxGrade) * 20, 0);
    return total / studentNotes.length;
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-purple-600">Gestion des notes</h1>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Notes de mes étudiants
            </h2>
            <p className="text-gray-600">
              Saisissez et gérez les notes de vos étudiants
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une note
          </button>
        </div>

        {/* Students Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {students.map(student => (
            <div key={student.id} className="bg-white rounded-2xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Moyenne générale</span>
                  <span className={`font-bold ${getGradeColor(calculateStudentAverage(student.id), 20)}`}>
                    {calculateStudentAverage(student.id).toFixed(1)}/20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nombre de notes</span>
                  <span className="font-medium text-gray-800">
                    {notes.filter(n => n.studentId === student.id).length}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStudent(student.id)}
                  className="w-full mt-3 bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Voir les notes
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrer par étudiant :</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Tous les étudiants</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {selectedStudent !== "all" && (
              <button
                onClick={() => setSelectedStudent("all")}
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                Voir tous
              </button>
            )}
          </div>
        </div>

        {/* Notes List */}
        <div className="bg-white rounded-2xl shadow-lg border">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedStudent === "all" 
                ? "Toutes les notes" 
                : `Notes de ${students.find(s => s.id === selectedStudent)?.name}`
              }
            </h3>
          </div>
          
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="h-20 w-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium mb-2">Aucune note disponible</p>
              <p className="text-sm">Ajoutez des notes pour commencer le suivi</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-800">{note.studentName}</h4>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm font-medium text-gray-700">{note.subject}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                          {getTypeLabel(note.type)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {new Date(note.date).toLocaleDateString('fr-FR')}
                        </span>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getGradeColor(note.grade, note.maxGrade)}`}>
                            {note.grade}/{note.maxGrade}
                          </p>
                          <p className="text-sm text-gray-600">
                            {((note.grade / note.maxGrade) * 20).toFixed(1)}/20
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {note.comment && (
                      <div className="mt-3 bg-white p-3 rounded border">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Commentaire :</span> {note.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Ajouter une note</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddNote} className="p-6 space-y-6">
              <div>
                <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Étudiant *
                </label>
                <select
                  id="studentId"
                  value={newNote.studentId}
                  onChange={(e) => setNewNote({...newNote, studentId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Sélectionnez un étudiant</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Matière *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={newNote.subject}
                  onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                  placeholder="Ex: Mathématiques"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="grade" className="block text-sm font-semibold text-gray-700 mb-2">
                    Note obtenue *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    id="grade"
                    value={newNote.grade}
                    onChange={(e) => setNewNote({...newNote, grade: e.target.value})}
                    placeholder="15.5"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="maxGrade" className="block text-sm font-semibold text-gray-700 mb-2">
                    Note maximale *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    id="maxGrade"
                    value={newNote.maxGrade}
                    onChange={(e) => setNewNote({...newNote, maxGrade: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    id="type"
                    value={newNote.type}
                    onChange={(e) => setNewNote({...newNote, type: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    required
                  >
                    <option value="exam">Examen</option>
                    <option value="test">Contrôle</option>
                    <option value="homework">Devoir</option>
                    <option value="exercise">Exercice</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={newNote.date}
                  onChange={(e) => setNewNote({...newNote, date: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  id="comment"
                  value={newNote.comment}
                  onChange={(e) => setNewNote({...newNote, comment: e.target.value})}
                  placeholder="Commentaires sur cette note..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Enregistrer la note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}