'use client';

import React, { useState } from 'react';
import { useData } from '@/components/SupabaseProvider';

interface SearchPageProps {
  onNavigate: (page: string) => void;
  initialQuery?: string;
}

export default function SearchPage({ onNavigate, initialQuery = '' }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'books' | 'notes' | 'bookmarks' | 'highlights'>('all');
  const { books, notes, bookmarks } = useData();

  const q = query.toLowerCase().trim();

  const matchingBooks = q ? books.filter(b =>
    b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.subjectName.toLowerCase().includes(q)
  ) : [];

  const matchingNotes = q ? notes.filter(n =>
    n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.topic.toLowerCase().includes(q) || n.subjectName.toLowerCase().includes(q)
  ) : [];

  const matchingHighlights = q ? notes.flatMap(n =>
    (n.highlights || [])
      .filter(h => h.toLowerCase().includes(q))
      .map(h => ({ text: h, source: n.title, noteId: n.id, subject: n.subjectName }))
  ) : [];

  const matchingBookmarks = q ? bookmarks.filter(bm =>
    bm.bookTitle.toLowerCase().includes(q) || bm.note.toLowerCase().includes(q)
  ) : [];

  const totalResults = matchingBooks.length + matchingNotes.length + matchingHighlights.length + matchingBookmarks.length;

  const highlight = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(240,180,41,0.35)', color: 'var(--gold)', padding: '0 2px', borderRadius: 2 }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const filters = [
    { id: 'all', label: 'All', count: totalResults },
    { id: 'books', label: '📖 Books', count: matchingBooks.length },
    { id: 'notes', label: '📝 Notes', count: matchingNotes.length },
    { id: 'highlights', label: '✨ Highlights', count: matchingHighlights.length },
    { id: 'bookmarks', label: '🔖 Bookmarks', count: matchingBookmarks.length },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Search</h2>
        <p className="page-subtitle">Search across all books, notes, highlights, and bookmarks</p>
      </div>

      {/* Search Input */}
      <div className="topbar-search" style={{ marginBottom: 20, maxWidth: 600, padding: '12px 16px', borderRadius: 10 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search books, notes, highlights, bookmarks..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ fontSize: 15 }}
          autoFocus
          id="search-main-input"
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
        )}
      </div>

      {/* Filters */}
      {q && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: activeFilter === f.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: activeFilter === f.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                color: activeFilter === f.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
              id={`search-filter-${f.id}`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!q && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Search your entire library</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.8 }}>
            Find anything across your books, notes, highlights, and bookmarks instantly.
            Try searching for "Fundamental Rights", "GDP", "Mauryan" etc.
          </div>
        </div>
      )}

      {/* Results */}
      {q && totalResults === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤷</div>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No results for "<strong>{query}</strong>"</div>
        </div>
      )}

      {/* Book Results */}
      {(activeFilter === 'all' || activeFilter === 'books') && matchingBooks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <div className="section-title">Books ({matchingBooks.length})</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matchingBooks.map(book => (
              <div key={book.id} className="card card-clickable" style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                onClick={() => onNavigate(`reader-${book.id}`)} id={`search-book-${book.id}`}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: book.coverBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {book.coverEmoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{highlight(book.title)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{highlight(book.author)} · {highlight(book.subjectName)} · {book.fileSize}</div>
                </div>
                <span className="book-tag subject">{book.subjectName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note Results */}
      {(activeFilter === 'all' || activeFilter === 'notes') && matchingNotes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <div className="section-title">Notes ({matchingNotes.length})</div>
          </div>
          <div className="notes-grid">
            {matchingNotes.map(note => (
              <div key={note.id} className="note-card" onClick={() => onNavigate(`note-${note.id}`)} id={`search-note-${note.id}`}>
                <div className="note-card-top">
                  <div className="note-title">{highlight(note.title)}</div>
                  <span className="note-subject-badge">{note.subjectName}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>📂 {note.topic}</div>
                <div className="note-preview">{highlight(note.content)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlight Results */}
      {(activeFilter === 'all' || activeFilter === 'highlights') && matchingHighlights.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <div className="section-title">Highlights ({matchingHighlights.length})</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matchingHighlights.map((h, i) => (
              <div key={i} className="card card-clickable" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
                onClick={() => onNavigate(`note-${h.noteId}`)} id={`search-hl-${i}`}>
                <span style={{ fontSize: 16 }}>✨</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{highlight(h.text)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>From: {h.source} · {h.subject}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmark Results */}
      {(activeFilter === 'all' || activeFilter === 'bookmarks') && matchingBookmarks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-header">
            <div className="section-title">Bookmarks ({matchingBookmarks.length})</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matchingBookmarks.map(bm => (
              <div key={bm.id} className="card card-clickable" style={{ display: 'flex', gap: 10, alignItems: 'center' }}
                onClick={() => onNavigate(`reader-${bm.bookId}`)} id={`search-bm-${bm.id}`}>
                <span style={{ fontSize: 16 }}>🔖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{highlight(bm.bookTitle)} — Page {bm.pageNumber}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{highlight(bm.note)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
