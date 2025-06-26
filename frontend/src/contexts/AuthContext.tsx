import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { firebaseApp } from '../firebase'; // 🔁 ton fichier de config Firebase

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Types personnalisés
interface User {
  id: string;
  email: string;
  balance: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const generateReferralCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await signInWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      setUser({
        id: uid,
        email: data.email,
        balance: data.balance,
        referralCode: data.referralCode,
        referredBy: data.referredBy,
        createdAt: data.createdAt.toDate(),
      });
    }

    setLoading(false);
  };

  // 👤 REGISTER
  const register = async (email: string, password: string, referralCode?: string) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;
    const newUser: User = {
      id: uid,
      email,
      balance: 1000,
      referralCode: generateReferralCode(),
      referredBy: referralCode || '',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', uid), {
      ...newUser,
      createdAt: newUser.createdAt,
    });

    setUser(newUser);
    setLoading(false);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 🔄 Écoute des changements de session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setUser({
            id: firebaseUser.uid,
            email: data.email,
            balance: data.balance,
            referralCode: data.referralCode,
            referredBy: data.referredBy,
            createdAt: data.createdAt.toDate(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
