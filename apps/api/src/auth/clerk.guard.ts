import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { createClerkClient } from "@clerk/backend";

const DEMO = process.env.DEMO_MODE === "true";
const clerk = DEMO ? null : createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

@Injectable()
export class ClerkGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (DEMO) {
      request.userId = "demo-recruiter-1";
      return true;
    }
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) throw new UnauthorizedException();
    try {
      const session = await clerk!.sessions.verifySession(token, token);
      request.userId = session.userId;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
