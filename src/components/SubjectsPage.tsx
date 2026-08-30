'use client';

import React, { useState } from 'react';
import { SUBJECTS } from '@/lib/data';
import { useData } from '@/components/SupabaseProvider';

interface SubjectsPageProps {
  onNavigate: (page: string) => void;
}

export default function SubjectsPage({ onNavigate }: SubjectsPageProps) {
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { books, notes } = useData();

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">All Subjects</h2>
            <p className="page-subtitle">{SUBJECTS.length} subjects · {books.length} books · {notes.length} notes</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={() => setNewFolderMode(true)}
              id="btn-add-subject"
            >
              + New Subject
            </button>
          </div>
        </div>
      </div>

      {/* New folder input */}
      {newFolderMode && (
        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>📁</span>
          <input
            type="text"
            placeholder="Subject name..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
            }}
            autoFocus
            id="new-subject-input"
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              if (newFolderName.trim()) {
                alert(`Subject "${newFolderName}" would be created (connect Supabase to persist)`);
                setNewFolderName('');
                setNewFolderMode(false);
              }
            }}
            id="btn-save-subject"
          >
            Create
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { setNewFolderMode(false); setNewFolderName(''); }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="subjects-grid">
        {SUBJECTS.map(subject => {
          const subjectBooks = books.filter(b => b.subjectId === subject.id);
          const subjectNotes = notes.filter(n => n.subjectId === subject.id);
          const totalSubjectPages = subjectBooks.reduce((acc, b) => acc + (b.totalPages || 0), 0);
          const totalReadPages = subjectBooks.reduce((acc, b) => acc + (b.currentPage || 0), 0);
          const progress = totalSubjectPages > 0 ? Math.round((totalReadPages / totalSubjectPages) * 100) : 0;
          
          return (
            <div
              key={subject.id}
              className="subject-card"
              style={{ '--subject-color': subject.color, '--subject-bg': subject.bgColor } as React.CSSProperties}
              onClick={() => onNavigate(`subject-${subject.id}`)}
              id={`subject-card-${subject.id}`}
            >
              <div className="subject-icon">{subject.emoji}</div>
              <div>
                <div className="subject-name">{subject.name}</div>
                <div className="subject-meta">
                  <span>📖 {subjectBooks.length}</span>
                  <div className="subject-dot" />
                  <span>📝 {subjectNotes.length}</span>
                </div>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%`, background: subject.color }}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{progress}% studied</div>
            </div>
          );
        })}

        {/* Add custom subject card */}
        <div
          className="subject-card"
          style={{ border: '2px dashed var(--border)', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}
          onClick={() => setNewFolderMode(true)}
          id="subject-card-add"
        >
          <div style={{ fontSize: 28, color: 'var(--text-muted)', marginBottom: 8 }}>+</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Add Custom Subject</div>
        </div>
      </div>
    </div>
  );
}
