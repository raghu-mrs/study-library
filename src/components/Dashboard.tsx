'use client';

import React from 'react';
import { SUBJECTS } from '@/lib/data';
import { useData } from '@/components/SupabaseProvider';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const importanceLabel: Record<string, string> = {
  'important': 'Important',
  'very-important': 'Very Important',
  'revision': 'Revision',
  'completed': 'Completed',
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { books, notes, bookmarks } = useData();

  const recentBooks = books.slice(0, 4);
  const recentNotes = notes.slice(0, 4);
  const topSubjects = SUBJECTS.slice(0, 6);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Good Morning! 👋</h2>
        <p className="page-subtitle">Continue your UPSC journey. You&apos;re on a <strong style={{ color: 'var(--gold)' }}>24-day streak 🔥</strong></p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card" id="stat-books">
          <div className="stat-icon blue">📖</div>
          <div>
            <div className="stat-value">{books.length}</div>
            <div className="stat-label">Total Books</div>
          </div>
        </div>
        <div className="stat-card" id="stat-notes">
          <div className="stat-icon gold">📝</div>
          <div>
            <div className="stat-value">{notes.length}</div>
            <div className="stat-label">Total Notes</div>
          </div>
        </div>
        <div className="stat-card" id="stat-highlights">
          <div className="stat-icon green">✨</div>
          <div>
            <div className="stat-value">{notes.reduce((acc, note) => acc + (note.highlights?.length || 0), 0)}</div>
            <div className="stat-label">Highlights</div>
          </div>
        </div>
        <div className="stat-card" id="stat-bookmarks">
          <div className="stat-icon purple">🔖</div>
          <div>
            <div className="stat-value">{bookmarks.length}</div>
            <div className="stat-label">Bookmarks</div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Recently Opened Books */}
        <div className="card" id="section-recent-books">
          <div className="section-header">
            <div className="section-title">Recently Opened</div>
            <span className="section-link" onClick={() => onNavigate('books')}>View all</span>
          </div>
          <div className="recent-list">
            {recentBooks.length > 0 ? recentBooks.map(book => (
              <div key={book.id} className="recent-item" id={`recent-book-${book.id}`}
                onClick={() => onNavigate(`reader-${book.id}`)}>
                <div className="recent-icon" style={{ background: book.coverBg }}>
                  {book.coverEmoji}
                </div>
                <div className="recent-info">
                  <div className="recent-title">{book.title}</div>
                  <div className="recent-meta">{book.author} · p.{book.currentPage}/{book.totalPages}</div>
                  <div className="progress-bar-bg" style={{ marginTop: 4 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.round((book.currentPage / book.totalPages) * 100)}%`,
                        background: 'var(--accent)',
                      }}
                    />
                  </div>
                </div>
                {book.importance && (
                  <span className={`note-importance ${book.importance}`}>
                    {importanceLabel[book.importance]}
                  </span>
                )}
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No books opened recently. Start reading to see them here!
              </div>
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="card" id="section-recent-notes">
          <div className="section-header">
            <div className="section-title">Recent Notes</div>
            <span className="section-link" onClick={() => onNavigate('notes')}>View all</span>
          </div>
          <div className="recent-list">
            {recentNotes.length > 0 ? recentNotes.map(note => (
              <div key={note.id} className="recent-item" id={`recent-note-${note.id}`}
                onClick={() => onNavigate(`note-${note.id}`)}>
                <div className="recent-icon" style={{ background: 'var(--gold-glow)' }}>📝</div>
                <div className="recent-info">
                  <div className="recent-title">{note.title}</div>
                  <div className="recent-meta">{note.subjectName} · {note.updatedDate}</div>
                </div>
                {note.importance && (
                  <span className={`note-importance ${note.importance}`}>
                    {importanceLabel[note.importance]}
                  </span>
                )}
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                You haven't made any notes yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="card" id="section-subject-progress" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">Subject-wise Progress</div>
          <span className="section-link" onClick={() => onNavigate('subjects')}>All Subjects</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {topSubjects.map(subject => {
            const subjectBooks = books.filter(b => b.subjectId === subject.id);
            const subjectNotes = notes.filter(n => n.subjectId === subject.id);
            const totalSubjectPages = subjectBooks.reduce((acc, b) => acc + (b.totalPages || 0), 0);
            const totalReadPages = subjectBooks.reduce((acc, b) => acc + (b.currentPage || 0), 0);
            const progress = totalSubjectPages > 0 ? Math.round((totalReadPages / totalSubjectPages) * 100) : 0;
            
            return (
              <div key={subject.id} style={{ cursor: 'pointer' }}
                onClick={() => onNavigate(`subject-${subject.id}`)}
                id={`progress-${subject.id}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{subject.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{subject.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%`, background: subject.color }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>📖 {subjectBooks.length} books</span>
                  <span>📝 {subjectNotes.length} notes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Revision */}
      <div className="card" id="section-quick-revision">
        <div className="section-header">
          <div className="section-title">Quick Revision</div>
          <span className="section-link" onClick={() => onNavigate('revision')}>Open Revision</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {bookmarks.map(bm => (
            <div key={bm.id}
              className="card card-clickable"
              style={{ padding: '10px 14px', flex: '1 1 200px', minWidth: 160 }}
              onClick={() => onNavigate(`reader-${bm.bookId}`)}
              id={`bookmark-${bm.id}`}
            >
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                🔖 {bm.bookTitle}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                Page {bm.pageNumber}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bm.note}</div>
            </div>
          ))}
          <div
            className="card card-clickable"
            style={{ padding: '10px 14px', flex: '1 1 160px', minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, border: '2px dashed var(--border)' }}
            onClick={() => onNavigate('bookmarks')}
            id="view-all-bookmarks"
          >
            <span style={{ fontSize: 20 }}>🔖</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View all bookmarks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
