import React, { useState } from 'react';
import { ArrowLeft, Smartphone, CreditCard, Bitcoin, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface WithdrawPageProps {
  onNavigate: (page: string) => void;
}

const WithdrawPage: React.FC<WithdrawPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const minWithdraw = 8000;
  const canWithdraw = (user?.balance || 0) >= minWithdraw;

  const paymentMethods = [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      icon: Smartphone,
      color: 'bg-yellow-500',
      placeholder: '6XX XXX XXX',
      description: 'Retrait via MTN MoMo'
    },
    {
      id: 'orange',
      name: 'Orange Money',
      icon: Smartphone,
      color: 'bg-orange-500',
      placeholder: '6XX XXX XXX',
      description: 'Retrait via Orange Money'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: CreditCard,
      color: 'bg-blue-500',
      placeholder: 'email@example.com',
      description: 'Retrait via PayPal'
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      icon: Bitcoin,
      color: 'bg-orange-400',
      placeholder: 'Adresse Bitcoin',
      description: 'Retrait via Bitcoin'
    }
  ];

  const quickAmounts = [8000, 15000, 25000, 50000];

  const handleWithdraw = async () => {
    if (!selectedMethod || !amount || !accountInfo) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success feedback
      alert(`Demande de retrait de ${amount} XAF via ${selectedMethod} soumise avec succès !`);
      onNavigate('dashboard');
    } catch (error) {
      alert('Erreur lors du retrait');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} XAF`;
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
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
            <h1 className="text-2xl font-bold text-white">Retirer mes Gains</h1>
            <p className="text-gray-400">Transférez vos gains vers votre compte</p>
          </div>
        </div>

        {/* Balance Info */}
        <Card className="mb-6 bg-gradient-to-r from-primary-600 to-primary-700 border-primary-500">
          <div className="text-center">
            <div className="text-sm text-gray-200 mb-2">Solde Disponible</div>
            <div className="text-3xl font-bold text-white mb-4">
              {formatCurrency(user?.balance || 0)}
            </div>
            <div className="flex items-center justify-center text-sm">
              {canWithdraw ? (
                <div className="flex items-center text-green-200">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Éligible pour retrait
                </div>
              ) : (
                <div className="flex items-center text-orange-200">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Minimum {formatCurrency(minWithdraw)} requis
                </div>
              )}
            </div>
          </div>
        </Card>

        {!canWithdraw && (
          <Card className="mb-6 bg-orange-900/20 border-orange-500/30">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-orange-400 mr-3" />
              <div>
                <div className="text-orange-400 font-medium mb-1">Solde insuffisant</div>
                <div className="text-sm text-gray-300">
                  Vous devez avoir au moins {formatCurrency(minWithdraw)} pour effectuer un retrait.
                  Il vous manque {formatCurrency(minWithdraw - (user?.balance || 0))}.
                </div>
              </div>
            </div>
          </Card>
        )}

        {canWithdraw && (
          <>
            {/* Amount Selection */}
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Montant du Retrait</h2>
              
              <Input
                type="number"
                label="Montant (XAF)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Entrez le montant"
                min={minWithdraw}
                max={user?.balance || 0}
              />

              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-3">Montants rapides :</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts
                    .filter(quickAmount => quickAmount <= (user?.balance || 0))
                    .map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        amount === quickAmount.toString()
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Méthode de Retrait</h2>
              
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center mr-4`}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{method.name}</div>
                        <div className="text-gray-400 text-sm">{method.description}</div>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="ml-auto w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Account Info */}
            {selectedMethod && (
              <Card className="mb-6">
                <Input
                  type="text"
                  label={`${selectedMethodData?.name} - Informations du compte`}
                  value={accountInfo}
                  onChange={(e) => setAccountInfo(e.target.value)}
                  placeholder={selectedMethodData?.placeholder}
                  icon={selectedMethodData?.icon}
                />
              </Card>
            )}

            {/* Summary */}
            {amount && selectedMethod && accountInfo && (
              <Card className="mb-6 bg-gray-750 border-primary-500/30">
                <h3 className="text-lg font-semibold text-white mb-3">Résumé du Retrait</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Montant:</span>
                    <span className="text-white font-medium">{parseInt(amount).toLocaleString()} XAF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Méthode:</span>
                    <span className="text-white font-medium">{selectedMethodData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frais:</span>
                    <span className="text-yellow-400 font-medium">2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Compte:</span>
                    <span className="text-white font-medium">{accountInfo}</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between text-lg">
                    <span className="text-white font-semibold">Vous recevrez:</span>
                    <span className="text-primary-400 font-bold">
                      {(parseInt(amount) * 0.98).toLocaleString()} XAF
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleWithdraw}
              className="w-full"
              size="lg"
              loading={loading}
              disabled={!amount || !selectedMethod || !accountInfo || parseInt(amount) < minWithdraw}
            >
              Confirmer le Retrait
            </Button>
          </>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start">
            <div className="text-blue-400 mr-3 mt-1">ℹ️</div>
            <div>
              <div className="text-blue-400 font-medium mb-1">Information</div>
              <div className="text-sm text-gray-300 space-y-1">
                <p>• Les retraits sont traités dans les 24-48h ouvrables</p>
                <p>• Frais de traitement: 2% du montant</p>
                <p>• Montant minimum: {formatCurrency(minWithdraw)}</p>
                <p>• Vérifiez vos informations de compte avant confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;