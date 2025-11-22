export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  photoUrl?: string;
};

const listeners = new Set<(user: AuthUser | null) => void>();
let currentUser: AuthUser | null = null;

export function setAuthUser(user: AuthUser | null) {
  currentUser = user;
  listeners.forEach((listener) => {
    try {
      listener(currentUser);
    } catch (error) {
      console.error('[AuthStore] listener error', error);
    }
  });
}

export function getAuthUser(): AuthUser | null {
  return currentUser;
}

export function subscribeAuthUser(listener: (user: AuthUser | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
