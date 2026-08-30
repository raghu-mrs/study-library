'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SUBJECTS } from '@/lib/data';
import { useData } from '@/components/SupabaseProvider';

interface BooksPageProps {
  onNavigate: (page: string) => void;
}

const importanceBadge: Record<string, { label: string; class: string }> = {
  'important': { label: '⚠ Important', class: 'important' },
  'very-important': { label: '🔴 Very Important', class: 'very-important' },
  'revision': { label: '🔁 Revision', class: 'revision' },
  'completed': { label: '✅ Completed', class: 'completed' },
};

export default function BooksPage({ onNavigate }: BooksPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress' | 'size'>('recent');
  const [filterSubject, setFilterSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { books, refreshData } = useData();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const filePath = `user-uploads/${fileName}`;

      try {
        // Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(filePath);

        // Add to database
        const { error: dbError } = await supabase.from('books').insert({
          title: file.name.replace('.pdf', ''),
          author: 'Unknown',
          subject_id: filterSubject === 'all' ? 'other' : filterSubject,
          subject_name: filterSubject === 'all' ? 'Other' : SUBJECTS.find(s => s.id === filterSubject)?.name || 'Other',
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          pdf_url: publicUrl,
          storage_path: filePath
        });

        if (dbError) throw dbError;
      } catch (err: any) {
        console.error('Upload error:', err);
        alert(`Error uploading ${file.name}: ${err.message}`);
      }
    }
    
    setUploading(false);
    setShowUpload(false);
    await refreshData();
  };

  const filteredBooks = books
    .filter(b => {
      const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubject = filterSubject === 'all' || b.subjectId === filterSubject;
      return matchSearch && matchSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'progress') return (b.currentPage / b.totalPages) - (a.currentPage / a.totalPages);
      return 0;
    });

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">My Library</h2>
            <p className="page-subtitle">{books.length} books across all subjects</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)} id="btn-upload-pdf">
            📤 Upload PDF
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <div
          className="upload-zone"
          style={{ marginBottom: 24 }}
          id="upload-zone"
          onDragOver={e => e.preventDefault()}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Drop PDF files here or click to browse
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Supports large PDF files · All subjects supported
          </div>
          <input
            type="file"
            accept=".pdf"
            multiple
            style={{ display: 'none' }}
            id="pdf-file-input"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById('pdf-file-input')?.click()}
            id="btn-browse-files"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Browse Files'}
          </button>
        </div>
      )}

      {/* Filters & Sort */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="topbar-search" style={{ flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="books-search-input"
          />
        </div>

        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13 }}
          id="books-subject-filter"
        >
          <option value="all">All Subjects</option>
          {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13 }}
          id="books-sort-select"
        >
          <option value="recent">Recently Opened</option>
          <option value="title">A–Z Title</option>
          <option value="progress">By Progress</option>
        </select>

        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{ padding: '4px 10px', borderRadius: 6, background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', border: 'none', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}
            id="btn-view-grid"
          >⊞</button>
          <button
            onClick={() => setViewMode('list')}
            style={{ padding: '4px 10px', borderRadius: 6, background: viewMode === 'list' ? 'var(--accent)' : 'transparent', border: 'none', color: viewMode === 'list' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}
            id="btn-view-list"
          >☰</button>
        </div>
      </div>

      {/* Books Grid */}
      {viewMode === 'grid' ? (
        <div className="books-grid">
          {filteredBooks.map(book => (
            <div key={book.id} className="book-card" onClick={() => onNavigate(`reader-${book.id}`)} id={`book-card-${book.id}`}>
              <div className="book-cover" style={{ background: book.coverBg }}>
                <span style={{ fontSize: 40 }}>{book.coverEmoji}</span>
                <div className="book-progress-bar">
                  <div className="book-progress-fill" style={{ width: `${Math.round((book.currentPage / book.totalPages) * 100)}%` }} />
                </div>
              </div>
              <div className="book-info">
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author}</div>
                <div className="book-tags">
                  <span className="book-tag subject">{book.subjectName}</span>
                  <span className="book-tag">{book.fileSize}</span>
                  {book.importance && (
                    <span className={`note-importance ${book.importance}`} style={{ fontSize: 10 }}>
                      {importanceBadge[book.importance]?.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredBooks.map(book => (
            <div
              key={book.id}
              className="recent-item"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}
              onClick={() => onNavigate(`reader-${book.id}`)}
              id={`book-list-${book.id}`}
            >
              <div className="recent-icon" style={{ background: book.coverBg, width: 44, height: 44, fontSize: 20 }}>
                {book.coverEmoji}
              </div>
              <div className="recent-info">
                <div className="recent-title" style={{ fontSize: 14 }}>{book.title}</div>
                <div className="recent-meta">{book.author} · {book.subjectName} · {book.fileSize}</div>
                <div className="progress-bar-bg" style={{ marginTop: 6 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.round((book.currentPage / book.totalPages) * 100)}%`, background: 'var(--accent)' }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {Math.round((book.currentPage / book.totalPages) * 100)}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>p.{book.currentPage}/{book.totalPages}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>No books found</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  );
}
