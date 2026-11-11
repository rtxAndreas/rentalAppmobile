import type { Href } from 'expo-router';

export const Routes = {
  login: '/(auth)/login' as Href,
  register: '/(auth)/register' as Href,
  app: '/(app)' as Href,
  users: '/(app)/users' as Href,
  newUser: '/(app)/users/new' as Href,
  user: (id: number) => `/(app)/users/${id}` as Href,
};
