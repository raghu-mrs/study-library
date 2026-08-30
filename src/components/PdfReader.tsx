'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/SupabaseProvider';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  bookId: string;
  onNavigate: (page: string) => void;
}

export default function PdfReader({ bookId, onNavigate }: PdfReaderProps) {
  const { books, refreshData } = useData();
  const book = books.find(b => b.id === bookId);
  
  const [currentPage, setCurrentPage] = useState(book?.currentPage || 1);
  const [showNotePanel, setShowNotePanel] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [activeTool, setActiveTool] = useState<'cursor' | 'highlight' | 'underline' | 'strikethrough' | 'note' | 'bookmark'>('cursor');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [pageBookmarked, setPageBookmarked] = useState(false);
  const [importance, setImportance] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    if (!book?.totalPages || book.totalPages === 0) {
      supabase.from('books').update({ total_pages: numPages }).eq('id', book!.id).then(() => refreshData());
    }
  }

  if (!book) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Book not found</div>;
  }

  const total = numPages || book.totalPages || 1;
  const progress = Math.round((currentPage / Math.max(total, 1)) * 100);

  const handleSaveNote = async () => {
    setSaving(true);
    
    // 1. Save Note
    if (noteContent.trim() || highlights.length > 0) {
      await supabase.from('notes').insert({
        title: `Notes on ${book.title} - p.${currentPage}`,
        subject_id: book.subjectId,
        subject_name: book.subjectName,
        topic: `Page ${currentPage}`,
        content: noteContent || 'Highlights only',
        importance: importance || null,
        linked_book_id: book.id,
        linked_page: currentPage,
        highlights: highlights
      });
    }

    // 2. Save Bookmark
    if (pageBookmarked) {
      await supabase.from('bookmarks').insert({
        book_id: book.id,
        book_title: book.title,
        page_number: currentPage,
        note: `Bookmarked page ${currentPage}`
      });
    }

    // 3. Update Book Progress
    await supabase.from('books').update({
      current_page: Math.max(currentPage, book.currentPage),
      last_opened: new Date().toISOString()
    }).eq('id', book.id);

    setSaving(false);
    alert('Notes and progress saved to Supabase!');
    await refreshData();
  };

  const toolbarTools = [
    { id: 'cursor', icon: '↖', label: 'Select' },
    { id: 'highlight', icon: '✏', label: 'Highlight', color: '#f0b429' },
    { id: 'underline', icon: 'U̲', label: 'Underline', color: '#4f8ef7' },
    { id: 'strikethrough', icon: 'S̶', label: 'Strikethrough', color: '#f87171' },
    { id: 'note', icon: '💬', label: 'Add Note' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Reader Topbar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          className="btn btn-ghost"
          onClick={() => onNavigate('books')}
          style={{ padding: '6px 10px', fontSize: 13 }}
          id="reader-back-btn"
        >
          ← Back
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {book.coverEmoji} {book.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author} · {book.subjectName}</div>
        </div>

        {/* Annotation tools */}
        <div style={{ display: 'flex', gap: 3, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
          {toolbarTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              title={tool.label}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                background: activeTool === tool.id ? 'var(--accent)' : 'transparent',
                color: activeTool === tool.id ? 'white' : (tool.color || 'var(--text-secondary)'),
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
              id={`reader-tool-${tool.id}`}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => setPageBookmarked(!pageBookmarked)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: pageBookmarked ? 'var(--gold-glow)' : 'var(--bg-card)',
            color: pageBookmarked ? 'var(--gold)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 0.15s',
          }}
          title="Bookmark this page"
          id="reader-bookmark-btn"
        >
          {pageBookmarked ? '🔖' : '🏷'}
        </button>

        {/* Toggle notes panel */}
        <button
          className="btn btn-secondary"
          onClick={() => setShowNotePanel(!showNotePanel)}
          style={{ fontSize: 12, padding: '6px 12px' }}
          id="reader-toggle-notes-btn"
        >
          📝 Notes
        </button>
      </div>

      {/* Main Reader Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* PDF Viewer Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', justifyContent: 'center', background: '#f5f7f9' }}>
            {book.pdfUrl ? (
              <Document
                file={book.pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div style={{ padding: 40, color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: 24, display: 'block', marginBottom: 10 }}>📄</span>
                    Loading PDF Document...
                  </div>
                }
                error={
                  <div style={{ padding: 40, color: '#f87171', textAlign: 'center' }}>
                    Failed to load PDF. Check file or CORS configuration.
                  </div>
                }
              >
                <div style={{ 
                  boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                  background: 'white'
                }}>
                  <Page 
                    pageNumber={currentPage} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={800}
                  />
                </div>
              </Document>
            ) : (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)' }}>No PDF File Found</div>
                <div style={{ fontSize: 13, marginTop: 6, maxWidth: 300 }}>This book record doesn't have an associated PDF file.</div>
              </div>
            )}
          </div>

          {/* Page Navigation */}
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--bg-secondary)',
            flexShrink: 0,
          }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              style={{ padding: '6px 14px', fontSize: 13 }}
              id="reader-prev-btn"
            >
              ← Prev
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page</span>
              <input
                type="number"
                value={currentPage}
                onChange={e => setCurrentPage(Math.min(total, Math.max(1, parseInt(e.target.value) || 1)))}
                style={{
                  width: 60, textAlign: 'center',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 13,
                }}
                id="reader-page-input"
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>of {total}</span>
              <div style={{ width: 120, marginLeft: 8 }}>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{progress}%</span>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(Math.min(total, currentPage + 1))}
              disabled={currentPage >= total}
              style={{ padding: '6px 14px', fontSize: 13 }}
              id="reader-next-btn"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Notes Panel */}
        {showNotePanel && (
          <div style={{
            width: 320,
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
              📝 Notes — Page {currentPage}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {/* Mark importance */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Mark page as:</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[
                    { v: 'important', l: '⚠ Important' },
                    { v: 'very-important', l: '🔴 Very Imp.' },
                    { v: 'revision', l: '🔁 Revision' },
                    { v: 'completed', l: '✅ Done' },
                  ].map(opt => (
                    <span
                      key={opt.v}
                      className={`tag tag-${opt.v}`}
                      style={{ cursor: 'pointer', opacity: importance === opt.v ? 1 : 0.5 }}
                      onClick={() => setImportance(importance === opt.v ? '' : opt.v)}
                    >
                      {opt.l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Add highlight */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Quick Highlight (type key point):</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    placeholder="Add highlight..."
                    id="reader-highlight-input"
                    style={{
                      flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none',
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        setHighlights([...highlights, (e.target as HTMLInputElement).value.trim()]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: 12 }}
                    onClick={() => {
                      const inp = document.getElementById('reader-highlight-input') as HTMLInputElement;
                      if (inp?.value.trim()) { setHighlights([...highlights, inp.value.trim()]); inp.value = ''; }
                    }}
                  >
                    Add
                  </button>
                </div>
                {highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(240,180,41,0.1)', color: 'var(--gold)', borderRadius: 6, flex: 1 }}>✨ {h}</span>
                    <button onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>×</button>
                  </div>
                ))}
              </div>

              {/* Note textarea */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Page Notes:</div>
              <textarea
                placeholder={`Write your notes for page ${currentPage}...\n\n• Key concepts\n• Important cases\n• Mnemonic devices\n• Cross-references`}
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                rows={10}
                style={{
                  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13,
                  outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.6,
                }}
                id="reader-note-textarea"
              />
            </div>

            <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleSaveNote}
                disabled={saving}
                id="reader-save-notes-btn"
              >
                {saving ? 'Saving...' : '💾 Save Notes & Progress'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
