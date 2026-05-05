import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { ClerkGuard } from "../auth/clerk.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("settings")
@UseGuards(ClerkGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("dynamics")
  getDynamicsSettings() {
    return this.settingsService.getDynamicsSettings();
  }

  @Patch("dynamics")
  saveDynamicsSettings(@Body() body: any) {
    return this.settingsService.saveDynamicsSettings(body);
  }

  @Get("field-mappings")
  getFieldMappings() {
    return this.settingsService.getFieldMappings();
  }

  @Patch("field-mappings")
  saveFieldMappings(@Body("mappings") mappings: Record<string, string>) {
    return this.settingsService.saveFieldMappings(mappings);
  }

  @Get("notifications")
  getNotificationPreferences(@CurrentUser() userId: string) {
    return this.settingsService.getNotificationPreferences(userId);
  }

  @Patch("notifications")
  saveNotificationPreferences(
    @CurrentUser() userId: string,
    @Body() prefs: Record<string, unknown>
  ) {
    return this.settingsService.saveNotificationPreferences(userId, prefs);
  }

  @Get("ai")
  getAIPreferences(@CurrentUser() userId: string) {
    return this.settingsService.getAIPreferences(userId);
  }

  @Patch("ai")
  saveAIPreferences(
    @CurrentUser() userId: string,
    @Body()
    prefs: {
      tone?: string;
      verbosity?: string;
      creativity?: number;
      emojiUsage?: string;
      signOffStyle?: string;
      customInstructions?: string | null;
    }
  ) {
    return this.settingsService.saveAIPreferences(userId, prefs);
  }

  @Get("search-config")
  getSearchConfig(@CurrentUser() userId: string) {
    return this.settingsService.getSearchConfig(userId);
  }

  @Patch("search-config")
  saveSearchConfig(
    @CurrentUser() userId: string,
    @Body()
    config: {
      jobTitle?: string;
      shiftType?: string;
      minExperience?: number;
      locationRadius?: number;
      payRangeMin?: number;
      payRangeMax?: number;
      licenseRequired?: boolean;
      sources?: string[];
    }
  ) {
    return this.settingsService.saveSearchConfig(userId, config);
  }

  @Get("integrations")
  getIntegrations(@CurrentUser() userId: string) {
    return this.settingsService.getIntegrations(userId);
  }
}
