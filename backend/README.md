# Apple Allocations Wallet - Backend API

## Description
Backend API pour l'application Apple Allocations Wallet, un système de gestion d'investissements et de portefeuille personnel.

## Installation

```bash
cd backend
npm install
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur le port 3001 par défaut.

## Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur

### Utilisateur
- `GET /api/user/balance` - Consulter le solde

### Dépôts
- `POST /api/deposit` - Effectuer un dépôt
- `GET /api/deposits` - Historique des dépôts

### Services
- `GET /api/services` - Liste des services disponibles

### Allocations
- `POST /api/allocate` - Allouer un service
- `GET /api/allocations` - Mes allocations

### Parrainage
- `GET /api/referrals` - Mes filleuls et statistiques

### Retraits
- `POST /api/withdraw` - Demander un retrait
- `GET /api/withdrawals` - Historique des retraits

### Santé
- `GET /api/health` - Vérification de l'état du serveur

## Fonctionnalités

### Bonus d'inscription
- 1000 XAF crédités automatiquement à l'inscription
- Bonus de parrainage de 50 XAF pour le parrain

### Revenus journaliers
- Traitement automatique des gains quotidiens via cron job
- Mise à jour des soldes à minuit chaque jour

### Système de parrainage
- Code de parrainage unique pour chaque utilisateur
- Condition de 3 filleuls actifs pour débloquer les retraits

### Sécurité
- Hashage des mots de passe avec bcrypt
- Authentification JWT
- Validation des données d'entrée

## Configuration

### Variables d'environnement
```bash
PORT=3001
JWT_SECRET=your-secret-key-here
```

## Base de données
Pour cette démo, les données sont stockées en mémoire. Pour la production, il faudrait intégrer une vraie base de données (PostgreSQL, MongoDB, etc.).

## Structure des données

### User
```javascript
{
  id: string,
  email: string,
  password: string (hashed),
  balance: number,
  referralCode: string,
  referredBy: string,
  createdAt: Date,
  isActive: boolean
}
```

### Deposit
```javascript
{
  id: string,
  userId: string,
  amount: number,
  method: 'mtn' | 'orange' | 'paypal' | 'bitcoin',
  status: 'pending' | 'completed' | 'failed',
  createdAt: Date
}
```

### Allocation
```javascript
{
  id: string,
  userId: string,
  serviceId: string,
  service: Service,
  amount: number,
  dailyReturn: number,
  totalEarned: number,
  createdAt: Date,
  lastPayoutAt: Date
}
```