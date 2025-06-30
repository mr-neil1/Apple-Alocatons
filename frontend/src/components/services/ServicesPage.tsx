import React, { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, Shield, Zap, Globe } from 'lucide-react';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ServiceCard from './ServiceCard';
import { Service } from '../../types';

const ServicesPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loadingId, setLoadingId] = useState('');
  const [message, setMessage] = useState('');

  const services: Service[] = [const services: Service[] = [
  {
    id: '1',
    name: 'Crypto Pack',
    description: 'Générez des revenus avec le staking crypto',
    image: 'https://via.placeholder.com/400x200.png?text=Crypto+Pack',
    price: 10000,
    dailyReturn: 500,
    category: 'crypto',
  },
  {
    id: '2',
    name: 'Forex Bot',
    description: 'Investissez dans le trading Forex automatique',
    image: 'https://via.placeholder.com/400x200.png?text=Forex+Bot',
    price: 20000,
    dailyReturn: 1200,
    category: 'forex',
  },
  {
    id: '3',
    name: 'Trading Boost',
    description: 'Profitez de l’analyse technique pour gagner plus',
    image: 'https://via.placeholder.com/400x200.png?text=Trading+Boost',
    price: 15000,
    dailyReturn: 800,
    category: 'trading',
  },
];
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

  const handleAllocation = async (service: Service) => {
    if (!user) return;
    if (user.balance < service.price) {
      setMessage("❌ Solde insuffisant.");
      return;
    }

    setLoadingId(service.id);
    setMessage('');

    const newBalance = user.balance - service.price;

    try {
      await updateDoc(doc(db, 'users', user.id), { balance: newBalance });
      setUser({ ...user, balance: newBalance });

      await addDoc(collection(db, 'allocations'), {
        userId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        investedAmount: service.price,
        dailyReturn: service.dailyReturn,
        createdAt: serverTimestamp(),
      });

      setMessage(`✅ Vous avez investi dans "${service.name}"`);
    } catch (err) {
      setMessage("❌ Une erreur est survenue.");
    } finally {
      setLoadingId('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/')}
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

        {/* Search + Filters */}
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
              onAllocate={() => handleAllocation(service)}
              loading={loadingId === service.id}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Aucun service trouvé.
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="mt-6 text-center text-yellow-400 font-medium">
            {message}
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

