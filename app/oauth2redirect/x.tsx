import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function XRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const { email, name, picture } = params;
    router.replace({
      pathname: '/(app)/home',
      params: {
        email: email || '',
        name: name || '',
        picture: picture || '',
      },
    });
  }, [params, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
