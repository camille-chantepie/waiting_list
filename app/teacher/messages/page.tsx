'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'file' | 'notification';
  metadata?: any;
}

interface Student {
  id: string;
  name: string;
  email: string;
  subject: string;
  lastMessage?: Date;
  unreadCount: number;
}

export default function TeacherMessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadStudents();
        loadMessages();
      }
      setLoading(false);
    };
    
    getUser();
  }, []);

  const loadStudents = async () => {
    // Mock data - replace with actual Supabase query
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Marie Dupont',
        email: 'marie.dupont@email.com',
        subject: 'Mathématiques',
        lastMessage: new Date('2024-01-15T14:30:00'),
        unreadCount: 2
      },
      {
        id: '2',
        name: 'Lucas Martin',
        email: 'lucas.martin@email.com',
        subject: 'Physique',
        lastMessage: new Date('2024-01-14T16:45:00'),
        unreadCount: 0
      },
      {
        id: '3',
        name: 'Emma Bernard',
        email: 'emma.bernard@email.com',
        subject: 'Chimie',
        lastMessage: new Date('2024-01-13T10:20:00'),
        unreadCount: 1
      }
    ];

    setStudents(mockStudents);
    if (mockStudents.length > 0) {
      setSelectedStudent(mockStudents[0]);
    }
  };

  const loadMessages = async () => {
    // Mock messages - replace with actual Supabase query
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Bonjour Professeur ! J&apos;aimerais proposer un créneau pour mercredi prochain à 14h.',
        sender: 'Marie Dupont',
        recipient: 'Prof',
        timestamp: new Date('2024-01-15T14:30:00'),
        isRead: false,
        type: 'text'
      },
      {
        id: '2',
        content: 'Parfait ! J&apos;ai accepté votre proposition. À mercredi !',
        sender: 'Prof',
        recipient: 'Marie Dupont',
        timestamp: new Date('2024-01-15T14:32:00'),
        isRead: true,
        type: 'text'
      },
      {
        id: '3',
        content: 'Merci ! J&apos;ai une question sur l&apos;exercice 5 du chapitre 3.',
        sender: 'Marie Dupont',
        recipient: 'Prof',
        timestamp: new Date('2024-01-15T16:15:00'),
        isRead: false,
        type: 'text'
      }
    ];

    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'Prof',
      recipient: selectedStudent.name,
      timestamp: new Date(),
      isRead: true,
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
            <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Students List */}
            <div className="w-1/3 border-r bg-gray-50">
              <div className="p-4 border-b bg-white">
                <h3 className="font-semibold text-gray-800">Conversations ({students.length})</h3>
              </div>
              <div className="overflow-y-auto h-full">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                      selectedStudent?.id === student.id ? 'bg-white border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{student.name}</h4>
                          {student.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {student.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{student.subject}</p>
                        {student.lastMessage && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(student.lastMessage)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedStudent ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {selectedStudent.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{selectedStudent.name}</h3>
                        <p className="text-sm text-gray-600">{selectedStudent.subject}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages
                      .filter(msg => 
                        msg.sender === selectedStudent.name || msg.recipient === selectedStudent.name
                      )
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'Prof' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'Prof'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'Prof' ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Sélectionnez une conversation pour commencer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}