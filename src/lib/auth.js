import { apiRequest, AUTH_STORAGE_KEY, getStoredSession, unwrapApiData } from './api';

function mapRole(user = {}) {
  if (user.isSuper || user.userType === 'super' || user.role === 'super_admin') return 'super_admin';
  if (user.userType === 'support' || user.role === 'support_agent') return 'support_agent';
  if (user.userType === 'admin' || user.role === 'ops_admin') return 'ops_admin';
  if (Array.isArray(user.permissions) && user.permissions.includes('*')) return 'super_admin';
  return 'ops_admin';
}

function normalizeSession(payload) {
  const data = unwrapApiData(payload) || {};
  const token = data.token || data.accessToken || data.access_token || payload?.token;
  const user = data.user || data.profile || data;
  const profile = {
    ...user,
    id: user.id || user._id,
    full_name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ').trim() || user.userName || user.email,
    email: user.email,
    phone: user.phoneNumber || user.phone,
    role: mapRole(user),
  };

  return {
    token,
    user: { id: profile.id, email: profile.email, phone: profile.phone },
    profile,
    role: profile.role,
  };
}

export async function getAdminSession() {
  const stored = getStoredSession();
  if (!stored?.token) return null;
  return stored;
}

export async function signIn(identifier, password) {
  const phoneNumber = identifier.trim();
  const payload = await apiRequest('/api/v1/auth/sign_in', {
    method: 'POST',
    body: { phoneNumber, password },
  });
  const sessionData = normalizeSession(payload);

  if (!sessionData.token) {
    throw new Error('Login succeeded but no auth token was returned.');
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  return { data: sessionData, error: null };
}

export async function mockSignIn(identifier, password) {
  return signIn(identifier, password);
}

export async function signOut() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  return { error: null };
}

export async function mockSignOut() {
  return signOut();
}
