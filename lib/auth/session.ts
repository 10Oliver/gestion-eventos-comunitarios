import { Alert } from 'react-native';
import { router } from 'expo-router';
import { setAuthUser } from './user-store';

export type PersistUserParams = {
  id: string;
  name?: string;
  email?: string;
  photoUrl?: string;
};

type PersistUserOptions = {
  navigate?: boolean;
};

export async function persistUserSession(
  { id, name, email, photoUrl }: PersistUserParams,
  { navigate = true }: PersistUserOptions = {}
) {
  if (!id) {
    Alert.alert('Autenticación', 'No se pudo obtener el identificador del usuario.');
    return;
  }

  setAuthUser({ id, name, email, photoUrl });

  if (navigate) {
    router.replace({
      pathname: '/(tabs)/home',
      params: {
        email: email || '',
        name: name || '',
        picture: photoUrl || '',
      },
    });
  }
}
