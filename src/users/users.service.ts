import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterUserDTO } from './dto/register-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return await this.userModel.findOne({ username });
  }

  async register(registerUserDTO: RegisterUserDTO) {
    const { username, email, password } = registerUserDTO;
    const user = new this.userModel({
      username,
      email,
      password,
    });
    await user.save();
    return user;
  }
}
