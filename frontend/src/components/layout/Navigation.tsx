// src/components/layout/Navigation.tsx
import React from 'react';
import {
  Home,
  Plus,
  Gift,
  Users,
  History,
  LogOut
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/deposit', label: 'Dépôt', icon: Plus },
    { path: '/services', label: 'Services', icon: Gift },
    { path: '/referral', label: 'Équipe', icon: Users },
    { path: '/history', label: 'Historique', icon: History },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}

          <button
            onClick={logout}
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span className="text-xs">Sortir</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
