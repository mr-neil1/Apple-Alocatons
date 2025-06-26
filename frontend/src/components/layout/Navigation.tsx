import React from 'react';
import { 
  Home, 
  Plus, 
  Gift, 
  Users, 
  History, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'deposit', label: 'Dépôt', icon: Plus },
    { id: 'services', label: 'Services', icon: Gift },
    { id: 'referral', label: 'Équipe', icon: Users },
    { id: 'history', label: 'Historique', icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                currentPage === item.id
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