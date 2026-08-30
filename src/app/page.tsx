'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Dashboard from '@/components/Dashboard';
import SubjectsPage from '@/components/SubjectsPage';
import BooksPage from '@/components/BooksPage';
import NotesPage from '@/components/NotesPage';
import RevisionPage from '@/components/RevisionPage';
import dynamic from 'next/dynamic';
const PdfReader = dynamic(() => import('@/components/PdfReader'), { ssr: false });
import SearchPage from '@/components/SearchPage';
import { SUBJECTS } from '@/lib/data';
import { useData } from '@/components/SupabaseProvider';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  subjects: 'All Subjects',
  books: 'My Library',
  notes: 'Notes',
  revision: 'Revision Center',
  bookmarks: 'Bookmarks',
  highlights: 'Highlights',
  search: 'Search',
  upload: 'Upload PDF',
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { books, notes, bookmarks, loading } = useData();

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0 });
  };

  // Determine title
  let pageTitle = PAGE_TITLES[currentPage] || 'UPSC Study Library';
  if (currentPage.startsWith('subject-')) {
    const subjectId = currentPage.replace('subject-', '');
    const subject = SUBJECTS.find(s => s.id === subjectId);
    pageTitle = subject ? `${subject.emoji} ${subject.name}` : 'Subject';
  } else if (currentPage.startsWith('reader-')) {
    const bookId = currentPage.replace('reader-', '');
    const book = books.find(b => b.id === bookId);
    pageTitle = book ? book.title : 'PDF Reader';
  } else if (currentPage.startsWith('note-')) {
    const noteId = currentPage.replace('note-', '');
    const note = notes.find(n => n.id === noteId);
    pageTitle = note ? note.title : 'Note';
  }

  // Render page content
  const renderPage = () => {
    if (currentPage === 'dashboard') return <Dashboard onNavigate={navigate} />;
    if (currentPage === 'subjects') return <SubjectsPage onNavigate={navigate} />;
    if (currentPage === 'books' || currentPage === 'upload') return <BooksPage onNavigate={navigate} />;
    if (currentPage === 'notes') return <NotesPage onNavigate={navigate} />;
    if (currentPage === 'revision') return <RevisionPage onNavigate={navigate} />;
    if (currentPage === 'search') return <SearchPage onNavigate={navigate} initialQuery={searchQuery} />;

    if (currentPage === 'bookmarks') return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">🔖 All Bookmarks</h2>
          <p className="page-subtitle">{bookmarks.length} bookmarks saved</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bookmarks.map(bm => (
            <div key={bm.id} className="card card-clickable" style={{ display: 'flex', gap: 14, alignItems: 'center' }}
              onClick={() => navigate(`reader-${bm.bookId}`)} id={`bookmark-page-${bm.id}`}>
              <div style={{ fontSize: 28 }}>🔖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{bm.bookTitle}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Page {bm.pageNumber} · Added {bm.createdDate}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>"{bm.note}"</div>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 12 }}>Open →</button>
            </div>
          ))}
        </div>
      </div>
    );

    if (currentPage === 'highlights') return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">✨ All Highlights</h2>
          <p className="page-subtitle">All your highlighted text and key points</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notes.flatMap(n => n.highlights.map((h, i) => (
            <div key={`${n.id}-${i}`} className="card card-clickable" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              onClick={() => navigate(`note-${n.id}`)} id={`highlight-page-${n.id}-${i}`}>
              <span style={{ fontSize: 18 }}>✨</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{h}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>From: {n.title} · {n.subjectName}</div>
              </div>
            </div>
          )))}
        </div>
      </div>
    );

    // Subject page
    if (currentPage.startsWith('subject-')) {
      const subjectId = currentPage.replace('subject-', '');
      const subject = SUBJECTS.find(s => s.id === subjectId);
      const subjectBooks = books.filter(b => b.subjectId === subjectId);
      const subjectNotes = notes.filter(n => n.subjectId === subjectId);
      
      const bookCount = subjectBooks.length;
      const noteCount = subjectNotes.length;
      let totalP = 0, currentP = 0;
      subjectBooks.forEach(b => { totalP += b.totalPages || 1; currentP += b.currentPage || 1; });
      const progress = totalP > 0 ? Math.round((currentP / totalP) * 100) : 0;

      if (!subject) return <div>Subject not found</div>;
      return (
        <div className="page-container">
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 32 }}>{subject.emoji}</span>
              <div>
                <h2 className="page-title">{subject.name}</h2>
                <p className="page-subtitle">{bookCount} books · {noteCount} notes · {progress}% studied</p>
              </div>
            </div>
            <div className="progress-bar-bg" style={{ maxWidth: 300 }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: subject.color }} />
            </div>
          </div>

          {/* Books */}
          <div className="section-header">
            <div className="section-title">Books in {subject.name}</div>
            <span className="section-link" onClick={() => navigate('books')}>View all</span>
          </div>
          {subjectBooks.length > 0 ? (
            <div className="books-grid" style={{ marginBottom: 24 }}>
              {subjectBooks.map(book => (
                <div key={book.id} className="book-card" onClick={() => navigate(`reader-${book.id}`)} id={`subject-book-${book.id}`}>
                  <div className="book-cover" style={{ background: book.coverBg }}>
                    <span style={{ fontSize: 40 }}>{book.coverEmoji}</span>
                  </div>
                  <div className="book-info">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>
              No books yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('upload')}>Upload your first book →</span>
            </div>
          )}

          {/* Notes */}
          <div className="section-header">
            <div className="section-title">Notes in {subject.name}</div>
            <span className="section-link" onClick={() => navigate('notes')}>View all</span>
          </div>
          {subjectNotes.length > 0 ? (
            <div className="notes-grid">
              {subjectNotes.map(note => (
                <div key={note.id} className="note-card" onClick={() => navigate(`note-${note.id}`)} id={`subject-note-${note.id}`}>
                  <div className="note-card-top">
                    <div className="note-title">{note.title}</div>
                    {note.importance && <span className={`note-importance ${note.importance}`}>{note.importance}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)' }}>📂 {note.topic}</div>
                  <div className="note-preview">{note.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
              No notes yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('notes')}>Create your first note →</span>
            </div>
          )}
        </div>
      );
    }

    // PDF Reader
    if (currentPage.startsWith('reader-')) {
      const bookId = currentPage.replace('reader-', '');
      return <PdfReader bookId={bookId} onNavigate={navigate} />;
    }

    // Note view
    if (currentPage.startsWith('note-')) {
      const noteId = currentPage.replace('note-', '');
      const note = notes.find(n => n.id === noteId);
      if (!note) return <div className="page-container"><p>Note not found</p></div>;
      return (
        <div className="page-container">
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-ghost" onClick={() => navigate('notes')} style={{ marginBottom: 12 }}>← Back to Notes</button>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 className="page-title">{note.title}</h2>
                <p style={{ fontSize: 12, color: 'var(--accent)' }}>📂 {note.topic}</p>
              </div>
              {note.importance && <span className={`note-importance ${note.importance}`}>{note.importance}</span>}
            </div>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{note.content}</div>
          </div>
          {note.highlights.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>✨ Highlights</div>
              {note.highlights.map((h, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: i < note.highlights.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, color: 'var(--gold)' }}>• {h}</div>
              ))}
            </div>
          )}
          {note.references.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>📚 References</div>
              {note.references.map((r, i) => (
                <div key={i} style={{ padding: '4px 0', fontSize: 12, color: 'var(--text-secondary)' }}>→ {r}</div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <Dashboard onNavigate={navigate} />;
  };

  const isFullScreen = currentPage.startsWith('reader-');

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>Loading data...</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={navigate} />
      <main className={`main-content ${isFullScreen ? '' : ''}`} style={{ overflowY: isFullScreen ? 'hidden' : 'auto' }}>
        {!isFullScreen && (
          <Topbar
            title={pageTitle}
            onSearch={(q) => { setSearchQuery(q); navigate('search'); }}
            onNavigate={navigate}
          />
        )}
        {renderPage()}
      </main>
    </div>
  );
}
