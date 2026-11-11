import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { getUser, updateUser } from '@/api/users';
import { useAuth } from '@/auth/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Routes } from '@/constants/routes';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { UserForm, type UserFormValues } from '@/features/users/user-form';
import type { UpdateUserInput, User, UserRole } from '@/types/user';

export default function EditUserScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const userId = Number(params.id);
  const isAdmin = user?.role === 'admin';
  const canManage = user?.role === 'admin' || user?.role === 'manager';
  const roles: UserRole[] = isAdmin ? ['admin', 'manager', 'client'] : ['client'];

  const [target, setTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage || !Number.isFinite(userId)) {
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getUser(userId);

        if (!active) {
          return;
        }

        if (!isAdmin && data.role !== 'client') {
          router.replace(Routes.users);
          return;
        }

        setTarget(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError ? (err.firstError() ?? err.message) : 'Impossible de charger cet utilisateur.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [canManage, isAdmin, router, userId]);

  async function handleSubmit(
    values: UserFormValues,
    options: { includePassword: boolean }
  ) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: UpdateUserInput = {
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      status: values.status,
    };

    if (isAdmin) {
      payload.role = values.role;
    }

    if (options.includePassword) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    try {
      await updateUser(userId, payload);
      router.replace(Routes.users);
    } catch (err) {
      setError(
        err instanceof ApiError ? (err.firstError() ?? err.message) : 'Modification impossible.'
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
              <ThemedText type="subtitle">Modifier l’utilisateur</ThemedText>
            </ThemedView>

            {loading ? <ActivityIndicator /> : null}

            {!loading && error && !target ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            {target ? (
              <UserForm
                initialValues={{
                  name: target.name,
                  email: target.email,
                  phone: target.phone ?? '',
                  role: target.role,
                  status: target.status,
                }}
                roles={roles}
                lockRole={!isAdmin}
                submitLabel="Enregistrer les modifications"
                submitting={submitting}
                error={error}
                onSubmit={(values, options) => void handleSubmit(values, options)}
              />
            ) : null}
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
  error: {
    color: '#DC2626',
  },
});
