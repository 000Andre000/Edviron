import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // you can customize handleRequest if needed
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}
