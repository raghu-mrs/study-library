// Types for the UPSC Study Library

export interface Subject {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  subjectId: string;
  subjectName: string;
  fileSize: string;
  totalPages: number;
  currentPage: number;
  coverEmoji: string;
  coverBg: string;
  addedDate: string;
  lastOpened?: string;
  importance?: 'important' | 'very-important' | 'revision' | 'completed';
  tags: string[];
}

export interface Note {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  content: string;
  importance?: 'important' | 'very-important' | 'revision' | 'completed';
  createdDate: string;
  updatedDate: string;
  linkedBookId?: string;
  linkedPage?: number;
  highlights: string[];
  references: string[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  note: string;
  createdDate: string;
}

// ---- Subject Definitions (structure only, no fake counts) ----

export const SUBJECTS: Subject[] = [
  { id: 'polity',        name: 'Polity',               emoji: '⚖️', color: '#2e9e5b', bgColor: 'rgba(46,158,91,0.10)' },
  { id: 'history',       name: 'History',              emoji: '🏛️', color: '#d4860a', bgColor: 'rgba(212,134,10,0.10)' },
  { id: 'geography',     name: 'Geography',            emoji: '🌍', color: '#1a8fa8', bgColor: 'rgba(26,143,168,0.10)' },
  { id: 'economy',       name: 'Economy',              emoji: '📈', color: '#7c56c9', bgColor: 'rgba(124,86,201,0.10)' },
  { id: 'environment',   name: 'Environment',          emoji: '🌿', color: '#2e9e5b', bgColor: 'rgba(46,158,91,0.10)' },
  { id: 'science',       name: 'Science & Technology', emoji: '🔬', color: '#1a8fa8', bgColor: 'rgba(26,143,168,0.10)' },
  { id: 'ethics',        name: 'Ethics',               emoji: '🧭', color: '#d64343', bgColor: 'rgba(214,67,67,0.10)' },
  { id: 'current-affairs', name: 'Current Affairs',   emoji: '📰', color: '#d97a1a', bgColor: 'rgba(217,122,26,0.10)' },
  { id: 'ir',            name: 'Intl. Relations',      emoji: '🌐', color: '#2e9e5b', bgColor: 'rgba(46,158,91,0.10)' },
  { id: 'society',       name: 'Society',              emoji: '👥', color: '#d4860a', bgColor: 'rgba(212,134,10,0.10)' },
  { id: 'governance',    name: 'Governance',           emoji: '🏛',  color: '#7c56c9', bgColor: 'rgba(124,86,201,0.10)' },
  { id: 'essay',         name: 'Essay',                emoji: '✍️', color: '#2e9e5b', bgColor: 'rgba(46,158,91,0.10)' },
  { id: 'csat',          name: 'CSAT',                 emoji: '🧮', color: '#1a8fa8', bgColor: 'rgba(26,143,168,0.10)' },
  { id: 'kannada',       name: 'Kannada Literature',   emoji: '📜', color: '#d64343', bgColor: 'rgba(214,67,67,0.10)' },
  { id: 'other',         name: 'Other Subjects',       emoji: '📚', color: '#d97a1a', bgColor: 'rgba(217,122,26,0.10)' },
];

// ---- All empty — will be populated when user adds real data ----
export const BOOKS: Book[] = [];
export const NOTES: Note[] = [];
export const BOOKMARKS: Bookmark[] = [];
