import { FirebaseError } from 'firebase/app';
import {
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';

type RegisterOptions = {
  email: string;
  password: string;
  displayName?: string;
};

type LoginOptions = {
  email: string;
  password: string;
};

export async function registerWithEmail({ email, password, displayName }: RegisterOptions): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }
  return credential.user;
}

export async function signInWithEmail({ email, password }: LoginOptions): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email.trim());
}

export function normalizeFirebaseError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado. Intenta iniciar sesión.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo.';
      case 'auth/wrong-password':
        return 'La contraseña no es correcta.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/missing-password':
        return 'Debes ingresar una contraseña para continuar.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde.';
      default:
        return 'Ocurrió un error al procesar la autenticación. Intenta nuevamente.';
    }
  }

  return 'No se pudo completar la autenticación. Verifica tu conexión e intenta otra vez.';
}
