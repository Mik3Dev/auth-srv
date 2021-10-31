import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2-client-password';
import { AuthService } from '../auth.service';

@Injectable()
export class Oauth2ClientPasswordStrategy extends PassportStrategy(
  Strategy,
  'oauth2-client-password',
) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(clientId: string, clientSecret: string): Promise<any> {
    const user = await this.authService.ValidateUserByClientId(
      clientId,
      clientSecret,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
