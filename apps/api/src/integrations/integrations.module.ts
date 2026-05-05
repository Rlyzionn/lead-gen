import { Module } from "@nestjs/common";
import { ApifyService } from "./apify/apify.service";
import { ApolloService } from "./apollo/apollo.service";
import { TwilioService } from "./twilio/twilio.service";
import { GmailService } from "./gmail/gmail.service";
import { DynamicsService } from "./dynamics/dynamics.service";
import { CalendlyService } from "./calendly/calendly.service";

@Module({
  providers: [
    ApifyService,
    ApolloService,
    TwilioService,
    GmailService,
    DynamicsService,
    CalendlyService,
  ],
  exports: [
    ApifyService,
    ApolloService,
    TwilioService,
    GmailService,
    DynamicsService,
    CalendlyService,
  ],
})
export class IntegrationsModule {}
