import React, { useState } from 'react';
import { Mail, Lock, Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // ou new URLSearchParams(window.location.search)

const [referralCode, setReferralCode] = useState('');
const [searchParams] = useSearchParams();

useEffect(() => {
  const ref = searchParams.get('ref');
  if (ref) setReferralCode(ref);
}, []);

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, referralCode || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">🍎</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Apple Allocations</h1>
          <p className="text-gray-400">Gestion d'investissements intelligente</p>
        </div>

        <Card>
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                isLogin
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                !isLogin
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              placeholder="votre@email.com"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <Input
                type="text"
                label="Code de parrainage (optionnel)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                icon={Users}
                placeholder="CODE123"
              />
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
            >
              {isLogin ? 'Se connecter' : 'S\'inscrire'}
            </Button>
          </form>

          {!isLogin && (
            <div className="mt-6 p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg">
              <div className="flex items-center text-primary-400 mb-2">
                <span className="text-lg mr-2">🎁</span>
                <span className="font-semibold">Bonus d'inscription</span>
              </div>
              <p className="text-sm text-gray-300">
                Recevez automatiquement <span className="font-bold text-accent-500">1000 XAF</span> lors de votre inscription !
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;