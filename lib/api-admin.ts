/**
 * Admin API Client Functions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Helper to get admin auth token (separate from user token)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin-token');
}

// Helper to set admin auth token
function setAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin-token', token);
  }
}

// Helper to remove admin auth token
export function removeAdminToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin-token');
  }
}

// Helper to handle API response and check for 401 errors
async function handleApiResponse<T>(response: Response): Promise<T> {
  // If 401 Unauthorized, logout admin and redirect to login
  if (response.status === 401) {
    // Clear admin auth data only (don't touch user auth data)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      // Don't remove auth-token or auth-user (those are for regular users)
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    throw new Error('Unauthorized - Please login again');
  }
  
  return response.json();
}

// Admin Statistics
export async function getAdminStats() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Admin Transactions
export async function getAdminTransactions(filters?: {
  type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}) {
  const token = getAuthToken();
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/admin/transactions?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function getAdminTransactionDetail(id: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/transactions/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function approveTransaction(id: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/transactions/${id}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
}

export async function rejectTransaction(id: string, reason?: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/transactions/${id}/reject`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });
  return handleApiResponse(response);
}

// Admin Users
export async function getAdminUsers(filters?: {
  search?: string;
  tier_level?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
}) {
  const token = getAuthToken();
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.tier_level !== undefined) params.append('tier_level', filters.tier_level.toString());
  if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function getAdminUserDetail(id: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function updateAdminUser(id: string, data: { tier_level?: number; is_active?: boolean }) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

// Manual Balance Adjustment
export async function adjustUserBalance(
  userId: string,
  data: {
    walletType: 'DEPOSIT_LOCKED' | 'AVAILABLE';
    action: 'ADD' | 'CUT';
    amount: number;
    notes?: string;
    triggerBonus?: boolean;
  }
) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/adjust-balance`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

// User Actions
export async function banUser(userId: string, banned: boolean) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ banned }),
  });
  return handleApiResponse(response);
}

export async function resetUserPassword(userId: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
}

// Network Viewer
export async function getUserNetwork(userId: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/network`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Task Management
export async function getAdminTasks() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function getAdminTask(id: number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/tasks/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function updateAdminTask(
  id: number,
  data: {
    title?: string;
    description?: string;
    target_url?: string;
    icon_url?: string;
    is_active?: boolean;
  }
) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function uploadTaskIcon(id: number, iconBase64: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/tasks/${id}/upload-icon`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ icon_base64: iconBase64 }),
  });
  return handleApiResponse(response);
}

export async function initializeTasks() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/tasks/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
}

// Company Bank Management
export async function getAdminBanks() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/banks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function createAdminBank(data: {
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_active?: boolean;
}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/banks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function updateAdminBank(id: number, data: {
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  is_active?: boolean;
}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/banks/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function toggleAdminBank(id: number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/banks/${id}/toggle`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
}

export async function deleteAdminBank(id: number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/banks/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Contact Center Management
export async function getAdminContacts() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/contacts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function createAdminContact(data: {
  title: string;
  number: string;
  type: string;
  sequence?: number;
  is_active?: boolean;
}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function updateAdminContact(id: number, data: {
  title?: string;
  number?: string;
  type?: string;
  sequence?: number;
  is_active?: boolean;
}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/contacts/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function toggleAdminContact(id: number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/contacts/${id}/toggle`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
}

export async function deleteAdminContact(id: number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/contacts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Admin Management (Super Admin Only)
export async function getAdmins() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/admins`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function createAdmin(data: {
  email: string;
  password: string;
  admin_role: 'SUPER_ADMIN' | 'ADMIN';
}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/admins`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function updateAdminRole(id: string, admin_role: 'SUPER_ADMIN' | 'ADMIN') {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ admin_role }),
  });
  return handleApiResponse(response);
}

export async function deleteAdmin(id: string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

