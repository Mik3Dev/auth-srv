import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDTO } from './dto/register-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async registerUser(@Body() registerUserDTO: RegisterUserDTO): Promise<any> {
    return await this.usersService.register(registerUserDTO);
  }
}
