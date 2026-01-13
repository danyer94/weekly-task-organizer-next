"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithUsername: (username: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithUsername: (username: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
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
      const normalized = username.trim().toLowerCase();
      if (!normalized || !pass) {
        const err = new Error("Invalid credentials");
        (err as { code?: string }).code = "auth/invalid-credential";
        throw err;
      }

      const res = await fetch("/api/auth/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normalized, password: pass }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(
          data?.error || "We couldn't sign you in with that username."
        );
        (err as { code?: string }).code =
          data?.code || "auth/invalid-credential";
        throw err;
      }

      if (!data?.token || typeof data.token !== "string") {
        const err = new Error("Invalid credentials");
        (err as { code?: string }).code = "auth/invalid-credential";
        throw err;
      }

      await signInWithCustomToken(auth, data.token);
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
      const trimmedUsername = username.trim();
      const normalized = trimmedUsername.toLowerCase();

      if (!trimmedUsername) {
        const err = new Error("Username is required.");
        (err as { code?: string }).code = "auth/invalid-username";
        throw err;
      }

      // 1. Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

      // 2. Claim username via server so emails stay private
      const token = await userCredential.user.getIdToken();
      const claimRes = await fetch("/api/auth/username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: normalized }),
      });
      const claimData = await claimRes.json().catch(() => ({}));
      if (!claimRes.ok) {
        let fallbackCode = "auth/invalid-credential";
        if (claimRes.status === 400) {
          fallbackCode = "auth/invalid-username";
        } else if (claimRes.status === 409) {
          fallbackCode = "auth/username-taken";
        }

        const err = new Error(
          claimData?.error || "We couldn't claim that username."
        );
        (err as { code?: string }).code =
          claimData?.code || fallbackCode;
        try {
          await userCredential.user.delete();
        } catch (cleanupError) {
          console.warn("Failed to cleanup user after username claim error", cleanupError);
        }
        await signOut(auth).catch(() => undefined);
        throw err;
      }

      // 3. Set display name
      await updateProfile(userCredential.user, { displayName: trimmedUsername });
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

  const updateDisplayName = async (displayName: string) => {
    if (!auth.currentUser) {
      throw new Error("No user is signed in.");
    }

    try {
      await updateProfile(auth.currentUser, { displayName });
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    } catch (error) {
      console.error("Update display name failed:", error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error("No user is signed in.");
    }

    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error("Update password failed:", error);
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
        updateDisplayName,
        updateUserPassword,
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
