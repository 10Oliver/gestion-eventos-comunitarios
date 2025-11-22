import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { normalizeFirebaseError, registerWithEmail } from '../lib/auth/email';
import { persistUserSession } from '../lib/auth/session';

export default function RegisterScreen() {
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const updateField = React.useCallback((key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const handleRegister = React.useCallback(async () => {
    const trimmedFirstName = form.firstName.trim();
    const trimmedLastName = form.lastName.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPassword = form.password.trim();
    const trimmedConfirm = form.confirmPassword.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      Alert.alert('Crear cuenta', 'Completa todos los campos para continuar.');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Alert.alert('Crear cuenta', 'Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const user = await registerWithEmail({
        email: trimmedEmail,
        password: trimmedPassword,
        displayName: `${trimmedFirstName} ${trimmedLastName}`.trim(),
      });

      await persistUserSession({
        id: user.uid,
        name: user.displayName || `${trimmedFirstName} ${trimmedLastName}`.trim(),
        email: user.email || trimmedEmail,
        photoUrl: user.photoURL || undefined,
      });
      setForm({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      const message = normalizeFirebaseError(err);
      setError(message);
      Alert.alert('Crear cuenta', message);
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  const goBackToLogin = React.useCallback(() => {
    router.push('/');
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
  <View style={styles.card}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Ingresa tu información y deja que nosotros hagamos el resto</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={form.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            autoCapitalize="words"
            placeholderTextColor="#9aa1b2"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={form.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            autoCapitalize="words"
            placeholderTextColor="#9aa1b2"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={form.phone}
            onChangeText={(text) => updateField('phone', text)}
            keyboardType="phone-pad"
            placeholderTextColor="#9aa1b2"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={form.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor="#9aa1b2"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={form.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
            placeholderTextColor="#9aa1b2"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={form.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            secureTextEntry
            placeholderTextColor="#9aa1b2"
            returnKeyType="done"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goBackToLogin} style={styles.linkButton}>
            <Text style={styles.linkText}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 12,
    paddingVertical: 24,
    rowGap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4caf50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#a3e635',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f7fee7',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#7cc72d',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#4caf50',
    fontWeight: '600',
  },
});
