'use client';

import React, { useState, useEffect } from 'react';
import { SUBJECTS } from '@/lib/data';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
  { id: 'subjects', label: 'All Subjects', emoji: '📚' },
  { id: 'books', label: 'My Library', emoji: '📖' },
  { id: 'notes', label: 'Notes', emoji: '📝' },
  { id: 'revision', label: 'Revision', emoji: '🔁' },
  { id: 'bookmarks', label: 'Bookmarks', emoji: '🔖' },
  { id: 'highlights', label: 'Highlights', emoji: '✨' },
  { id: 'search', label: 'Search', emoji: '🔍' },
];

const TOP_SUBJECTS = SUBJECTS.slice(0, 6);

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandSubjects, setExpandSubjects] = useState(false);

  // Expose open/close to parent via custom event
  useEffect(() => {
    const handler = (e: CustomEvent) => setIsOpen(e.detail.open);
    window.addEventListener('toggleSidebar' as any, handler);
    return () => window.removeEventListener('toggleSidebar' as any, handler);
  }, []);

  const handleNav = (id: string) => {
    onNavigate(id);
    if (window.innerWidth < 900) setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <nav className={`sidebar ${isOpen ? 'open' : ''}`} id="app-sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📚</div>
          <div>
            <div className="sidebar-logo-text">UPSC Library</div>
            <div className="sidebar-logo-sub">Study Smart. Succeed.</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {/* Main Nav */}
          <div className="sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
              id={`nav-${item.id}`}
            >
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              {item.label}
              {item.id === 'revision' && (
                <span className="sidebar-badge">12</span>
              )}
            </button>
          ))}

          <div style={{ height: 12 }} />

          {/* Subjects quick-nav */}
          <div className="sidebar-section-label">Subjects</div>
          {(expandSubjects ? SUBJECTS : TOP_SUBJECTS).map(subject => (
            <button
              key={subject.id}
              className={`sidebar-link ${currentPage === `subject-${subject.id}` ? 'active' : ''}`}
              onClick={() => handleNav(`subject-${subject.id}`)}
              id={`nav-subject-${subject.id}`}
            >
              <span style={{ fontSize: 15 }}>{subject.emoji}</span>
              {subject.name}
            </button>
          ))}
          <button
            className="sidebar-link"
            onClick={() => setExpandSubjects(!expandSubjects)}
            style={{ color: 'var(--accent)', fontSize: 12 }}
          >
            <span style={{ fontSize: 14 }}>{expandSubjects ? '▲' : '▼'}</span>
            {expandSubjects ? 'Show less' : `+${SUBJECTS.length - 6} more subjects`}
          </button>
        </div>

        {/* Bottom info */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <div>🔥 24-day streak</div>
            <div>⏱ 312 hours studied</div>
          </div>
        </div>
      </nav>
    </>
  );
}

// Export toggle function for topbar use
export function toggleSidebar(open: boolean) {
  window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { open } }));
}
