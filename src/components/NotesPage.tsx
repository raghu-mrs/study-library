'use client';

import React, { useState } from 'react';
import { SUBJECTS } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/SupabaseProvider';

interface NotesPageProps {
  onNavigate: (page: string) => void;
}

const importanceOptions = [
  { value: 'important', label: '⚠ Important', className: 'important' },
  { value: 'very-important', label: '🔴 Very Important', className: 'very-important' },
  { value: 'revision', label: '🔁 Revision', className: 'revision' },
  { value: 'completed', label: '✅ Completed', className: 'completed' },
];

export default function NotesPage({ onNavigate }: NotesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', subject: 'polity', topic: '', content: '', importance: '' });
  const [saving, setSaving] = useState(false);
  const { notes, refreshData } = useData();

  const handleSaveNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please enter a title and content for the note');
      return;
    }

    setSaving(true);
    const subject = SUBJECTS.find(s => s.id === newNote.subject);

    const { error } = await supabase.from('notes').insert({
      title: newNote.title,
      subject_id: newNote.subject,
      subject_name: subject?.name || 'Unknown',
      topic: newNote.topic,
      content: newNote.content,
      importance: newNote.importance || null,
    });

    setSaving(false);
    if (error) {
      alert('Failed to save note: ' + error.message);
    } else {
      setNewNote({ title: '', subject: 'polity', topic: '', content: '', importance: '' });
      setShowNewNote(false);
      await refreshData();
    }
  };

  const filtered = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    const matchSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.topic.toLowerCase().includes(q);
    const matchSubject = filterSubject === 'all' || n.subjectId === filterSubject;
    const matchImportance = filterImportance === 'all' || n.importance === filterImportance;
    return matchSearch && matchSubject && matchImportance;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">Notes</h2>
            <p className="page-subtitle">{notes.length} notes across all subjects</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewNote(!showNewNote)} id="btn-new-note">
            + New Note
          </button>
        </div>
      </div>

      {/* New Note Form */}
      {showNewNote && (
        <div className="card" style={{ marginBottom: 24 }} id="new-note-form">
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Create New Note</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input
              placeholder="Note title..."
              value={newNote.title}
              onChange={e => setNewNote({ ...newNote, title: e.target.value })}
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
              id="new-note-title"
            />
            <select
              value={newNote.subject}
              onChange={e => setNewNote({ ...newNote, subject: e.target.value })}
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13 }}
              id="new-note-subject"
            >
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
            </select>
          </div>
          <input
            placeholder="Topic / Sub-topic (e.g. Constitution → Fundamental Rights)"
            value={newNote.topic}
            onChange={e => setNewNote({ ...newNote, topic: e.target.value })}
            style={{ width: '100%', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', marginBottom: 12 }}
            id="new-note-topic"
          />
          <textarea
            placeholder="Write your notes here... Add key points, highlights, references."
            value={newNote.content}
            onChange={e => setNewNote({ ...newNote, content: e.target.value })}
            rows={5}
            style={{ width: '100%', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', marginBottom: 12, fontFamily: 'inherit' }}
            id="new-note-content"
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mark as:</span>
            {importanceOptions.map(opt => (
              <span
                key={opt.value}
                className={`tag tag-${opt.value} ${newNote.importance === opt.value ? 'ring-2' : ''}`}
                style={{ cursor: 'pointer', opacity: newNote.importance === opt.value ? 1 : 0.6 }}
                onClick={() => setNewNote({ ...newNote, importance: opt.value === newNote.importance ? '' : opt.value })}
              >
                {opt.label}
              </span>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowNewNote(false)} disabled={saving}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveNote}
                id="btn-save-note"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="topbar-search" style={{ flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="notes-search-input"
          />
        </div>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13 }}
          id="notes-subject-filter"
        >
          <option value="all">All Subjects</option>
          {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
        </select>
        <select
          value={filterImportance}
          onChange={e => setFilterImportance(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13 }}
          id="notes-importance-filter"
        >
          <option value="all">All Tags</option>
          <option value="important">⚠ Important</option>
          <option value="very-important">🔴 Very Important</option>
          <option value="revision">🔁 Revision</option>
          <option value="completed">✅ Completed</option>
        </select>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {filtered.map(note => (
          <div key={note.id} className="note-card" onClick={() => onNavigate(`note-${note.id}`)} id={`note-card-${note.id}`}>
            <div className="note-card-top">
              <div className="note-title">{note.title}</div>
              <span className="note-subject-badge">{note.subjectName}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 2 }}>
              📂 {note.topic}
            </div>
            <div className="note-preview">{note.content}</div>

            {/* Highlights */}
            {note.highlights.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {note.highlights.slice(0, 2).map((h, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(240,180,41,0.1)', color: 'var(--gold)', borderRadius: 6, fontWeight: 500 }}>
                    ✨ {h}
                  </span>
                ))}
                {note.highlights.length > 2 && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{note.highlights.length - 2} more</span>
                )}
              </div>
            )}

            <div className="note-footer">
              <span className="note-date">Updated {note.updatedDate}</span>
              {note.importance && (
                <span className={`note-importance ${note.importance}`}>
                  {note.importance === 'important' ? '⚠ Important' :
                    note.importance === 'very-important' ? '🔴 Very Imp.' :
                      note.importance === 'revision' ? '🔁 Revision' : '✅ Completed'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>No notes found</div>
        </div>
      )}
    </div>
  );
}
