import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDTO } from './dto/register-user.dto';
import { IUserModel, User } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: IUserModel,
    private readonly configService: ConfigService,
  ) {}

  async findById(id: string): Promise<User | undefined> {
    return await this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return await this.userModel.findOne({ username });
  }

  async findOneByClientId(clientId: string): Promise<User | undefined> {
    return await this.userModel.findOne({ clientId });
  }

  async register(registerUserDTO: RegisterUserDTO) {
    const { username, email, password } = registerUserDTO;

    const userByUsername = await this.findByUsername(username);
    if (userByUsername) {
      throw new BadRequestException('Username is already taken');
    }

    const userByEmail = await this.findByEmail(email);
    if (userByEmail) {
      throw new BadRequestException('Email is already taken');
    }

    const user = await this.userModel.create({
      username,
      email,
      password,
      clientId: crypto
        .randomBytes(
          parseInt(this.configService.get<string>('CLIENT_ID_SIZE')) || 32,
        )
        .toString('base64'),
      clientSecret: null,
    });
    await this.generateClientSecret(user.id);
    return user;
  }

  async generateClientSecret(userId: string): Promise<any> {
    const clientSecret: string = crypto
      .randomBytes(
        parseInt(this.configService.get<string>('CLIENT_SECRET_SIZE')) || 64,
      )
      .toString('base64');
    const hashClientSecret = await bcrypt.hash(clientSecret, 10);
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { clientSecret: hashClientSecret },
      { new: true },
    );
    return {
      userId,
      clientId: user.clientId,
      clientSecret,
    };
  }
}
