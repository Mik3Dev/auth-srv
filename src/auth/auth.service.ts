import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && bcrypt.compareSync(password, user.password)) {
      return { id: user['id'], username: user.username };
    }
    return null;
  }

  async ValidateUserByClientId(
    clientId: string,
    clientSecret: string,
  ): Promise<any> {
    const user = await this.usersService.findOneByClientId(clientId);
    if (user && bcrypt.compareSync(clientSecret, user.clientSecret)) {
      return { id: user['id'], username: user.username };
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
