import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { createUser } from '@/api/users';
import { useAuth } from '@/auth/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Routes } from '@/constants/routes';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { UserForm, type UserFormValues } from '@/features/users/user-form';
import type { UserRole } from '@/types/user';

export default function NewUserScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const canManage = user?.role === 'admin' || user?.role === 'manager';
  const roles: UserRole[] = isAdmin ? ['admin', 'manager', 'client'] : ['client'];

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: UserFormValues) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createUser({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: isAdmin ? values.role : 'client',
        status: values.status,
      });
      router.replace(Routes.users);
    } catch (err) {
      setError(
        err instanceof ApiError ? (err.firstError() ?? err.message) : 'Création impossible.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!canManage) {
    return null;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedView style={styles.header}>
              <Button label="Retour" variant="secondary" onPress={() => router.back()} />
              <ThemedText type="subtitle">Nouvel utilisateur</ThemedText>
            </ThemedView>

            <UserForm
              roles={roles}
              lockRole={!isAdmin}
              requirePassword
              submitLabel="Créer l’utilisateur"
              submitting={submitting}
              error={error}
              onSubmit={(values) => void handleSubmit(values)}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.three,
  },
});
