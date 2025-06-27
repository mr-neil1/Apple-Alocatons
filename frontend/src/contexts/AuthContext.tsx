// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  balance: number;
  referralCode: string;
  referredBy?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            balance: data.balance,
            referralCode: data.referralCode,
            referredBy: data.referredBy,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, referralCode?: string) => {
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const newReferralCode = generateReferralCode();
      const userData = {
        email,
        referralCode: newReferralCode,
        referredBy: referralCode || null,
        balance: 1000, // bonus
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), userData);

      setUser({ uid, email, referralCode: newReferralCode, referredBy: referralCode, balance: 1000 });
    } catch (err) {
      console.error(err);
      throw new Error("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      const data = userDoc.data();
   
      if (userDoc.exists()) {
        setUser({
          uid,
          email,
          balance: data?.balance || 0,
          referralCode: data?.referralCode || '',
          referredBy: data?.referredBy,
        });
      }
    } catch (err) {
      console.error(err);
      throw new Error("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider const value={{ user, login, register, logout, loading,setUser, }}>
      {children}
    </AuthContext.Provider>
  );
};
