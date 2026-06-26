import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sign in admin user using email and password
 */
export async function signInAdmin(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign out the current admin user
 */
export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen for authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
