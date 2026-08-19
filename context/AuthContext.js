import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName?.trim()) await updateProfile(cred.user, { displayName: displayName.trim() });
    return cred.user;
  }

  function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email.trim(), password).then((cred) => cred.user);
  }

  function signOutUser() {
    return signOut(auth);
  }

  const value = { user, authLoading, signUp, signIn, signOutUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
