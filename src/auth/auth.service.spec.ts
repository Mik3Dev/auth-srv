import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';

const hashPassword = async (pwd: string) => {
  return await bcrypt.hash(pwd, 10);
};

describe('Auth Service', () => {
  let authService: AuthService;

  const mockUserService: Partial<UsersService> = {
    findByUsername: jest.fn().mockImplementation(async (username) => {
      return {
        username: username,
        email: 'test@test.com',
        password: await hashPassword('123'),
        clientId: '123456',
        clientSecret: await hashPassword('abcdef'),
      } as User;
    }),
    findOneByClientId: jest.fn().mockImplementation(async (clientId) => {
      return {
        username: 'test',
        email: 'test@test.com',
        password: await hashPassword('123'),
        clientId: clientId,
        clientSecret: await hashPassword('abcdef'),
      } as User;
    }),
  };
  const mockJwtService: Partial<JwtService> = {
    sign: jest.fn().mockReturnValue('access_token'),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user', async () => {
      const user = await authService.validateUser('test', '123');
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('test');
      expect(user).toBeDefined();
    });

    it('should return null if does not find a user', async () => {
      mockUserService.findByUsername = jest.fn().mockResolvedValue(null);
      const user = await authService.validateUser('test', '123');
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('test');
      expect(user).toBeNull();
    });

    it('should return null if the password does not match', async () => {
      const user = await authService.validateUser('test', '1234');
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('test');
      expect(user).toBeNull();
    });
  });

  describe('ValidateUserByClientId', () => {
    it('should validate a user', async () => {
      const user = await authService.ValidateUserByClientId('123', 'abcdef');
      expect(mockUserService.findOneByClientId).toHaveBeenCalledWith('123');
      expect(user).toBeDefined();
    });

    it('should return null if does not find a user', async () => {
      mockUserService.findOneByClientId = jest.fn().mockResolvedValue(null);
      const user = await authService.ValidateUserByClientId('123', 'abcdef');
      expect(mockUserService.findOneByClientId).toHaveBeenCalledWith('123');
      expect(user).toBeNull();
    });

    it('should return null if the password does not match', async () => {
      const user = await authService.ValidateUserByClientId('123', 'abcdef');
      expect(mockUserService.findOneByClientId).toHaveBeenCalledWith('123');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token when login', async () => {
      const user = { id: '111', username: 'test' };
      const data = await authService.login(user);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: 'test',
        sub: '111',
      });
      expect(data).toEqual({
        access_token: expect.any(String),
      });
    });
  });
});
