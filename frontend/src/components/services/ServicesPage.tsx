import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  BookOpen,
  HeartPulse,
  Leaf,
  Shield,
  Zap,
  TrendingUp,
  Building2,
  Wrench,
  Lightbulb,
  Database,
  Search,
} from 'lucide-react';
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

  const services: Service[] = [
  {
    id: 's1',
    name: 'Smart Farm',
    description: 'Investissez dans l’agriculture intelligente durable.',
    image: 'https://placehold.co/400x200?text=Smart+Farm',
    price: 100,
    dailyReturn: 120,
    category: 'agriculture',
    duration: 30,
  },
  {
    id: 's2',
    name: 'Green Solar',
    description: 'Projet de panneaux solaires pour zones rurales.',
    image: 'https://placehold.co/400x200?text=Green+Solar',
    price: 15000,
    dailyReturn: 165,
    category: 'énergie',
    duration: 30,
  },
  {
    id: 's3',
    name: 'Edubox',
    description: 'Plateforme d’apprentissage numérique pour lycéens.',
    image: 'https://placehold.co/400x200?text=Edubox',
    price: 25000,
    dailyReturn: 275,
    category: 'éducation',
    duration: 30,
  },
  {
    id: 's4',
    name: 'Wellness Hub',
    description: 'Développement d’un centre de bien-être naturel.',
    image: 'https://placehold.co/400x200?text=Wellness+Hub',
    price: 30000,
    dailyReturn: 360,
    category: 'santé',
    duration: 30,
  },
  {
    id: 's5',
    name: 'TechStart Africa',
    description: 'Soutenez une startup tech africaine émergente.',
    image: 'https://placehold.co/400x200?text=TechStart+Africa',
    price: 50000,
    dailyReturn: 750,
    category: 'technologie',
    duration: 30,
  },
  {
    id: 's6',
    name: 'LogiFresh',
    description: 'Fonds de logistique pour produits frais locaux.',
    image: 'https://placehold.co/400x200?text=LogiFresh',
    price: 20000,
    dailyReturn: 260,
    category: 'services',
    duration: 30,
  },
  {
    id: 's7',
    name: 'Village Wifi',
    description: 'Connexion internet dans les zones reculées.',
    image: 'https://placehold.co/400x200?text=Village+Wifi',
    price: 8000,
    dailyReturn: 84,
    category: 'technologie',
    duration: 28,
  },
  {
    id: 's8',
    name: 'HydroMini',
    description: 'Mini barrage hydro pour production d’énergie.',
    image: 'https://placehold.co/400x200?text=HydroMini',
    price: 75000,
    dailyReturn: 900,
    category: 'énergie',
    duration: 30,
  },
  {
    id: 's9',
    name: 'AgriDrone',
    description: 'Surveillance agricole automatisée par drone.',
    image: 'https://placehold.co/400x200?text=AgriDrone',
    price: 35000,
    dailyReturn: 410,
    category: 'agriculture',
    duration: 30,
  },
  {
    id: 's10',
    name: 'E-Medicine',
    description: 'Plateforme de téléconsultation médicale.',
    image: 'https://via.placeholder.com/400x200.png?text=E-Medicine',
    price: 5000,
    dailyReturn: 50,
    category: 'santé',
    duration: 20,
  },
  {
    id: 's11',
    name: 'EcoMaison',
    description: 'Construction de logements écologiques.',
    image: 'https://placehold.co/400x200?text=EcoMaison',
    price: 100000,
    dailyReturn: 1300,
    category: 'immobilier',
    duration: 30,
  },
  {
    id: 's12',
    name: 'Youth Skills Lab',
    description: 'Formation pratique pour jeunes entrepreneurs.',
    image: 'https://placehold.co/400x200?text=Skills+Lab',
    price: 2000,
    dailyReturn: 20,
    category: 'éducation',
    duration: 14,
  },
  {
    id: 's13',
    name: 'RecyTech',
    description: 'Startup de recyclage technologique durable.',
    image: 'https://placehold.co/400x200?text=RecyTech',
    price: 42000,
    dailyReturn: 560,
    category: 'technologie',
    duration: 30,
  },
  {
    id: 's14',
    name: 'AquaBoost',
    description: 'Pompage solaire pour irrigation agricole.',
    image: 'https://placehold.co/400x200?text=AquaBoost',
    price: 60000,
    dailyReturn: 800,
    category: 'agriculture',
    duration: 30,
  },
  {
    id: 's15',
    name: 'Smart Clinic',
    description: 'Centre médical connecté en zone semi-urbaine.',
    image: 'https://placehold.co/400x200?text=Smart+Clinic',
    price: 18000,
    dailyReturn: 220,
    category: 'santé',
    duration: 30,
  },
  {
    id: 's16',
    name: 'Urban Food Lab',
    description: 'Fermes urbaines pour alimentation bio.',
    image: 'https://placehold.co/400x200?text=Food+Lab',
    price: 22000,
    dailyReturn: 264,
    category: 'agriculture',
    duration: 30,
  },
  {
    id: 's17',
    name: 'Taxi Pro',
    description: 'Soutenez une flotte de taxis éco-responsables.',
    image: 'https://placehold.co/400x200?text=Taxi+Pro',
    price: 48000,
    dailyReturn: 624,
    category: 'services',
    duration: 30,
  },
  {
    id: 's18',
    name: 'Crypto SafeBox',
    description: 'Sécurité des actifs numériques pour PME.',
    image: 'https://placehold.co/400x200?text=Crypto+SafeBox',
    price: 54000,
    dailyReturn: 680,
    category: 'technologie',
    duration: 30,
  },
  {
    id: 's19',
    name: 'Clean Water Pro',
    description: 'Filtration et distribution d’eau potable.',
    image: 'https://placehold.co/400x200?text=Clean+Water',
    price: 16000,
    dailyReturn: 190,
    category: 'services',
    duration: 30,
  },
  {
    id: 's20',
    name: 'Startup Booster',
    description: 'Micro-investissement dans jeunes startups locales.',
    image: 'https://placehold.co/400x200?text=Startup+Booster',
    price: 7000,
    dailyReturn: 84,
    category: 'technologie',
    duration: 28,
  },
  {
    id: 's21',
    name: 'AgroVillage',
    description: 'Fermes communautaires avec rendement partagé.',
    image: 'https://placehold.co/400x200?text=AgroVillage',
    price: 39000,
    dailyReturn: 450,
    category: 'agriculture',
    duration: 30,
  },
  {
    id: 's22',
    name: 'Smart Board',
    description: 'Tableaux intelligents pour écoles rurales.',
    image: 'https://placehold.co/400x200?text=Smart+Board',
    price: 34000,
    dailyReturn: 420,
    category: 'éducation',
    duration: 30,
  },
  {
    id: 's23',
    name: 'SafeKids',
    description: 'Bracelets connectés pour la sécurité scolaire.',
    image: 'https://placehold.co/400x200?text=SafeKids',
    price: 12000,
    dailyReturn: 144,
    category: 'technologie',
    duration: 30,
  },
  {
    id: 's24',
    name: 'Local Market Hub',
    description: 'Digitalisation des marchés traditionnels.',
    image: 'https://placehold.co/400x200?text=Market+Hub',
    price: 26000,
    dailyReturn: 330,
    category: 'services',
    duration: 30,
  },
  {
    id: 's25',
    name: 'eHealth Africa',
    description: 'Système d’alerte santé dans les villages.',
    image: 'https://placehold.co/400x200?text=eHealth',
    price: 47000,
    dailyReturn: 610,
    category: 'santé',
    duration: 30,
  },
];        

  const categories = [
  { id: 'all', name: 'Tous', icon: Globe },
  { id: 'agriculture', name: 'Agriculture', icon: Leaf },
  { id: 'énergie', name: 'Énergie', icon: Zap },
  { id: 'éducation', name: 'Éducation', icon: BookOpen },
  { id: 'santé', name: 'Santé', icon: HeartPulse },
  { id: 'technologie', name: 'Technologie', icon: Lightbulb },
  { id: 'services', name: 'Services', icon: Wrench },
  { id: 'immobilier', name: 'Immobilier', icon: Building2 },
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
      await updateDoc(doc(db, 'users', user.uid), { balance: newBalance });
      setUser({ ...user, balance: newBalance });

      await addDoc(collection(db, 'allocations'), {
        userId: user.uid,
        serviceId: service.id,
        serviceName: service.name,
        investedAmount: service.price,
        dailyReturn: service.dailyReturn,
        createdAt: serverTimestamp(),
      });

      setMessage(`✅ Vous avez investi dans "${service.name}"`);
    } catch (err: unknown) {
      console.error(err);
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

        {filteredServices.length > 0 && (
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

