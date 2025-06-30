import React from 'react';
import { TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';
import { Service } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ServiceCardProps {
  service: Service;
  onAllocate: () => void;
  loading?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onAllocate, loading }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} XAF`;
  };

  const calculateROI = () => {
    return ((service.dailyReturn * service.duration) / service.price * 100).toFixed(1);
  };

  const totalReturn = service.dailyReturn * service.duration;

  return (
    <Card hover className="overflow-hidden">
      <div className="relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {calculateROI()}% ROI / {service.duration}j
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
              <span className="text-sm">Revenus / jour</span>
            </div>
            <span className="text-primary-400 font-semibold">{formatCurrency(service.dailyReturn)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">Durée</span>
            </div>
            <span className="text-gray-300 font-semibold">{service.duration} jours</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">Revenus totaux</span>
            </div>
            <span className="text-green-400 font-semibold">{formatCurrency(totalReturn)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={onAllocate}
            disabled={loading}
            className="w-full"
            variant="primary"
          >
            {loading
              ? 'Traitement...'
              : `Allouer ${formatCurrency(service.price)} pour ${service.duration}j`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
