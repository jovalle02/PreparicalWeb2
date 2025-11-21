import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  private readonly VALID_TOKEN = 'clase-web-2025-seguro';

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-api-token'];

    if (!token) {
      throw new UnauthorizedException('API token is required');
    }

    if (token !== this.VALID_TOKEN) {
      throw new UnauthorizedException('Invalid API token');
    }

    return true;
  }
}