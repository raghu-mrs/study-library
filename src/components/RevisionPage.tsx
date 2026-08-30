'use client';

import React, { useState } from 'react';
import { useData } from '@/components/SupabaseProvider';

interface RevisionPageProps {
  onNavigate: (page: string) => void;
}

export default function RevisionPage({ onNavigate }: RevisionPageProps) {
  const [activeTab, setActiveTab] = useState<'important' | 'very-important' | 'revision' | 'bookmarks' | 'highlights'>('very-important');
  const { books, notes, bookmarks } = useData();

  const importantNotes = notes.filter(n => n.importance === 'important');
  const veryImportantNotes = notes.filter(n => n.importance === 'very-important');
  const revisionNotes = notes.filter(n => n.importance === 'revision');
  const importantBooks = books.filter(b => b.importance === 'important' || b.importance === 'very-important');

  const allHighlights = notes.flatMap(n => n.highlights.map(h => ({ text: h, source: n.title, subject: n.subjectName, noteId: n.id })));

  const tabs = [
    { id: 'very-important', label: '🔴 Very Important', count: veryImportantNotes.length },
    { id: 'important', label: '⚠ Important', count: importantNotes.length },
    { id: 'revision', label: '🔁 For Revision', count: revisionNotes.length },
    { id: 'bookmarks', label: '🔖 Bookmarks', count: bookmarks.length },
    { id: 'highlights', label: '✨ Highlights', count: allHighlights.length },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Revision Center</h2>
        <p className="page-subtitle">All your important content, bookmarks, and highlights in one place</p>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: activeTab === tab.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: activeTab === tab.id ? 'var(--accent-glow)' : 'var(--bg-card)',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            id={`revision-tab-${tab.id}`}
          >
            {tab.label}
            <span style={{
              marginLeft: 6,
              background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-hover)',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 10,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content by tab */}
      {activeTab === 'very-important' && (
        <div>
          <div className="section-header"><div className="section-title">Very Important Notes</div></div>
          {veryImportantNotes.length === 0 && importantBooks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No very important items yet. Mark notes or books as "Very Important" to see them here.
            </div>
          ) : (
            <div className="notes-grid">
              {veryImportantNotes.map(note => (
                <div key={note.id} className="note-card" onClick={() => onNavigate(`note-${note.id}`)} id={`rev-vi-note-${note.id}`}>
                  <div className="note-card-top">
                    <div className="note-title">{note.title}</div>
                    <span className="note-importance very-important">🔴 Very Imp.</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>📂 {note.topic}</div>
                  <div className="note-preview">{note.content}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {note.highlights.map((h, i) => (
                      <span key={i} style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(240,180,41,0.1)', color: 'var(--gold)', borderRadius: 6 }}>✨ {h}</span>
                    ))}
                  </div>
                </div>
              ))}
              {/* Books */}
              {importantBooks.map(book => (
                <div key={book.id} className="note-card" onClick={() => onNavigate(`reader-${book.id}`)} id={`rev-vi-book-${book.id}`}>
                  <div className="note-card-top">
                    <div className="note-title">{book.coverEmoji} {book.title}</div>
                    <span className="note-importance very-important">🔴 Very Imp.</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author} · {book.subjectName}</div>
                  <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${Math.round((book.currentPage / book.totalPages) * 100)}%`, background: 'var(--accent)' }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'important' && (
        <div className="notes-grid">
          {importantNotes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No important notes yet.
            </div>
          ) : importantNotes.map(note => (
            <div key={note.id} className="note-card" onClick={() => onNavigate(`note-${note.id}`)} id={`rev-imp-note-${note.id}`}>
              <div className="note-card-top">
                <div className="note-title">{note.title}</div>
                <span className="note-importance important">⚠ Important</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>📂 {note.topic}</div>
              <div className="note-preview">{note.content}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'revision' && (
        <div className="notes-grid">
          {revisionNotes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No items marked for revision yet.
            </div>
          ) : revisionNotes.map(note => (
            <div key={note.id} className="note-card" onClick={() => onNavigate(`note-${note.id}`)} id={`rev-rev-note-${note.id}`}>
              <div className="note-card-top">
                <div className="note-title">{note.title}</div>
                <span className="note-importance revision">🔁 Revision</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>📂 {note.topic}</div>
              <div className="note-preview">{note.content}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bookmarks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No bookmarks added yet.
            </div>
          ) : bookmarks.map(bm => (
            <div
              key={bm.id}
              className="card card-clickable"
              style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              onClick={() => onNavigate(`reader-${bm.bookId}`)}
              id={`rev-bm-${bm.id}`}
            >
              <div style={{ fontSize: 28 }}>🔖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{bm.bookTitle}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Page {bm.pageNumber} · {bm.createdDate}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>"{bm.note}"</div>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 12 }}>Open →</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'highlights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allHighlights.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No highlights yet.
            </div>
          ) : allHighlights.map((h, i) => (
            <div
              key={i}
              className="card card-clickable"
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              onClick={() => onNavigate(`note-${h.noteId}`)}
              id={`rev-hl-${i}`}
            >
              <span style={{ fontSize: 18, marginTop: 2 }}>✨</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{h.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>From: {h.source} · {h.subject}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
