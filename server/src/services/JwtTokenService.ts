import jwt, { Algorithm, SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  userRole: string;
}

/**
 * Service for handling JWT tokens.
 * Provides methods to generate, verify, and manage JWT tokens.
 */
export class JwtTokenService {
  static generateToken(userId: string, userRole: string): string {
    const payload = { userId, userRole };
    const secret = process.env.JWT_SECRET as string;
    const options: SignOptions = { algorithm: 'HS256' as Algorithm, expiresIn: '1d' }; // Token expires in 1 day

    return jwt.sign(payload, secret, options);
  }

  static verifyToken(token: string): JwtPayload | null {
    try {
      const secret = process.env.JWT_SECRET as string;
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
      
      if (typeof decoded === 'object' && 'userId' in decoded && 'userRole' in decoded) {
        return decoded as JwtPayload; // Return the decoded payload if it matches the expected structure
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static getTokenFromHeaders(headers: any): string | null {
    const authHeader = headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1]; // Return the token part
    }
    return null;
  }

  static getTokenFromCookies(cookies: any): string | null {
    if (cookies && cookies.token) {
      return cookies.token;
    }
    return null;
  }

  static getTokenFromRequest(req: any): string | null {
    // Check headers first
    let token = this.getTokenFromHeaders(req.headers);
    if (token) {
      return token;
    }
    
    // If not found in headers, check cookies
    token = this.getTokenFromCookies(req.cookies);
    return token; // Return the token from cookies or null if not found
  }

  static setTokenInHeaders(res: any, token: string): void {
    res.setHeader('Authorization', `Bearer ${token}`);
  }
  
  static setTokenInCookies(res: any, token: string): void {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
  }

  static clearTokenInCookies(res: any): void {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  static clearTokenInHeaders(res: any): void {
    res.setHeader('Authorization', ''); // Clear the Authorization header
  }

  static clearToken(res: any): void {
    this.clearTokenInCookies(res);
    this.clearTokenInHeaders(res);
  }

}
