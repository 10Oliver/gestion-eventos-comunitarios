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
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { normalizeFirebaseError, resetPassword, signInWithEmail } from '../lib/auth/email';
import { persistUserSession } from '../lib/auth/session';

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

export default function AuthScreen() {
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

  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [isXLoading, setIsXLoading] = React.useState(false);
  const [isGithubLoading, setIsGithubLoading] = React.useState(false);
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);
  const [loginForm, setLoginForm] = React.useState({ email: '', password: '' });
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const buildGithubHeaders = React.useCallback(
    (token: string) => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    }),
    []
  );
  const handleLogin = React.useCallback(async () => {
    const trimmedEmail = loginForm.email.trim();
    const trimmedPassword = loginForm.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Inicio de sesión', 'Ingresa correo y contraseña para continuar.');
      return;

    }

    setIsLoginLoading(true);
    setLoginError(null);
    try {
      const user = await signInWithEmail({ email: trimmedEmail, password: trimmedPassword });
      await persistUserSession({
        id: user.uid,
        name: user.displayName || '',
        email: user.email || trimmedEmail,
        photoUrl: user.photoURL || undefined,
      });
      setLoginForm((current) => ({ ...current, password: '' }));
    } catch (error) {
      const message = normalizeFirebaseError(error);
      setLoginError(message);
      Alert.alert('Inicio de sesión', message);
    } finally {
      setIsLoginLoading(false);
    }
  }, [loginForm, persistUserSession]);

  const handleResetPassword = React.useCallback(async () => {
    const trimmedEmail = loginForm.email.trim();
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
  }, [loginForm.email]);

  React.useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === 'error') {
      Alert.alert('Autenticación con Google', 'La autenticación fue cancelada o falló. Intenta nuevamente.');
      return;
    }

    if (response.type === 'success') {
      setIsGoogleLoading(true);
      (async () => {
        const { id_token } = response.params;
        if (!id_token) {
          setIsGoogleLoading(false);
          Alert.alert('Autenticación con Google', 'No recibimos el token de Google. Intenta de nuevo.');
          return;
        }
        const userInfo = parseJwt(id_token) as Record<string, unknown>;
        const userId = typeof userInfo?.sub === 'string' && userInfo.sub.length ? (userInfo.sub as string) : (userInfo?.email as string) || '';

        if (!userId) {
          Alert.alert('Autenticación con Google', 'No pudimos obtener tu identificador. Intenta nuevamente.');
          setIsGoogleLoading(false);
          return;
        }

        const profileEmail = typeof userInfo?.email === 'string' && userInfo.email.length ? (userInfo.email as string) : `${userId}@googleuser.local`;
        const profileName = typeof userInfo?.name === 'string' ? (userInfo.name as string) : '';
        const profilePicture = typeof userInfo?.picture === 'string' ? (userInfo.picture as string) : '';

        router.replace({
          pathname: '/(tabs)/home',
          params: {
            email: profileEmail,
            name: profileName,
            picture: profilePicture,
          },
        });

        try {
          await persistUserSession(
            {
              id: userId,
              name: profileName,
              email: profileEmail,
              photoUrl: profilePicture,
            },
            { navigate: false }
          );
        } catch (error) {
          console.error('Error persisting Google session', error);
          Alert.alert('Autenticación con Google', 'No se pudo completar tu inicio de sesión. Intenta nuevamente.');
        } finally {
          setIsGoogleLoading(false);
        }
      })();
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

  const renderSocialButtons = () => (
    <View style={styles.socialRow}>
      <TouchableOpacity
        style={[styles.socialIconButton, (isGoogleLoading) && styles.buttonDisabled]}
        onPress={() => promptAsync(NATIVE_PROMPT_OPTIONS)}
        disabled={isGoogleLoading}
        activeOpacity={0.85}
      >
        {isGoogleLoading ? (
          <ActivityIndicator size="small" color="#e24334" />
        ) : (
          <FontAwesome5 name="google" size={22} color="#e24334" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.socialIconButton, (!isXConfigured || isXLoading || !xRequest) && styles.buttonDisabled]}
        onPress={() => {
          if (!isXConfigured) {
            Alert.alert(
              'Configuración requerida',
              'Define EXPO_PUBLIC_X_CLIENT_ID en tu .env antes de intentar iniciar sesión con X.'
            );
            return;
          }
          promptXAsync?.(NATIVE_PROMPT_OPTIONS).catch(console.error);
        }}
        disabled={!isXConfigured || !xRequest || isXLoading}
        activeOpacity={0.85}
      >
        {isXLoading ? (
          <ActivityIndicator size="small" color="#111" />
        ) : (
          <MaterialCommunityIcons name="alpha-x" size={24} color="#111" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.socialIconButton, (!isGithubConfigured || !githubRequest || isGithubLoading) && styles.buttonDisabled]}
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
          <ActivityIndicator size="small" color="#111" />
        ) : (
          <FontAwesome5 name="github" size={22} color="#111" />
        )}

      </TouchableOpacity>
    </View>
  );
  const goToRegister = React.useCallback(() => router.push('/register'), []);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
  <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Inicio de sesión</Text>
          <Text style={styles.loginSubtitle}>¡Un placer tenerte de vuelta!</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={loginForm.email}
            onChangeText={(text) => setLoginForm((current) => ({ ...current, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor="#9aa1b2"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={loginForm.password}
            onChangeText={(text) => setLoginForm((current) => ({ ...current, password: text }))}
            secureTextEntry
            placeholderTextColor="#9aa1b2"
            returnKeyType="done"
          />
          {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
          <TouchableOpacity
            style={[styles.primaryButton, isLoginLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoginLoading}
          >
            {isLoginLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Iniciar sesión</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetPassword} style={styles.linkButton}>
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ó</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.sectionLabel}>Continuar con</Text>
          {renderSocialButtons()}
          <TouchableOpacity onPress={goToRegister} style={styles.inlineLink}>
            <Text style={styles.inlineText}>
              ¿No tienes cuenta? <Text style={styles.inlineHighlight}>Crear cuenta</Text>
            </Text>
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
  loginCard: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 12,
    paddingVertical: 24,
    rowGap: 14,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4caf50',
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 6,
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
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  sectionLabel: {
    textAlign: 'center',
    color: '#4b5563',
    fontWeight: '600',
    marginBottom: 6,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 18,
    marginBottom: 8,
  },
  socialIconButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  inlineLink: {
    alignItems: 'center',
    marginTop: 6,
  },
  inlineText: {
    color: '#6b7280',
    fontSize: 14,
  },
  inlineHighlight: {
    color: '#4caf50',
    fontWeight: '700',
  },
});