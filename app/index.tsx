import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
  exchangeCodeAsync,
  AuthRequestPromptOptions,
  AuthSessionRedirectUriOptions,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { normalizeFirebaseError, registerWithEmail, resetPassword, signInWithEmail } from '../lib/auth/email';

WebBrowser.maybeCompleteAuthSession();

const X_DISCOVERY = {
  authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
  tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
  revocationEndpoint: 'https://api.twitter.com/2/oauth2/revoke',
};

const X_SCOPES = ['tweet.read', 'users.read', 'offline.access'];
const GITHUB_DISCOVERY = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

const GITHUB_SCOPES = ['read:user', 'user:email'];
const GITHUB_API_VERSION = '2022-11-28';

type NativePromptOptions = AuthRequestPromptOptions & { useProxy?: boolean };
const NATIVE_PROMPT_OPTIONS: NativePromptOptions = { useProxy: false };
const GITHUB_PROMPT_OPTIONS: NativePromptOptions = { useProxy: true };

export default function LoginScreen() {
  const redirectUri = makeRedirectUri({
    scheme: 'com.gestioneventoscomunitarios.app',
    path: 'oauth2redirect/google',
    native: 'com.gestioneventoscomunitarios.app:/oauth2redirect/google',
  });
  const xRedirectUri = makeRedirectUri({
    scheme: 'com.gestioneventoscomunitarios.app',
    path: 'oauth2redirect/x',
    native: 'com.gestioneventoscomunitarios.app://oauth2redirect/x',
  });
  const githubRedirectUri = makeRedirectUri({
    scheme: 'com.gestioneventoscomunitarios.app',
    path: 'oauth2redirect/github',
    native: 'com.gestioneventoscomunitarios.app://oauth2redirect/github',
    useProxy: true,
  } as AuthSessionRedirectUriOptions & { useProxy?: boolean });
  const xClientId = process.env.EXPO_PUBLIC_X_CLIENT_ID;
  const isXConfigured = Boolean(xClientId);
  const githubClientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET;
  const isGithubConfigured = Boolean(githubClientId && githubClientSecret);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: '803821575234-t80td046s7p84alkpehmqrhk5slllh8d.apps.googleusercontent.com',
    redirectUri,
  });

  const [xRequest, xResponse, promptXAsync] = useAuthRequest(
    {
      clientId: xClientId || 'missing-x-client-id',
      redirectUri: xRedirectUri,
      responseType: ResponseType.Code,
      usePKCE: true,
      scopes: X_SCOPES,
    },
    X_DISCOVERY
  );

  const [githubRequest, githubResponse, promptGithubAsync] = useAuthRequest(
    {
      clientId: githubClientId || 'missing-github-client-id',
      redirectUri: githubRedirectUri,
      responseType: ResponseType.Code,
      scopes: GITHUB_SCOPES,
      usePKCE: true,
    },
    GITHUB_DISCOVERY
  );

  const [isXLoading, setIsXLoading] = React.useState(false);
  const [isGithubLoading, setIsGithubLoading] = React.useState(false);
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [emailForm, setEmailForm] = React.useState({ name: '', email: '', password: '' });
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const buildGithubHeaders = React.useCallback(
    (token: string) => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    }),
    []
  );
  const persistUserSession = React.useCallback(async ({
    id,
    name,
    email,
    photoUrl,
  }: {
    id: string;
    name?: string;
    email?: string;
    photoUrl?: string;
  }) => {
    if (!id) {
      Alert.alert('Autenticación', 'No se pudo obtener el identificador del usuario.');
      return;
    }

    try {
      const { upsertUser } = await import('../lib/models/users');
      const { setCurrentUserId } = await import('../lib/db');

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
  }, []);

  const handleEmailAuth = React.useCallback(async () => {
    const trimmedEmail = emailForm.email.trim();
    const trimmedPassword = emailForm.password.trim();
    const trimmedName = emailForm.name.trim();
    const isRegister = authMode === 'register';

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Autenticación por correo', 'Ingresa correo y contraseña para continuar.');
      return;
    }

    if (isRegister && !trimmedName) {
      Alert.alert('Crear cuenta', 'Agrega tu nombre para personalizar la cuenta.');
      return;
    }

    setIsEmailLoading(true);
    setEmailError(null);
    try {
      const user = isRegister
        ? await registerWithEmail({
            email: trimmedEmail,
            password: trimmedPassword,
            displayName: trimmedName,
          })
        : await signInWithEmail({ email: trimmedEmail, password: trimmedPassword });

      await persistUserSession({
        id: user.uid,
        name: user.displayName || trimmedName,
        email: user.email || trimmedEmail,
        photoUrl: user.photoURL || undefined,
      });
      setEmailForm((current) => ({ ...current, password: '' }));
    } catch (error) {
      const message = normalizeFirebaseError(error);
      setEmailError(message);
      Alert.alert('Autenticación por correo', message);
    } finally {
      setIsEmailLoading(false);
    }
  }, [authMode, emailForm, persistUserSession]);

  const handleResetPassword = React.useCallback(async () => {
    const trimmedEmail = emailForm.email.trim();
    if (!trimmedEmail) {
      Alert.alert('Recuperar contraseña', 'Ingresa tu correo para enviarte un enlace.');
      return;
    }

    try {
      await resetPassword(trimmedEmail);
      Alert.alert('Recuperar contraseña', 'Te enviamos un correo para restablecer tu contraseña.');
    } catch (error) {
      const message = normalizeFirebaseError(error);
      Alert.alert('Recuperar contraseña', message);
    }
  }, [emailForm.email]);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (!id_token) return;
      const userInfo = parseJwt(id_token) as any;
      const userId = userInfo.sub || userInfo.email || '';
      persistUserSession({
        id: userId,
        name: userInfo.name,
        email: userInfo.email,
        photoUrl: userInfo.picture,
      });
    }
  }, [response, persistUserSession]);

  React.useEffect(() => {
    if (xResponse?.type === 'success' && xResponse.params.code && xRequest && xClientId) {
      setIsXLoading(true);
      (async () => {
        try {
          const tokenResult = await exchangeCodeAsync(
            {
              clientId: xClientId,
              code: xResponse.params.code,
              redirectUri: xRedirectUri,
              extraParams: {
                code_verifier: xRequest.codeVerifier || '',
              },
            },
            X_DISCOVERY
          );

          if (!tokenResult?.accessToken) {
            throw new Error('No access token returned from X.');
          }

          const profileRes = await fetch(
            'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
            {
              headers: {
                Authorization: `Bearer ${tokenResult.accessToken}`,
              },
            }
          );

          if (!profileRes.ok) {
            throw new Error('Unable to fetch X profile.');
          }

          const profile = (await profileRes.json()) as {
            data?: {
              id: string;
              name?: string;
              username?: string;
              profile_image_url?: string;
            };
          };

          if (!profile?.data?.id) {
            throw new Error('X profile payload did not include an id.');
          }

          await persistUserSession({
            id: profile.data.id,
            name: profile.data.name || profile.data.username,
            email: '',
            photoUrl: profile.data.profile_image_url?.replace('_normal', '_400x400'),
          });
        } catch (error) {
          console.error(error);
          Alert.alert('Inicio de sesión con X', 'No se pudo completar la autenticación.');
        } finally {
          setIsXLoading(false);
        }
      })();
    }
  }, [xResponse, xRequest, xClientId, xRedirectUri, persistUserSession]);

  React.useEffect(() => {
    if (
      githubResponse?.type === 'success' &&
      githubResponse.params.code &&
      githubClientId &&
      githubClientSecret &&
      githubRequest
    ) {
      setIsGithubLoading(true);
      (async () => {
        try {
          const tokenResult = await exchangeCodeAsync(
            {
              clientId: githubClientId,
              code: githubResponse.params.code,
              redirectUri: githubRedirectUri,
              extraParams: {
                client_secret: githubClientSecret,
                code_verifier: githubRequest.codeVerifier || '',
              },
            },
            GITHUB_DISCOVERY
          );

          if (!tokenResult?.accessToken) {
            throw new Error('No access token returned from GitHub.');
          }

          const baseHeaders = buildGithubHeaders(tokenResult.accessToken);

          const profileRes = await fetch('https://api.github.com/user', {
            headers: baseHeaders,
          });

          if (!profileRes.ok) {
            throw new Error('Unable to fetch GitHub profile.');
          }

          const profile = (await profileRes.json()) as {
            id?: number;
            node_id?: string;
            name?: string;
            login?: string;
            email?: string;
            avatar_url?: string;
          };

          let githubEmail = profile.email || '';
          if (!githubEmail) {
            const emailsRes = await fetch('https://api.github.com/user/emails', {
              headers: baseHeaders,
            });
            if (emailsRes.ok) {
              const emails = (await emailsRes.json()) as Array<{
                email: string;
                primary?: boolean;
                verified?: boolean;
              }>;
              const primaryEmail = emails.find((mail) => mail.primary && mail.verified);
              githubEmail = primaryEmail?.email || emails[0]?.email || '';
            }
          }

          const githubId = profile.id?.toString() || profile.node_id || githubEmail;
          await persistUserSession({
            id: githubId || 'github-user',
            name: profile.name || profile.login,
            email: githubEmail,
            photoUrl: profile.avatar_url,
          });
        } catch (error) {
          console.error(error);
          Alert.alert('Inicio de sesión con GitHub', 'No se pudo completar la autenticación.');
        } finally {
          setIsGithubLoading(false);
        }
      })();
    }
  }, [
    githubResponse,
    githubClientId,
    githubClientSecret,
    githubRedirectUri,
    githubRequest,
    persistUserSession,
  ]);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  };
  const isRegisterMode = authMode === 'register';

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Gestiona tus eventos</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acceso con correo</Text>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, !isRegisterMode && styles.modeButtonActive]}
                onPress={() => {
                  setAuthMode('login');
                  setEmailError(null);
                }}
              >
                <Text style={[styles.modeButtonText, !isRegisterMode && styles.modeButtonTextActive]}>Iniciar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, isRegisterMode && styles.modeButtonActive]}
                onPress={() => {
                  setAuthMode('register');
                  setEmailError(null);
                }}
              >
                <Text style={[styles.modeButtonText, isRegisterMode && styles.modeButtonTextActive]}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
            {isRegisterMode && (
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={emailForm.name}
                onChangeText={(text) => setEmailForm((current) => ({ ...current, name: text }))}
                autoCapitalize="words"
                placeholderTextColor="#9aa1b2"
                returnKeyType="next"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={emailForm.email}
              onChangeText={(text) => setEmailForm((current) => ({ ...current, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="#9aa1b2"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={emailForm.password}
              onChangeText={(text) => setEmailForm((current) => ({ ...current, password: text }))}
              secureTextEntry
              placeholderTextColor="#9aa1b2"
              returnKeyType="done"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, isEmailLoading && styles.buttonDisabled]}
              onPress={handleEmailAuth}
              disabled={isEmailLoading}
            >
              {isEmailLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResetPassword} style={styles.linkButton}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.sectionLabel}>O continúa con</Text>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => promptAsync(NATIVE_PROMPT_OPTIONS)}
            >
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.xButton, (!isXConfigured || isXLoading || !xRequest) && styles.buttonDisabled]}
              onPress={() => {
                if (!isXConfigured) {
                  Alert.alert('Configuración requerida', 'Define EXPO_PUBLIC_X_CLIENT_ID en tu .env antes de intentar iniciar sesión con X.');
                  return;
                }
                promptXAsync?.(NATIVE_PROMPT_OPTIONS).catch(console.error);
              }}
              disabled={!isXConfigured || !xRequest || isXLoading}
              activeOpacity={0.85}
            >
              {isXLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.xButtonText}>Continuar con X</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.githubButton, (!isGithubConfigured || !githubRequest || isGithubLoading) && styles.buttonDisabled]}
              onPress={() => {
                if (!isGithubConfigured) {
                  Alert.alert(
                    'Configuración requerida',
                    'Define EXPO_PUBLIC_GITHUB_CLIENT_ID y EXPO_PUBLIC_GITHUB_CLIENT_SECRET antes de iniciar sesión con GitHub.'
                  );
                  return;
                }
                promptGithubAsync?.(GITHUB_PROMPT_OPTIONS).catch(console.error);
              }}
              disabled={!isGithubConfigured || !githubRequest || isGithubLoading}
              activeOpacity={0.85}
            >
              {isGithubLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.githubButtonText}>Continuar con GitHub</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    rowGap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    rowGap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    columnGap: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#111827',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  socialSection: {
    rowGap: 12,
    width: '100%',
  },
  sectionLabel: {
    textAlign: 'center',
    color: '#4b5563',
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  xButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  githubButton: {
    backgroundColor: '#24292e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  githubButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
