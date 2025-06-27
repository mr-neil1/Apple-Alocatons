import React, { useState } from 'react';
import { ArrowLeft, Users, Copy, Share2, Gift, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ReferralPageProps {
  onNavigate: (page: string) => void;
}

const ReferralPage: React.FC<ReferralPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Mock referral data
  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 3,
    totalBonus: 15000,
    monthlyBonus: 2500,
  };

  const referrals = [
    {
      id: '1',
      email: 'user1@example.com',
      joinDate: new Date('2024-01-15'),
      isActive: true,
      totalDeposits: 25000,
      bonus: 1250,
    },
    {
      id: '2',
      email: 'user2@example.com',
      joinDate: new Date('2024-01-20'),
      isActive: true,
      totalDeposits: 15000,
      bonus: 750,
    },
    {
      id: '3',
      email: 'user3@example.com',
      joinDate: new Date('2024-01-25'),
      isActive: false,
      totalDeposits: 0,
      bonus: 0,
    },
  ];

  const referralLink = `${window.location.origin}/?ref=${user?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Apple Allocations Wallet',
        text: 'Rejoignez-moi sur Apple Allocations et recevez 1000 XAF gratuits !',
        url: referralLink,
      });
    } else {
      copyToClipboard();
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} XAF`;
  };

  const canWithdraw = referralStats.activeReferrals >= 3;

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-2xl font-bold text-white">Mon Équipe</h1>
            <p className="text-gray-400">Gérez vos parrainages et gagnez des bonus</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card padding="sm">
            <div className="text-center">
              <Users className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
              <div className="text-gray-400 text-sm">Total Filleuls</div>
            </div>
          </Card>
          
          <Card padding="sm">
            <div className="text-center">
              <UserPlus className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{referralStats.activeReferrals}</div>
              <div className="text-gray-400 text-sm">Filleuls Actifs</div>
            </div>
          </Card>
          
          <Card padding="sm">
            <div className="text-center">
              <Gift className="w-8 h-8 text-accent-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{formatCurrency(referralStats.totalBonus)}</div>
              <div className="text-gray-400 text-sm">Total Bonus</div>
            </div>
          </Card>
          
          <Card padding="sm">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{formatCurrency(referralStats.monthlyBonus)}</div>
              <div className="text-gray-400 text-sm">Ce Mois</div>
            </div>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Votre Lien de Parrainage</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Code de Parrainage
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={user?.referralCode || ''}
                  readOnly
                  className="bg-gray-700"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="secondary"
                  icon={copied ? CheckCircle : Copy}
                  className={copied ? 'bg-green-600' : ''}
                >
                  {copied ? 'Copié' : 'Copier'}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lien de Parrainage
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="bg-gray-700 text-sm"
                />
                <Button
                  onClick={shareLink}
                  variant="primary"
                  icon={Share2}
                >
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Withdrawal Status */}
        <Card className={`mb-8 ${canWithdraw ? 'bg-green-900/20 border-green-500/30' : 'bg-orange-900/20 border-orange-500/30'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Statut de Retrait</h3>
              <p className={`text-sm ${canWithdraw ? 'text-green-400' : 'text-orange-400'}`}>
                {canWithdraw 
                  ? 'Vous pouvez effectuer des retraits !' 
                  : `Il vous faut ${3 - referralStats.activeReferrals} filleul(s) actif(s) supplémentaire(s) pour débloquer les retraits.`
                }
              </p>
            </div>
            <div className={`text-2xl ${canWithdraw ? 'text-green-400' : 'text-orange-400'}`}>
              {canWithdraw ? '✅' : '⏳'}
            </div>
          </div>
          {canWithdraw && (
            <Button
              onClick={() => onNavigate('withdraw')}
              variant="success"
              className="mt-4"
            >
              Effectuer un Retrait
            </Button>
          )}
        </Card>

        {/* Referrals List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Mes Filleuls</h2>
            <div className="text-sm text-gray-400">
              {referrals.length} au total
            </div>
          </div>

          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    referral.isActive ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <div className="text-white font-medium">{referral.email}</div>
                    <div className="text-gray-400 text-sm">
                      Inscrit le {referral.joinDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatCurrency(referral.totalDeposits)}
                  </div>
                  <div className="text-green-400 text-sm">
                    Bonus: {formatCurrency(referral.bonus)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {referrals.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">Aucun filleul pour le moment</div>
              <div className="text-gray-500 text-sm">Partagez votre lien pour commencer à gagner des bonus !</div>
            </div>
          )}
        </Card>

        {/* Bonus Structure */}
        <Card className="mt-8 bg-blue-900/20 border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">Structure des Bonus</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Bonus d'inscription du filleul:</span>
              <span className="text-blue-400 font-medium">5% du premier dépôt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Condition de retrait:</span>
              <span className="text-blue-400 font-medium">3 filleuls actifs minimum</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Filleul actif:</span>
              <span className="text-blue-400 font-medium">Au moins un dépôt ou une allocation</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReferralPage;