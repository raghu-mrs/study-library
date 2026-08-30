'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Book, Note, Bookmark } from '@/lib/data';

interface DataContextType {
  books: Book[];
  notes: Note[];
  bookmarks: Bookmark[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  books: [],
  notes: [],
  bookmarks: [],
  loading: true,
  refreshData: async () => {},
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [booksRes, notesRes, bookmarksRes] = await Promise.all([
        supabase.from('books').select('*').order('added_date', { ascending: false }),
        supabase.from('notes').select('*').order('updated_date', { ascending: false }),
        supabase.from('bookmarks').select('*').order('created_date', { ascending: false }),
      ]);

      if (booksRes.data) {
        // Map database columns to our frontend model
        const mappedBooks: Book[] = booksRes.data.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author || '',
          subjectId: b.subject_id,
          subjectName: b.subject_name,
          fileSize: b.file_size || '',
          totalPages: b.total_pages || 0,
          currentPage: b.current_page || 1,
          coverEmoji: b.cover_emoji,
          coverBg: b.cover_bg,
          addedDate: b.added_date ? new Date(b.added_date).toISOString().split('T')[0] : '',
          lastOpened: b.last_opened ? new Date(b.last_opened).toISOString().split('T')[0] : '',
          importance: b.importance as any,
          tags: b.tags || [],
          // extra fields for pdf
          pdfUrl: b.pdf_url,
          storagePath: b.storage_path
        }));
        setBooks(mappedBooks);
      }

      if (notesRes.data) {
        const mappedNotes: Note[] = notesRes.data.map(n => ({
          id: n.id,
          title: n.title,
          subjectId: n.subject_id,
          subjectName: n.subject_name,
          topic: n.topic || '',
          content: n.content,
          importance: n.importance as any,
          createdDate: n.created_date ? new Date(n.created_date).toISOString().split('T')[0] : '',
          updatedDate: n.updated_date ? new Date(n.updated_date).toISOString().split('T')[0] : '',
          linkedBookId: n.linked_book_id,
          linkedPage: n.linked_page,
          highlights: n.highlights || [],
          references: n.references_arr || []
        }));
        setNotes(mappedNotes);
      }

      if (bookmarksRes.data) {
        const mappedBookmarks: Bookmark[] = bookmarksRes.data.map(bm => ({
          id: bm.id,
          bookId: bm.book_id,
          bookTitle: bm.book_title,
          pageNumber: bm.page_number,
          note: bm.note || '',
          createdDate: bm.created_date ? new Date(bm.created_date).toISOString().split('T')[0] : ''
        }));
        setBookmarks(mappedBookmarks);
      }
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{ books, notes, bookmarks, loading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
