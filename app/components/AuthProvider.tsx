"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithUsername: (username: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithUsername: (username: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login with Google failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Login with email failed:", error);
      throw error;
    }
  };

  const loginWithUsername = async (username: string, pass: string) => {
    try {
      // 1. Look up email by username
      const usernameRef = ref(database, `usernames/${username.toLowerCase()}`);
      const snapshot = await get(usernameRef);
      
      if (!snapshot.exists()) {
        throw new Error("Username not found");
      }
      
      const { email } = snapshot.val();
      
      // 2. Login with that email
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Login with username failed:", error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Signup with email failed:", error);
      throw error;
    }
  };

  const signupWithUsername = async (username: string, email: string, pass: string) => {
    try {
      // 1. Check if username exists
      const usernameRef = ref(database, `usernames/${username.toLowerCase()}`);
      const snapshot = await get(usernameRef);
      if (snapshot.exists()) {
        throw new Error("Username already taken.");
      }

      // 2. Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // 3. Save the mapping
      await set(usernameRef, { email: userCredential.user.email });
      
      // 4. Set display name
      await updateProfile(userCredential.user, { displayName: username });
    } catch (error) {
      console.error("Signup with username failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        loginWithUsername,
        signupWithEmail,
        signupWithUsername,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
