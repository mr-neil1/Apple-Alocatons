import { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, CreditCard, Bitcoin, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { auth } from '../../firebase';
import axios from 'axios';

function DepositPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'mtn', name: 'MTN Mobile Money', icon: Smartphone, color: 'bg-yellow-500', description: 'Dépôt via MTN MoMo' },
    { id: 'orange', name: 'Orange Money', icon: Smartphone, color: 'bg-orange-500', description: 'Dépôt via Orange Money' },
    { id: 'paypal', name: 'PayPal', icon: CreditCard, color: 'bg-blue-500', description: 'Dépôt via PayPal' },
    { id: 'bitcoin', name: 'Bitcoin', icon: Bitcoin, color: 'bg-orange-400', description: 'Dépôt via Bitcoin' }
  ];

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  // Debug : Affiche quand la page est chargée
  useEffect(() => {
    console.log('📄 DepositPage chargé');
  }, []);

  const handleDeposit = async () => {
    console.log('🚀 handleDeposit lancé');
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert('❌ Vous devez être connecté pour déposer.');
      console.error('Aucun utilisateur connecté');
      setLoading(false);
      return;
    }

    try {
      const token = await user.uid();
      console.log('✅ Token Firebase obtenu :', token);

      const payload = {
        amount,
        method: selectedMethod,
        phoneNumber
      };

      console.log('📤 Envoi au backend avec :', payload);

      const res = await axios.post(
        'https://apple-allocatons-backend.onrender.com/api/deposit',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('📥 Réponse du backend :', res.data);

      const { paymentLink } = res.data;
      if (paymentLink) {
        console.log('🔗 Redirection vers le paiement CinetPay...');
        window.location.href = paymentLink;
      } else {
        console.warn('⚠️ Aucune URL de paiement reçue.');
        alert('Aucun lien de paiement reçu.');
      }
    } catch (err: any) {
      console.error('❌ Erreur dépôt :', err?.response || err);
      alert('Erreur lors du dépôt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button onClick={() => navigate('/')} variant="secondary" size="sm" icon={ArrowLeft} className="mr-4">
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Effectuer un Dépôt</h1>
            <p className="text-gray-400">Ajoutez des fonds à votre portefeuille</p>
          </div>
        </div>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Montant du Dépôt</h2>
          <Input
            type="number"
            label="Montant (XAF)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Entrez le montant"
            icon={Wallet}
          />
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-3">Montants rapides :</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quickAmount) => (
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

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Méthode de Paiement</h2>
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

        {(selectedMethod === 'mtn' || selectedMethod === 'orange') && (
          <Card className="mb-6">
            <Input
              type="tel"
              label="Numéro de Téléphone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="6XX XXX XXX"
              icon={Smartphone}
            />
          </Card>
        )}

        {amount && selectedMethod && (
          <Card className="mb-6 bg-gray-750 border-primary-500/30">
            <h3 className="text-lg font-semibold text-white mb-3">Résumé du Dépôt</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Montant:</span>
                <span className="text-white font-medium">{parseInt(amount).toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Méthode:</span>
                <span className="text-white font-medium">
                  {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Frais:</span>
                <span className="text-green-400 font-medium">Gratuit</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between text-lg">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-primary-400 font-bold">{parseInt(amount).toLocaleString()} XAF</span>
              </div>
            </div>
          </Card>
        )}

        <Button onClick={handleDeposit} className="w-full" size="lg" loading={loading}>
          Confirmer le Dépôt
        </Button>
      </div>
    </div>
  );
}

export default DepositPage;

