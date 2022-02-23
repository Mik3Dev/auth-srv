import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { IUserModel, User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { RegisterUserDTO } from './dto/register-user.dto';

describe('User Service', () => {
  let usersService: UsersService;
  let mockUserModel: Partial<IUserModel>;
  let mockConfigService: Partial<ConfigService>;
  const mockUser: User = {
    username: 'username',
    email: 'test@test.com',
    clientId: '123',
    clientSecret: 'abc',
    isActive: true,
    password: 'password',
  };
  const mockRegisterUserDto: RegisterUserDTO = {
    email: 'test@test.com',
    password: '123',
    username: 'test',
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue(32).mockReturnValue(64),
    };

    mockUserModel = {
      findById: jest.fn().mockReturnValue(mockUser),
      findOne: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue({ id: '1', ...mockUser }),
      createClientSecret: jest.fn().mockResolvedValue('clientSecret'),
      findByIdAndUpdate: jest.fn().mockResolvedValue({ id: '1', ...mockUser }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findById', () => {
    it('should return a single user by id', async () => {
      const id = '1';
      const user = await usersService.findById(id);
      expect(user).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('findByEmail', () => {
    it('should return a single user by email', async () => {
      const email = 'test@test.com';
      const user = await usersService.findByEmail(email);
      expect(user).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('findByUsername', () => {
    it('should return a single user by username', async () => {
      const username = 'username';
      const user = await usersService.findByUsername(username);
      expect(user).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
    });
  });

  describe('findOneByClientId', () => {
    it('should return a single user by username', async () => {
      const clientId = 'clientId';
      const user = await usersService.findOneByClientId(clientId);
      expect(user).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ clientId });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockUserModel.findOne = jest.fn().mockResolvedValue(null);
      usersService.generateClientSecret = jest.fn().mockResolvedValue({});
      const user = await usersService.register(mockRegisterUserDto);
      expect(user).toEqual({
        id: '1',
        username: 'username',
        email: 'test@test.com',
        isActive: true,
        password: expect.any(String),
        clientId: expect.any(String),
        clientSecret: expect.any(String),
      });
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: mockRegisterUserDto.username,
        email: mockRegisterUserDto.email,
        password: mockRegisterUserDto.password,
        clientId: expect.any(String),
        clientSecret: null,
      });
      expect(usersService.generateClientSecret).toHaveBeenCalledWith('1');
    });

    it('should return bad request exception if the email already exists', async () => {
      try {
        await usersService.register(mockRegisterUserDto);
      } catch (e) {
        expect(e.response.statusCode).toBe(400);
        expect(e.response.message).toBe('Username is already taken');
      }
    });

    it('should return bad request exception if the username already exists', async () => {
      mockUserModel.findOne = jest
        .fn()
        .mockResolvedValue(mockUser)
        .mockResolvedValue(null);
      try {
        await usersService.register(mockRegisterUserDto);
      } catch (e) {
        expect(e.response.statusCode).toBe(400);
        expect(e.response.message).toBe('Email is already taken');
      }
    });
  });

  describe('generateClientSecret', () => {
    it('should generate a client secret', async () => {
      mockConfigService.get = jest.fn().mockReturnValue(64);
      const clientSecret = await usersService.generateClientSecret('1');
      expect(clientSecret).toEqual({
        userId: '1',
        clientId: mockUser.clientId,
        clientSecret: expect.any(String),
      });
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { clientSecret: expect.any(String) },
        { new: true },
      );
    });
  });
});
