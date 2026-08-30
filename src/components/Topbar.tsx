'use client';

import React, { useState } from 'react';
import { toggleSidebar } from './Sidebar';

interface TopbarProps {
  title: string;
  onSearch?: (query: string) => void;
  onNavigate: (page: string) => void;
}

export default function Topbar({ title, onSearch, onNavigate }: TopbarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    toggleSidebar(next);
  };

  return (
    <header className="topbar">
      <button
        className="topbar-menu-btn"
        onClick={handleMenuToggle}
        aria-label="Toggle menu"
        id="topbar-menu-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search books, notes..."
          id="global-search-input"
          onChange={(e) => {
            if (onSearch) onSearch(e.target.value);
            if (e.target.value.trim().length > 0) onNavigate('search');
          }}
        />
      </div>

      <button
        className="btn btn-primary"
        style={{ padding: '7px 14px', fontSize: 12 }}
        onClick={() => onNavigate('upload')}
        id="topbar-upload-btn"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload PDF
      </button>
    </header>
  );
}
