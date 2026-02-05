'use client';

import { FiEdit2, FiTrash2, FiStar, FiClock } from 'react-icons/fi';

export default function NoteCard({ note, onEdit, onDelete, onToggleFavorite }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="glass rounded-2xl p-5 card-hover animate-fade-in group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg line-clamp-1 flex-1 pr-4">{note.title}</h3>
        <button
          onClick={() => onToggleFavorite(note._id, !note.isFavorite)}
          className={`p-2 rounded-lg transition-all ${
            note.isFavorite
              ? 'text-yellow-400 bg-yellow-400/20'
              : 'text-gray-500 hover:text-yellow-400 hover:bg-white/5'
          }`}
        >
          <FiStar className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-400 text-sm line-clamp-3 mb-4">{note.content}</p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.map((tag) => (
            <span key={tag} className="tag text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FiClock className="w-3.5 h-3.5" />
          {formatDate(note.createdAt)}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-2 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-white/5 transition-all"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
