import React from 'react';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Service } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ServiceCardProps {
  service: Service;
  onAllocate: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onAllocate }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} XAF`;
  };

  const calculateROI = () => {
    return ((service.dailyReturn * 30) / service.price * 100).toFixed(1);
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {calculateROI()}% ROI/mois
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
          <p className="text-gray-400 text-sm">{service.description}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="text-sm">Prix</span>
            </div>
            <span className="text-white font-semibold">{formatCurrency(service.price)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Revenus/jour</span>
            </div>
            <span className="text-primary-400 font-semibold">{formatCurrency(service.dailyReturn)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">Retour/mois</span>
            </div>
            <span className="text-green-400 font-semibold">{formatCurrency(service.dailyReturn * 30)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={onAllocate}
            className="w-full"
            variant="primary"
          >
            Allouer Maintenant
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;