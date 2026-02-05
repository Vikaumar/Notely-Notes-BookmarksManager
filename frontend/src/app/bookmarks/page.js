'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiBookmark, FiStar, FiDownload, FiExternalLink } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import BookmarkCard from '@/components/BookmarkCard';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import TagInput from '@/components/TagInput';
import ProtectedRoute from '@/components/ProtectedRoute';
import { bookmarksApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

function BookmarksContent() {
  const { addToast } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [formData, setFormData] = useState({ url: '', title: '', description: '', tags: [] });
  const [saving, setSaving] = useState(false);

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      if (showFavorites) params.favorites = 'true';
      
      const response = await bookmarksApi.getAll(params);
      setBookmarks(response.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view your bookmarks.');
      } else {
        setError('Failed to load bookmarks. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [searchQuery, selectedTags, showFavorites]);

  // Sort bookmarks
  const sortedBookmarks = useMemo(() => {
    const sorted = [...bookmarks];
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
  }, [bookmarks, sortBy]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    bookmarks.forEach((bookmark) => bookmark.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [bookmarks]);

  // Handle tag toggle
  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Open modal for creating/editing
  const openModal = (bookmark = null) => {
    if (bookmark) {
      setEditingBookmark(bookmark);
      setFormData({
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description || '',
        tags: bookmark.tags || []
      });
    } else {
      setEditingBookmark(null);
      setFormData({ url: '', title: '', description: '', tags: [] });
    }
    setIsModalOpen(true);
  };

  // Save bookmark
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.url.trim()) return;

    try {
      setSaving(true);
      if (editingBookmark) {
        await bookmarksApi.update(editingBookmark._id, formData);
        addToast('Bookmark updated successfully!', 'success');
      } else {
        await bookmarksApi.create(formData);
        addToast('Bookmark saved successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchBookmarks();
    } catch (err) {
      console.error(err);
      addToast('Failed to save bookmark', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete bookmark
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      await bookmarksApi.delete(id);
      addToast('Bookmark deleted successfully!', 'success');
      fetchBookmarks();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete bookmark', 'error');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      await bookmarksApi.update(id, { isFavorite });
      addToast(isFavorite ? 'Added to favorites!' : 'Removed from favorites', 'info');
      fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  // Export bookmarks
  const handleExport = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Bookmarks exported successfully!', 'success');
  };

  // Export as HTML bookmarks file
  const handleExportHTML = () => {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;
    bookmarks.forEach(bookmark => {
      const date = Math.floor(new Date(bookmark.createdAt).getTime() / 1000);
      html += `    <DT><A HREF="${bookmark.url}" ADD_DATE="${date}">${bookmark.title}</A>\n`;
      if (bookmark.description) {
        html += `    <DD>${bookmark.description}\n`;
      }
    });
    html += `</DL><p>`;
    
    const dataBlob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Bookmarks exported as HTML!', 'success');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <FiBookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Bookmarks</h1>
              <p className="text-gray-400 text-sm">{bookmarks.length} bookmarks</p>
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
              disabled={bookmarks.length === 0}
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              onClick={handleExportHTML}
              className="btn-secondary flex items-center gap-2"
              disabled={bookmarks.length === 0}
            >
              <FiExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">HTML</span>
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
              <span>New Bookmark</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search bookmarks..."
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
            <button onClick={fetchBookmarks} className="btn-primary">
              Retry
            </button>
          </div>
        ) : sortedBookmarks.length === 0 ? (
          <div className="text-center py-20">
            <FiBookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookmarks found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedTags.length > 0
                ? 'Try adjusting your search or filters'
                : 'Save your first bookmark to get started'}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <button onClick={() => openModal()} className="btn-primary">
                Add Bookmark
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark._id}
                bookmark={bookmark}
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
        title={editingBookmark ? 'Edit Bookmark' : 'Add Bookmark'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-gray-500">(auto-fetched if empty)</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Leave empty to auto-fetch..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={3}
              className="input-field resize-none"
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
              {saving ? 'Saving...' : editingBookmark ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}
