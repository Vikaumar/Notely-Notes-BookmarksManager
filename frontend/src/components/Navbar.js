'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBookOpen, FiBookmark, FiHome, FiSun, FiMoon, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/notes', label: 'Notes', icon: FiBookOpen },
    { href: '/bookmarks', label: 'Bookmarks', icon: FiBookmark },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
              <path d="M10 12h12M10 16h8M10 20h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-semibold text-lg">Notely</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative ml-1" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <FiChevronDown size={14} className={`text-zinc-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg py-1 shadow-xl">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <FiLogOut size={14} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="ml-2 px-3 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
