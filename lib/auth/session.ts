import { Alert } from 'react-native';
import { router } from 'expo-router';
import { upsertUser } from '../models/users';
import { setCurrentUserId } from '../db';

export type PersistUserParams = {
  id: string;
  name?: string;
  email?: string;
  photoUrl?: string;
};

export async function persistUserSession({ id, name, email, photoUrl }: PersistUserParams) {
  if (!id) {
    Alert.alert('Autenticación', 'No se pudo obtener el identificador del usuario.');
    return;
  }

  try {
    await upsertUser({
      id,
      name,
      email,
      photo_url: photoUrl,
    });
    await setCurrentUserId(id);

    router.replace({
      pathname: '/(tabs)/home',
      params: {
        email: email || '',
        name: name || '',
        picture: photoUrl || '',
      },
    });
  } catch (error) {
    console.error(error);
    Alert.alert('Autenticación', 'No se pudo guardar la sesión local. Intenta de nuevo.');
  }
}
