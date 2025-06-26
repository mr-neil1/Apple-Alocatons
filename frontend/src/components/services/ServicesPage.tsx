import React, { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, Shield, Zap, Globe } from 'lucide-react';
import { Service } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ServiceCard from './ServiceCard';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock services data
  const services: Service[] = [
    {
      id: '1',
      name: 'Trading Bot Pro',
      description: 'Bot de trading automatisé avec IA avancée',
      image: 'https://images.pexels.com/photos/7567486/pexels-photo-7567486.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 2500,
      dailyReturn: 125,
      category: 'trading'
    },
    {
      id: '2',
      name: 'Cloud Mining',
      description: 'Minage de cryptomonnaies dans le cloud',
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 5000,
      dailyReturn: 200,
      category: 'crypto'
    },
    {
      id: '3',
      name: 'Forex Premium',
      description: 'Signaux forex avec 95% de précision',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 3500,
      dailyReturn: 175,
      category: 'forex'
    },
    {
      id: '4',
      name: 'E-commerce Affiliate',
      description: 'Réseau d\'affiliation e-commerce automatisé',
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 1500,
      dailyReturn: 80,
      category: 'affiliate'
    },
    {
      id: '5',
      name: 'Real Estate Fund',
      description: 'Investissement immobilier fractionné',
      image: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 10000,
      dailyReturn: 400,
      category: 'realestate'
    },
    {
      id: '6',
      name: 'Tech Startup Fund',
      description: 'Portefeuille de startups technologiques',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 7500,
      dailyReturn: 300,
      category: 'startup'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous', icon: Globe },
    { id: 'trading', name: 'Trading', icon: TrendingUp },
    { id: 'crypto', name: 'Crypto', icon: Zap },
    { id: 'forex', name: 'Forex', icon: Shield },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={() => onNavigate('dashboard')}
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            className="mr-4"
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Services d'Allocation</h1>
            <p className="text-gray-400">Choisissez vos investissements</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <Input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onAllocate={() => {
                // Handle allocation
                alert(`Allocation de ${service.name} en cours...`);
              }}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Aucun service trouvé</div>
            <div className="text-gray-500">Essayez de modifier vos critères de recherche</div>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-primary-900/20 border-primary-500/30">
          <div className="flex items-start">
            <div className="text-primary-400 mr-3 mt-1">💡</div>
            <div>
              <div className="text-primary-400 font-medium mb-2">Comment ça marche ?</div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>1. Sélectionnez un service qui vous intéresse</p>
                <p>2. Le montant sera déduit de votre solde</p>
                <p>3. Recevez des revenus quotidiens automatiquement</p>
                <p>4. Suivez vos gains dans "Mes Allocations"</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServicesPage;