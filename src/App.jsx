import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LeaderboardPage from './pages/LeaderboardPage';
import BracketPage from './pages/BracketPage';
import BonusPage from './pages/BonusPage';
import RoulettePage from './pages/RoulettePage';
import PrizesPage from './pages/PrizesPage';
import Admin from './pages/Admin';
import useAuthStore from './store/authStore';
import useDataStore from './store/dataStore';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-2 border-yellow-400/30 border-t-yellow-400 
                        rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { initAuth, loading: authLoading, user } = useAuthStore();
  const { initData, loading: dataLoading, resetInitialized } = useDataStore();

  useEffect(() => {
    const unsubscribeAuth = initAuth();
    return () => unsubscribeAuth?.();
  }, []);

  useEffect(() => {
    // Si auth ha terminado de cargar, inicializamos datos.
    // Si el usuario cambia (ej. inicia sesión), reiniciamos la conexión para 
    // asegurar que las reglas de seguridad de Firebase nos den acceso.
    if (!authLoading) {
      if (resetInitialized) resetInitialized();
      const unsubscribeData = initData();
      return () => {
        if (unsubscribeData) unsubscribeData();
      };
    }
  }, [authLoading, user]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Mostly public (but some features require auth) */}
            <Route path="/"           element={<Home />} />
            <Route path="/bracket"    element={<BracketPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/roulette"   element={<RoulettePage />} />
            <Route path="/prizes"     element={<PrizesPage />} />

            {/* Requires auth */}
            <Route path="/bonus" element={
              <ProtectedRoute><BonusPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><Admin /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-white/30 text-sm">
            <div className="font-display text-lg text-white/20 mb-1">ZURULLO WORLD CUP 2026</div>
            <p>Hecho con ❤️ para los amigos</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
