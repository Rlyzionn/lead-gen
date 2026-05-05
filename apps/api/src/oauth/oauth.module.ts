import { Module } from "@nestjs/common";
import { OAuthController } from "./oauth.controller";
import { OAuthService } from "./oauth.service";
import { IntegrationsModule } from "../integrations/integrations.module";

@Module({
  imports: [IntegrationsModule],
  controllers: [OAuthController],
  providers: [OAuthService],
})
export class OAuthModule {}
