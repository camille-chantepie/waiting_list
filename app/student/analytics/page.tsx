"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProgressData {
  subject: string;
  data: { date: string; grade: number }[];
  average: number;
  trend: 'up' | 'down' | 'stable';
}

export default function StudentAnalytics() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        loadProgressData();
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const loadProgressData = async () => {
    // TODO: Load from Supabase
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
          { date: "2025-07-15", grade: 11 },
          { date: "2025-08-01", grade: 13 },
          { date: "2025-08-15", grade: 12 },
          { date: "2025-09-01", grade: 14 },
          { date: "2025-09-15", grade: 14 },
        ],
        average: 12.3,
        trend: 'up'
      },
      {
        subject: "Français",
        data: [
          { date: "2025-07-01", grade: 16 },
          { date: "2025-07-15", grade: 15 },
          { date: "2025-08-01", grade: 17 },
          { date: "2025-08-15", grade: 16 },
          { date: "2025-09-01", grade: 17 },
          { date: "2025-09-15", grade: 18 },
        ],
        average: 16.5,
        trend: 'up'
      }
    ];
    setProgressData(mockData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const renderSimpleChart = (data: { date: string; grade: number }[]) => {
    const maxGrade = Math.max(...data.map(d => d.grade));
    const minGrade = Math.min(...data.map(d => d.grade));
    const range = maxGrade - minGrade || 1;

    return (
      <div className="relative h-32 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="300"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 280 + 10;
              const y = 90 - ((point.grade - minGrade) / range) * 70;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 280 + 10;
            const y = 90 - ((point.grade - minGrade) / range) * 70;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-2">
          <span>{maxGrade}</span>
          <span>{Math.round((maxGrade + minGrade) / 2)}</span>
          <span>{minGrade}</span>
        </div>
      </div>
    );
  };

  const getOverallTrend = () => {
    const allGrades = progressData.flatMap(subject => 
      subject.data.map(d => d.grade)
    );
    
    if (allGrades.length < 2) return 'stable';
    
    const firstHalf = allGrades.slice(0, Math.floor(allGrades.length / 2));
    const secondHalf = allGrades.slice(Math.floor(allGrades.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'up';
    if (difference < -0.5) return 'down';
    return 'stable';
  };

  const getOverallAverage = () => {
    const allAverages = progressData.map(subject => subject.average);
    return allAverages.reduce((a, b) => a + b, 0) / allAverages.length || 0;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-blue-600">Analytics & Progression</h1>
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
              <Link href="/student/notes" className="text-gray-600 hover:text-gray-800">
                Mes notes
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
              Suivi de ma progression
            </h2>
            <p className="text-gray-600">
              Analysez votre évolution et identifiez vos points d&apos;amélioration
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="1month">1 mois</option>
              <option value="3months">3 mois</option>
              <option value="6months">6 mois</option>
              <option value="1year">1 an</option>
            </select>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moyenne générale</p>
                <p className="text-3xl font-bold text-gray-800">{getOverallAverage().toFixed(1)}/20</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {getTrendIcon(getOverallTrend())}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Matières suivies</p>
                <p className="text-3xl font-bold text-gray-800">{progressData.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tendance globale</p>
                <p className="text-lg font-bold text-gray-800">
                  {getOverallTrend() === 'up' && '📈 Progression'}
                  {getOverallTrend() === 'down' && '📉 Régression'}
                  {getOverallTrend() === 'stable' && '➡️ Stable'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meilleure matière</p>
                <p className="text-lg font-bold text-gray-800">
                  {progressData.length > 0 ? 
                    progressData.reduce((best, current) => 
                      current.average > best.average ? current : best
                    ).subject : 'Aucune'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Charts by Subject */}
        <div className="space-y-6">
          {progressData.map((subject) => (
            <div key={subject.subject} className="bg-white rounded-2xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{subject.subject}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600">
                      Moyenne: <span className="font-bold">{subject.average.toFixed(1)}/20</span>
                    </span>
                    <div className="flex items-center">
                      {getTrendIcon(subject.trend)}
                      <span className="text-sm text-gray-600 ml-1">
                        {subject.trend === 'up' && 'En progression'}
                        {subject.trend === 'down' && 'En régression'}
                        {subject.trend === 'stable' && 'Stable'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{subject.data.length}</p>
                  <p className="text-sm text-gray-600">évaluations</p>
                </div>
              </div>

              {/* Chart */}
              {renderSimpleChart(subject.data)}

              {/* Data points summary */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Première note: {subject.data[0]?.grade}/20
                </span>
                <span>
                  Dernière note: {subject.data[subject.data.length - 1]?.grade}/20
                </span>
                <span>
                  Amélioration: {(subject.data[subject.data.length - 1]?.grade - subject.data[0]?.grade).toFixed(1)} pts
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Recommandations personnalisées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🎯 Points forts</h4>
              <ul className="text-sm space-y-1">
                {progressData
                  .filter(s => s.trend === 'up')
                  .map(s => (
                    <li key={s.subject}>• Excellente progression en {s.subject}</li>
                  ))
                }
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">📚 À améliorer</h4>
              <ul className="text-sm space-y-1">
                {progressData
                  .filter(s => s.average < 12)
                  .map(s => (
                    <li key={s.subject}>• Renforcer les bases en {s.subject}</li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}