// services/authService.js
// Safe Demo Mode Replacement (Local/Offline)

export async function signUp({ name, email, password, phone }) {
  return new Promise((resolve) => setTimeout(() => resolve({ userConfirmed: true }), 500));
}

export async function confirmSignUp({ email, code }) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function resendConfirmationCode({ email }) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function signIn({ email, password }) {
  return new Promise((resolve) => setTimeout(() => resolve({ accessToken: "demo_token" }), 500));
}

export function signOut({ email }) {
  return;
}

export async function forgotPassword({ email }) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function confirmPassword({ email, code, newPassword }) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function getUserAttributes() {
  return new Promise((resolve) => resolve({
    email: "demo@wheretogo.com",
    name: "Demo Traveler",
  }));
}
