import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import twilio from "twilio";

@Injectable()
export class TwilioWebhookMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const signature = req.headers["x-twilio-signature"] as string;
    const url = `${process.env.NEXT_PUBLIC_APP_URL}${req.originalUrl}`;
    const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";

    const valid = twilio.validateRequest(authToken, signature, url, req.body);
    if (!valid) throw new UnauthorizedException("Invalid Twilio signature");
    next();
  }
}
