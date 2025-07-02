import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (replace with real database)
let users = [];
let deposits = [];
let allocations = [];
let withdrawals = [];
let services = [
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
  }
];

// Helper functions
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, referralCode } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      balance: 1000, // Bonus d'inscription
      referralCode: generateReferralCode(),
      referredBy: referralCode,
      createdAt: new Date(),
      isActive: true
    };

    users.push(user);

    // Handle referral bonus
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (referrer) {
        referrer.balance += 50; // Bonus parrain
      }
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: user.uid,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// User routes
app.get('/api/user/balance', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  res.json({ balance: user.balance });
});

// Deposit routes
app.post('/api/deposit', authenticateToken, (req, res) => {
  try {
    const { amount, method, phoneNumber, accountInfo } = req.body;
    const userId = req.user.userId;

    const deposit = {
      id: uuidv4(),
      userId,
      amount: parseFloat(amount),
      method,
      status: 'pending',
      createdAt: new Date(),
      phoneNumber,
      accountInfo
    };

    deposits.push(deposit);

    // Simulate instant approval for demo
    setTimeout(() => {
      deposit.status = 'completed';
      const user = users.find(u => u.id === userId);
      if (user) {
        user.balance += deposit.amount;
      }
    }, 5000);

    res.status(201).json({ 
      message: 'Dépôt initié avec succès',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        method: deposit.method,
        status: deposit.status,
        createdAt: deposit.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du dépôt' });
  }
});

app.get('/api/deposits', authenticateToken, (req, res) => {
  const userDeposits = deposits
    .filter(d => d.userId === req.user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userDeposits);
});

// Services routes
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Allocation routes
app.post('/api/allocate', authenticateToken, (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = req.user.userId;

    const service = services.find(s => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.balance < service.price) {
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Deduct from balance
    user.balance -= service.price;

    // Create allocation
    const allocation = {
      id: uuidv4(),
      userId,
      serviceId,
      service,
      amount: service.price,
      dailyReturn: service.dailyReturn,
      totalEarned: 0,
      createdAt: new Date(),
      lastPayoutAt: new Date()
    };

    allocations.push(allocation);

    res.status(201).json({
      message: 'Allocation créée avec succès',
      allocation: {
        id: allocation.id,
        service: allocation.service,
        amount: allocation.amount,
        dailyReturn: allocation.dailyReturn,
        createdAt: allocation.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'allocation' });
  }
});

app.get('/api/allocations', authenticateToken, (req, res) => {
  const userAllocations = allocations
    .filter(a => a.userId === req.user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userAllocations);
});

// Referral routes
app.get('/api/referrals', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  const referrals = users
    .filter(u => u.referredBy === user.referralCode)
    .map(u => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
      isActive: u.isActive,
      totalDeposits: deposits
        .filter(d => d.userId === u.id && d.status === 'completed')
        .reduce((sum, d) => sum + d.amount, 0)
    }));

  res.json({
    referralCode: user.referralCode,
    referrals,
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(r => r.isActive).length
  });
});

// Withdrawal routes
app.post('/api/withdraw', authenticateToken, (req, res) => {
  try {
    const { amount, method, accountInfo } = req.body;
    const userId = req.user.userId;

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    if (amount < 3000) {
      return res.status(400).json({ error: 'Montant minimum 3000 XAF' });
    }

    // Check referral requirement
    const referralCount = users.filter(u => u.referredBy === user.referralCode && u.isActive).length;
    if (referralCount < 3) {
      return res.status(400).json({ error: 'Au moins 3 filleuls actifs requis' });
    }

    // Deduct from balance
    user.balance -= amount;

    // Create withdrawal
    const withdrawal = {
      id: uuidv4(),
      userId,
      amount: parseFloat(amount),
      method,
      accountInfo,
      status: 'pending',
      createdAt: new Date()
    };

    withdrawals.push(withdrawal);

    res.status(201).json({
      message: 'Demande de retrait soumise avec succès',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du retrait' });
  }
});

app.get('/api/withdrawals', authenticateToken, (req, res) => {
  const userWithdrawals = withdrawals
    .filter(w => w.userId === req.user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userWithdrawals);
});

// Daily earnings cron job (runs every day at midnight)
cron.schedule('0 0 * * *', () => {
  console.log('Processing daily earnings...');
  
  allocations.forEach(allocation => {
    const user = users.find(u => u.id === allocation.userId);
    if (user) {
      user.balance += allocation.dailyReturn;
      allocation.totalEarned += allocation.dailyReturn;
      allocation.lastPayoutAt = new Date();
    }
  });
  
  console.log('Daily earnings processed successfully');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});