import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Home() {
  const { email, name, picture } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      
      {picture && typeof picture === 'string' && (
        <Image 
          source={{ uri: picture }} 
          style={styles.avatar}
        />
      )}
      
      {name && <Text style={styles.name}>{name}</Text>}
      <Text style={styles.email}>{email}</Text>
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
});
