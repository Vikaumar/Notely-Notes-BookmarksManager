'use client';

import Link from 'next/link';
import { FiBookOpen, FiBookmark, FiArrowRight, FiStar, FiSearch, FiTag } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-primary-500/30">
            <FiBookOpen className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
            <FiStar className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4">
          <span className="gradient-text">Notes & Bookmarks</span>
        </h1>
        <p className="text-xl text-gray-400 text-center mb-12 max-w-lg">
          Your personal space to save, organize, and discover your ideas and favorite links.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full mb-12">
          {/* Notes Card */}
          <Link href="/notes" className="group">
            <div className="glass rounded-2xl p-6 card-hover h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Notes</h2>
              <p className="text-gray-400 mb-4">
                Capture your thoughts, ideas, and important information in one place.
              </p>
              <div className="flex gap-2">
                <span className="tag">
                  <FiTag className="w-3 h-3 mr-1" /> Tags
                </span>
                <span className="tag">
                  <FiSearch className="w-3 h-3 mr-1" /> Search
                </span>
              </div>
            </div>
          </Link>

          {/* Bookmarks Card */}
          <Link href="/bookmarks" className="group">
            <div className="glass rounded-2xl p-6 card-hover h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <FiBookmark className="w-7 h-7 text-white" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Bookmarks</h2>
              <p className="text-gray-400 mb-4">
                Save and organize your favorite websites with auto-fetched titles.
              </p>
              <div className="flex gap-2">
                <span className="tag">
                  <FiTag className="w-3 h-3 mr-1" /> Tags
                </span>
                <span className="tag">
                  <FiStar className="w-3 h-3 mr-1" /> Favorites
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-400">∞</div>
            <div className="text-sm text-gray-500">Notes</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <div className="text-3xl font-bold text-purple-400">∞</div>
            <div className="text-sm text-gray-500">Bookmarks</div>
          </div>
          <div className="w-px bg-white/10"></div>
          <div>
            <div className="text-3xl font-bold text-pink-400">∞</div>
            <div className="text-sm text-gray-500">Tags</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-white/5">
        <p>Personal Notes & Bookmark Manager • Built with Next.js & Tailwind</p>
      </footer>
    </div>
  );
}
