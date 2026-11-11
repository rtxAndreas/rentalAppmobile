import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { deleteUser, listUsers } from '@/api/users';
import { useAuth } from '@/auth/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ChipSelect, type ChipOption } from '@/components/ui/chip-select';
import { TextField } from '@/components/ui/text-field';
import { Routes } from '@/constants/routes';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import type { PaginationMeta, User, UserRole, UserStatus } from '@/types/user';

type RoleFilter = 'all' | UserRole;
type StatusFilter = 'all' | UserStatus;

const ROLE_FILTERS: ChipOption<RoleFilter>[] = [
  { value: 'all', label: 'Tous' },
  { value: 'admin', label: 'Admins' },
  { value: 'manager', label: 'Gérants' },
  { value: 'client', label: 'Clients' },
];

const STATUS_FILTERS: ChipOption<StatusFilter>[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'inactive', label: 'Inactifs' },
];

export default function UsersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    if (!canManage) {
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await listUsers({
        search: search.trim() || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        per_page: 10,
      });

      if (requestId !== requestRef.current) {
        return;
      }

      setUsers(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (requestId !== requestRef.current) {
        return;
      }

      setError(
        err instanceof ApiError ? (err.firstError() ?? err.message) : 'Impossible de charger les utilisateurs.'
      );
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [canManage, page, roleFilter, search, statusFilter]);

  useEffect(() => {
    if (user && !canManage) {
      router.replace(Routes.app);
    }
  }, [canManage, router, user]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      if (!canManage) {
        return;
      }

      const timer = setTimeout(() => {
        void load();
      }, 250);

      return () => clearTimeout(timer);
    }, [canManage, load])
  );

  async function handleDelete(id: number) {
    setDeletingId(id);

    try {
      await deleteUser(id);
      setConfirmId(null);

      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        void load();
      }
    } catch (err) {
      setError(err instanceof ApiError ? (err.firstError() ?? err.message) : 'Suppression impossible.');
    } finally {
      setDeletingId(null);
    }
  }

  if (!user || !canManage) {
    return null;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={loading && users.length > 0} onRefresh={() => void load()} />
          }>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Utilisateurs</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {meta ? `${meta.total} utilisateur(s)` : ' '}
            </ThemedText>
          </ThemedView>

          <Button
            label="Nouvel utilisateur"
            onPress={() => router.push(Routes.newUser)}
          />

          <TextField
            label="Rechercher"
            value={search}
            onChangeText={setSearch}
            placeholder="Nom ou email"
          />

          {isAdmin ? (
            <ChipSelect
              label="Rôle"
              options={ROLE_FILTERS}
              value={roleFilter}
              onChange={setRoleFilter}
            />
          ) : null}

          <ChipSelect
            label="Statut"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          {error ? (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          {loading && users.length === 0 ? <ActivityIndicator /> : null}

          {!loading && users.length === 0 ? (
            <ThemedText themeColor="textSecondary">Aucun utilisateur trouvé.</ThemedText>
          ) : null}

          {users.map((item) => (
            <ThemedView key={item.id} type="backgroundElement" style={styles.card}>
              <ThemedView style={styles.cardHeader}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.role_label} · {item.status_label}
                </ThemedText>
              </ThemedView>

              <ThemedText type="small" themeColor="textSecondary">
                {item.email}
              </ThemedText>
              {item.phone ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {item.phone}
                </ThemedText>
              ) : null}

              <ThemedView style={styles.actions}>
                {confirmId === item.id ? (
                  <>
                    <Button
                      label="Confirmer"
                      style={styles.actionButton}
                      loading={deletingId === item.id}
                      onPress={() => void handleDelete(item.id)}
                    />
                    <Button
                      label="Annuler"
                      variant="secondary"
                      style={styles.actionButton}
                      disabled={deletingId === item.id}
                      onPress={() => setConfirmId(null)}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      label="Modifier"
                      variant="secondary"
                      style={styles.actionButton}
                      onPress={() => router.push(Routes.user(item.id))}
                    />
                    {item.id !== user.id ? (
                      <Button
                        label="Supprimer"
                        variant="secondary"
                        style={styles.actionButton}
                        onPress={() => setConfirmId(item.id)}
                      />
                    ) : null}
                  </>
                )}
              </ThemedView>
            </ThemedView>
          ))}

          {meta && meta.last_page > 1 ? (
            <ThemedView style={styles.pagination}>
              <Button
                label="Précédent"
                variant="secondary"
                style={styles.actionButton}
                disabled={meta.current_page <= 1 || loading}
                onPress={() => setPage((current) => Math.max(1, current - 1))}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Page {meta.current_page}/{meta.last_page}
              </ThemedText>
              <Button
                label="Suivant"
                variant="secondary"
                style={styles.actionButton}
                disabled={meta.current_page >= meta.last_page || loading}
                onPress={() => setPage((current) => current + 1)}
              />
            </ThemedView>
          ) : null}
        </ScrollView>
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
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.half,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardHeader: {
    gap: Spacing.half,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  error: {
    color: '#DC2626',
  },
});
