import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    const validUsername = 'testuser';
    const validPassword = 'password123';

    it('should successfully login with correct credentials', async () => {
      const result = await authService.login(validUsername, validPassword);
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toContain(`token_for_${validUsername}`);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      await expect(authService.login('nonexistent', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      await expect(authService.login(validUsername, 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle edge cases with empty credentials', async () => {
      await expect(authService.login('', ''))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});