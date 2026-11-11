import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ChipSelect, type ChipOption } from '@/components/ui/chip-select';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { UserRole, UserStatus } from '@/types/user';

export interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  status: UserStatus;
}

interface UserFormProps {
  initialValues?: Partial<UserFormValues>;
  roles: UserRole[];
  lockRole?: boolean;
  requirePassword?: boolean;
  submitLabel: string;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: UserFormValues, options: { includePassword: boolean }) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gérant',
  client: 'Client',
};

const STATUS_OPTIONS: ChipOption<UserStatus>[] = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

export function UserForm({
  initialValues,
  roles,
  lockRole = false,
  requirePassword = false,
  submitLabel,
  submitting = false,
  error,
  onSubmit,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>({
    name: initialValues?.name ?? '',
    email: initialValues?.email ?? '',
    phone: initialValues?.phone ?? '',
    password: '',
    password_confirmation: '',
    role: initialValues?.role ?? roles[0],
    status: initialValues?.status ?? 'active',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const roleOptions: ChipOption<UserRole>[] = roles.map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  }));

  function update<K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    const includePassword = requirePassword || values.password.length > 0;

    if (!values.name.trim() || !values.email.trim()) {
      setLocalError('Le nom et l’email sont obligatoires.');
      return;
    }

    if (includePassword && values.password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (includePassword && values.password !== values.password_confirmation) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLocalError(null);
    onSubmit(
      {
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      },
      { includePassword }
    );
  }

  const message = localError ?? error;

  return (
    <ThemedView style={styles.form}>
      <TextField
        label="Nom complet"
        value={values.name}
        onChangeText={(value) => update('name', value)}
        placeholder="Nom de l’utilisateur"
      />
      <TextField
        label="Email"
        value={values.email}
        onChangeText={(value) => update('email', value)}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="utilisateur@exemple.com"
      />
      <TextField
        label="Téléphone (optionnel)"
        value={values.phone}
        onChangeText={(value) => update('phone', value)}
        keyboardType="phone-pad"
        placeholder="+221 77 000 00 00"
      />

      {!lockRole ? (
        <ChipSelect
          label="Rôle"
          options={roleOptions}
          value={values.role}
          onChange={(value) => update('role', value)}
        />
      ) : null}

      <ChipSelect
        label="Statut"
        options={STATUS_OPTIONS}
        value={values.status}
        onChange={(value) => update('status', value)}
      />

      <TextField
        label={requirePassword ? 'Mot de passe' : 'Nouveau mot de passe (optionnel)'}
        value={values.password}
        onChangeText={(value) => update('password', value)}
        secureTextEntry
        autoCapitalize="none"
        placeholder="Minimum 8 caractères"
      />
      <TextField
        label="Confirmer le mot de passe"
        value={values.password_confirmation}
        onChangeText={(value) => update('password_confirmation', value)}
        secureTextEntry
        autoCapitalize="none"
        placeholder="Répétez le mot de passe"
      />

      {message ? (
        <ThemedText type="small" style={styles.error}>
          {message}
        </ThemedText>
      ) : null}

      <Button label={submitLabel} onPress={handleSubmit} loading={submitting} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  error: {
    color: '#DC2626',
  },
});
