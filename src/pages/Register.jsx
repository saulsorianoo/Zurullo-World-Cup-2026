import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Register() {
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password !== confirm) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    if (username.length < 3) {
      setLocalError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    try {
      await register(email, password, username);
      navigate('/');
    } catch {}
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 
                          flex items-center justify-center text-5xl shadow-glow-gold mb-4">
            ⚽
          </div>
          <h1 className="font-display text-3xl tracking-wider text-white">ZURULLO</h1>
          <p className="text-yellow-400 font-semibold tracking-widest text-sm">WORLD CUP 2026</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 animate-slide-in">
          <h2 className="text-xl font-bold text-white mb-2">Crear Cuenta</h2>
          <p className="text-white/50 text-sm mb-6">
            Únete a la porra y compite por el bote 🏆
          </p>

          {displayError && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 
                            rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Nombre en la porra
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: Zurullo10"
                required
                minLength={3}
                className="input-field w-full"
              />
              <p className="text-white/30 text-xs mt-1">
                Este nombre aparecerá en la tabla de pronósticos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="input-field w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Confirmar Contraseña
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                required
                className={`input-field w-full ${confirm && confirm !== password ? 'border-red-500/50' : ''}`}
              />
            </div>

            {/* Entry fee notice */}
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3 text-sm">
              <div className="text-yellow-400 font-semibold mb-1">💰 Cuota de entrada: 10€</div>
              <div className="text-white/50">
                Coordina el pago con el organizador. Tu cuenta se registra ahora, el pago se confirma después.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Crear Cuenta y Unirme
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-white/50 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
