'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiBookOpen, FiStar, FiDownload } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import NoteCard from '@/components/NoteCard';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import TagInput from '@/components/TagInput';
import ProtectedRoute from '@/components/ProtectedRoute';
import { notesApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

function NotesContent() {
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', tags: [] });
  const [saving, setSaving] = useState(false);

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      if (showFavorites) params.favorites = 'true';
      
      const response = await notesApi.getAll(params);
      setNotes(response.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view your notes.');
      } else {
        setError('Failed to load notes. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchQuery, selectedTags, showFavorites]);

  // Sort notes
  const sortedNotes = useMemo(() => {
    const sorted = [...notes];
    // Pinned notes always first
    sorted.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
      case 'alphabetical':
        return sorted.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
          return a.title.localeCompare(b.title);
        });
      case 'favorites':
        return sorted.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        });
      default:
        return sorted;
    }
  }, [notes, sortBy]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach((note) => note.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Open modal for creating/editing
  const openModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({ title: note.title, content: note.content, tags: note.tags || [] });
    } else {
      setEditingNote(null);
      setFormData({ title: '', content: '', tags: [] });
    }
    setIsModalOpen(true);
  };

  // Save note
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      setSaving(true);
      if (editingNote) {
        await notesApi.update(editingNote._id, formData);
        addToast('Note updated successfully!', 'success');
      } else {
        await notesApi.create(formData);
        addToast('Note created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
      addToast('Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesApi.delete(id);
      addToast('Note deleted successfully!', 'success');
      fetchNotes();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete note', 'error');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      await notesApi.update(id, { isFavorite });
      addToast(isFavorite ? 'Added to favorites!' : 'Removed from favorites', 'info');
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Export notes
  const handleExport = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Notes exported successfully!', 'success');
  };

  // Word count for current form
  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = formData.content.length;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Notes</h1>
              <p className="text-gray-400 text-sm">{notes.length} notes</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="btn-secondary appearance-none cursor-pointer pr-8 text-sm"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="favorites">Favorites First</option>
            </select>

            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2"
              disabled={notes.length === 0}
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`btn-secondary flex items-center gap-2 ${showFavorites ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' : ''}`}
            >
              <FiStar className="w-4 h-4" />
              <span className="hidden sm:inline">Favorites</span>
            </button>
            <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes..."
            tags={allTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchNotes} className="btn-primary">
              Retry
            </button>
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="text-center py-20">
            <FiBookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notes found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedTags.length > 0
                ? 'Try adjusting your search or filters'
                : 'Create your first note to get started'}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <button onClick={() => openModal()} className="btn-primary">
                Create Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={openModal}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create Note'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Note title..."
              className="input-field"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Content</label>
              <span className="text-xs text-gray-500">{wordCount} words • {charCount} chars</span>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your note..."
              rows={5}
              className="input-field resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editingNote ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesContent />
    </ProtectedRoute>
  );
}
