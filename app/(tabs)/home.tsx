import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getAuthUser, subscribeAuthUser } from '../../lib/auth/user-store';

type DisplayUser = {
  name?: string;
  email?: string;
  photo_url?: string;
};

export default function Home() {
  const params = useLocalSearchParams();
  const paramName = typeof params.name === 'string' ? params.name : undefined;
  const paramEmail = typeof params.email === 'string' ? params.email : undefined;
  const paramPhoto = typeof params.picture === 'string' ? params.picture : undefined;
  const [user, setUser] = React.useState<DisplayUser>(() => {
    const stored = getAuthUser();
    return {
      name: paramName ?? stored?.name,
      email: paramEmail ?? stored?.email,
      photo_url: paramPhoto ?? stored?.photoUrl,
    };
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setUser((prev) => ({
      name: paramName ?? prev.name,
      email: paramEmail ?? prev.email,
      photo_url: paramPhoto ?? prev.photo_url,
    }));
  }, [paramName, paramEmail, paramPhoto]);

  React.useEffect(() => {
    const stored = getAuthUser();
    if (stored) {
      setUser((prev) => ({
        name: stored.name ?? prev.name,
        email: stored.email ?? prev.email,
        photo_url: stored.photoUrl ?? prev.photo_url,
      }));
    }

    const unsubscribe = subscribeAuthUser((next) => {
      if (!next) {
        setUser({ name: undefined, email: undefined, photo_url: undefined });
        return;
      }

      setUser((prev) => ({
        name: next.name ?? prev.name,
        email: next.email ?? prev.email,
        photo_url: next.photoUrl ?? prev.photo_url,
      }));
    });

    return unsubscribe;
  }, []);

  const hasAvatar = !!user.photo_url;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4285F4" style={{ marginVertical: 16 }} />
      ) : (
        <>
          {hasAvatar && (
            <Image source={{ uri: user.photo_url }} style={styles.avatar} />
          )}

          {user.name && <Text style={styles.name}>{user.name}</Text>}
          {user.email ? (
            <Text style={styles.email}>{user.email}</Text>
          ) : (
            <Text style={[styles.email, styles.emailPlaceholder]}>Correo no disponible</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  emailPlaceholder: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginHorizontal: 32,
  },
});
