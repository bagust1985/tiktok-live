/**
 * API Client Functions
 * Backend API integration with Bun.js/ElysiaJS
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  referral_code: string;
}

export interface DepositRequest {
  tier_level: 1 | 2 | 3;
  amount: number;
  proof_image: File;
  notes?: string;
}

export interface WithdrawRequest {
  amount: number;
  bank_name: string;
  bank_account: string;
  account_name: string;
}

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth-token');
}

// Helper to set auth token
function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
  }
}

// Helper to remove auth token
export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
  }
}

// Helper to handle API response and check for 401 errors
async function handleApiResponse<T>(response: Response): Promise<T> {
  // If 401 Unauthorized, logout user and redirect to login
  if (response.status === 401) {
    // Clear auth data
    removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    throw new Error('Unauthorized - Please login again');
  }
  
  return response.json();
}

// Auth APIs
export async function login(data: LoginRequest) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  
  // Store token if login successful
  if (result.success && result.token) {
    setAuthToken(result.token);
  }
  
  return result;
}

export async function register(data: RegisterRequest) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  
  // Store token if registration successful
  if (result.success && result.token) {
    setAuthToken(result.token);
  }
  
  return result;
}

// Task APIs
export async function claimTask() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/task/claim`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return handleApiResponse(response);
}

export async function getTaskStatus() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/task/status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Get task configurations (for user task page)
export async function getTaskConfigs() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/task/configs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Wallet APIs
export async function getWalletBalance() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function deposit(data: DepositRequest) {
  const token = getAuthToken();
  
  // Convert file to base64 for now (in production, handle file upload properly)
  const proofBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(data.proof_image);
  });

  const response = await fetch(`${API_BASE_URL}/wallet/deposit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tier_level: data.tier_level,
      amount: data.amount,
      proof_image: proofBase64,
      notes: data.notes,
    }),
  });
  return handleApiResponse(response);
}

export async function withdraw(data: WithdrawRequest) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function getTransactions(filters?: { type?: string; status?: string }) {
  const token = getAuthToken();
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  
  const response = await fetch(`${API_BASE_URL}/wallet/transactions?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Network APIs
export async function getNetworkStats() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/network/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

// Public Settings APIs
export async function getPublicBanks() {
  const response = await fetch(`${API_BASE_URL}/public/banks`);
  return handleApiResponse(response);
}

export async function getPublicContacts() {
  const response = await fetch(`${API_BASE_URL}/public/contacts`);
  return handleApiResponse(response);
}

// User APIs
export async function getUserProfile() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
}

export async function updateProfile(data: { full_name?: string; phone?: string }) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function changePassword(data: { oldPassword: string; newPassword: string }) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/change-password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function uploadAvatar(file: File) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE_URL}/user/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type, let browser set it with boundary for FormData
    },
    body: formData,
  });
  return handleApiResponse(response);
}

export async function updatePin(data: { pin: string; confirmPin: string }) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/pin`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

