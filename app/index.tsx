import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, useAuthRequest, ResponseType, exchangeCodeAsync, AuthRequestPromptOptions } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

const X_DISCOVERY = {
  authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
  tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
  revocationEndpoint: 'https://api.twitter.com/2/oauth2/revoke',
};

const X_SCOPES = ['tweet.read', 'users.read', 'offline.access'];

type NativePromptOptions = AuthRequestPromptOptions & { useProxy?: boolean };
const NATIVE_PROMPT_OPTIONS: NativePromptOptions = { useProxy: false };

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
  const xClientId = process.env.EXPO_PUBLIC_X_CLIENT_ID;
  const isXConfigured = Boolean(xClientId);

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

  const [isXLoading, setIsXLoading] = React.useState(false);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TouchableOpacity 
        style={styles.googleButton} 
        onPress={() => promptAsync(NATIVE_PROMPT_OPTIONS)}>
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
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
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 5,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    marginTop: 12,
    width: '70%',
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
});
