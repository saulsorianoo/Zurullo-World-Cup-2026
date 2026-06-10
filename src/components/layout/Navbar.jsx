import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Trophy, Home, Star, Shuffle, Gift, Settings, 
  LogOut, User, Menu, X, ChevronDown
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/',            label: 'Partidos',      icon: Home },
  { to: '/leaderboard', label: 'Clasificación',  icon: Trophy },
  { to: '/bonus',       label: 'Bonus',          icon: Star },
  { to: '/roulette',    label: 'Ruleta',         icon: Shuffle },
  { to: '/prizes',      label: 'Premios',        icon: Gift },
];

export default function Navbar() {
  const { user, profile, logout, isAdmin } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 
                            flex items-center justify-center text-xl shadow-glow-gold
                            group-hover:scale-110 transition-transform duration-200">
              ⚽
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xl tracking-wider text-white leading-none">
                ZURULLO
              </div>
              <div className="text-xs text-yellow-400 font-semibold tracking-widest leading-none">
                WORLD CUP 2026
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link text-sm ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {isAdmin() && (
              <Link
                to="/admin"
                className={`nav-link text-sm ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                <Settings size={16} />
                Admin
              </Link>
            )}
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl 
                             bg-white/5 hover:bg-white/10 border border-white/10 
                             transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 
                                  flex items-center justify-center text-dark-900 font-bold text-sm">
                    {(profile?.username || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white/80 max-w-24 truncate">
                    {profile?.username || user.email}
                  </span>
                  <ChevronDown size={14} className="text-white/50" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card shadow-card-hover 
                                  animate-slide-in z-50">
                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/80
                                   hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <User size={15} />
                        Mi Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                                   text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white/70"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-dark-800/95 backdrop-blur-sm animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`nav-link text-sm w-full ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {isAdmin() && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="nav-link text-sm w-full"
              >
                <Settings size={16} />
                Panel Admin
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
}
