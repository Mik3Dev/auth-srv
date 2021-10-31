import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Oauth2ClientPasswordGuard extends AuthGuard(
  'oauth2-client-password',
) {}
