'use client';

import { FiEdit2, FiTrash2, FiStar, FiExternalLink, FiClock } from 'react-icons/fi';

export default function BookmarkCard({ bookmark, onEdit, onDelete, onToggleFavorite }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDomain = (url) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="glass rounded-2xl p-5 card-hover animate-fade-in group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-lg line-clamp-1">{bookmark.title}</h3>
          <a
            href={bookmark.url.startsWith('http') ? bookmark.url : `https://${bookmark.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1"
          >
            {getDomain(bookmark.url)}
            <FiExternalLink className="w-3 h-3" />
          </a>
        </div>
        <button
          onClick={() => onToggleFavorite(bookmark._id, !bookmark.isFavorite)}
          className={`p-2 rounded-lg transition-all ${
            bookmark.isFavorite
              ? 'text-yellow-400 bg-yellow-400/20'
              : 'text-gray-500 hover:text-yellow-400 hover:bg-white/5'
          }`}
        >
          <FiStar className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Description */}
      {bookmark.description && (
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{bookmark.description}</p>
      )}

      {/* Tags */}
      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {bookmark.tags.map((tag) => (
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
          {formatDate(bookmark.createdAt)}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(bookmark)}
            className="p-2 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-white/5 transition-all"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(bookmark._id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
