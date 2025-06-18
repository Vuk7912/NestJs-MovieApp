import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  private users: User[] = [
    {
      id: 1,
      username: 'testuser',
      password: this.hashPassword('password123'), // pre-hash for testing
    },
  ];

  private hashPassword(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const user = this.users.find(u => u.username === username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In a real implementation, you would generate a JWT here
    return { access_token: `token_for_${username}` };
  }
}