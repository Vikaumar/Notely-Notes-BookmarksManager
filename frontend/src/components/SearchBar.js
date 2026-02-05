'use client';

import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search notes...',
  tags = [],
  selectedTags = [],
  onTagToggle
}) {
  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-11 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-800 transition-colors"
          >
            <FiX className="w-4 h-4 text-zinc-500" />
          </button>
        )}
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
