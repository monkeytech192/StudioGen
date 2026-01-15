
import { User } from '../types';

// In-memory user store (simulates a database)
const users: { [key: string]: { password: string; user: User } } = {
  'user@example.com': {
    password: 'password123',
    user: {
      name: 'Demo User',
      email: 'user@example.com',
      phone: '0123456789',
      avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=Demo%20User',
      dob: '1990-01-01',
      identifierType: 'email',
    },
  },
};

const SESSION_KEY = 'studioGenUser';

// Simulates API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const signUp = async (identifier: string, password: string, fullName?: string): Promise<User> => {
  await delay(1000);
  if (users[identifier]) {
    throw new Error('An account with this email or phone already exists.');
  }

  const isEmail = identifier.includes('@');
  // Use provided Full Name or fallback to identifier
  const name = fullName || (isEmail ? identifier.split('@')[0] : `User${Math.floor(Math.random() * 1000)}`);
  
  const newUser: User = {
    name: name,
    email: isEmail ? identifier : '',
    phone: isEmail ? '' : identifier,
    avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${name}`,
    dob: '',
    identifierType: isEmail ? 'email' : 'phone',
  };

  users[identifier] = { password, user: newUser };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const login = async (identifier: string, password: string): Promise<User> => {
  await delay(1000);
  const existingUser = users[identifier];
  if (!existingUser || existingUser.password !== password) {
    throw new Error('Invalid credentials. Please try again.');
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(existingUser.user));
  return existingUser.user;
};

export const googleLogin = async (): Promise<User> => {
    await delay(1000);
    const googleUser: User = {
        name: 'Google User',
        email: 'google.user@example.com',
        phone: '',
        avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Google%20User`,
        dob: '',
        identifierType: 'email'
    };
    if (!users[googleUser.email]) {
        users[googleUser.email] = { password: 'google_user_pwd', user: googleUser };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(googleUser));
    return googleUser;
}

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(SESSION_KEY);
  if (!userJson) {
    return null;
  }
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    console.error("Failed to parse user from session storage", e);
    return null;
  }
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    await delay(500);
    const identifier = updatedUser.identifierType === 'email' ? updatedUser.email : updatedUser.phone || '';
    if (users[identifier]) {
        users[identifier].user = updatedUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        return updatedUser;
    }
    throw new Error('User not found.');
};

export const changePassword = async (email: string, oldPassword: string, newPassword: string): Promise<void> => {
    await delay(1000);
    const existingUser = users[email];

    if (!existingUser) {
        throw new Error('User not found.');
    }

    if (existingUser.password !== oldPassword) {
        throw new Error('Current password does not match.');
    }

    users[email].password = newPassword;
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
    await delay(1500);
    // Mock functionality
    return; 
};
