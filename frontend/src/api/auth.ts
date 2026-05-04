import api from './client';

export const loginApi = (usernameOrEmail: string, password: string) =>
  api.post('/auth/login', { username_or_email: usernameOrEmail, password });

export const registerApi = (username: string, email: string, password: string) =>
  api.post('/auth/register', { username, email, password });

export const logoutApi = async () => {
  return Promise.resolve();
};
