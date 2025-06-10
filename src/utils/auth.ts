import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'nci-attendance-app-secret-key-2025';
const TOKEN_EXPIRY = '7d';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { 
      userId, 
      email, 
      role,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};