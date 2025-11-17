import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';

type DisplayUser = {
  name?: string;
  email?: string;
  photo_url?: string;
};

export default function Home() {
  const params = useLocalSearchParams();
  const [user, setUser] = React.useState<DisplayUser>({
    name: typeof params.name === 'string' ? params.name : undefined,
    email: typeof params.email === 'string' ? params.email : undefined,
    photo_url: typeof params.picture === 'string' ? params.picture : undefined,
  });
  const [loading, setLoading] = React.useState(!user.email);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const { getCurrentUserId } = await import('../../lib/db');
          const { getUserById } = await import('../../lib/models/users');
          const currentUserId = await getCurrentUserId();
          if (!currentUserId) return;
          const dbUser = await getUserById(currentUserId);
          if (dbUser && isActive) {
            setUser((prev) => ({
              name: dbUser.name ?? prev.name,
              email: dbUser.email ?? prev.email,
              photo_url: dbUser.photo_url ?? prev.photo_url,
            }));
          }
        } catch (error) {
          console.error('Error loading user profile', error);
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

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
