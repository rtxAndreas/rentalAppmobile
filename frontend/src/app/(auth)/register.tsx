import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Routes } from '@/constants/routes';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Veuillez remplir le nom, l’email et le mot de passe.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);

    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.firstError() ?? err.message)
          : 'Inscription impossible. Vérifiez votre connexion réseau.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <ThemedView style={styles.header}>
              <ThemedText type="subtitle" style={styles.title}>
                Créer un compte
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Rejoignez RentalApp en quelques secondes
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.form}>
              <TextField
                label="Nom complet"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                placeholder="Votre nom"
              />
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="vous@exemple.com"
              />
              <TextField
                label="Téléphone (optionnel)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+221 77 000 00 00"
              />
              <TextField
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Minimum 8 caractères"
              />
              <TextField
                label="Confirmer le mot de passe"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Répétez le mot de passe"
              />

              {error ? (
                <ThemedText type="small" style={styles.error}>
                  {error}
                </ThemedText>
              ) : null}

              <Button label="Créer mon compte" onPress={handleSubmit} loading={submitting} />
            </ThemedView>

            <ThemedView style={styles.footer}>
              <ThemedText type="small" themeColor="textSecondary">
                Déjà un compte ?
              </ThemedText>
              <Button
                label="Se connecter"
                variant="secondary"
                onPress={() => router.replace(Routes.login)}
              />
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.five,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  footer: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  error: {
    color: '#DC2626',
  },
});
