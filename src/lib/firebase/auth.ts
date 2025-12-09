import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from './config';

export const signUpWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return await firebaseSignOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Phone authentication helpers
export const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
  });
};

export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

