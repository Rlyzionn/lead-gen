import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { CommandCenterService } from "./command-center.service";
import { ClerkGuard } from "../auth/clerk.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("command")
@UseGuards(ClerkGuard)
export class CommandCenterController {
  constructor(private readonly commandCenter: CommandCenterService) {}

  @Post()
  chat(@CurrentUser() userId: string, @Body("message") message: string) {
    return this.commandCenter.chat(userId, message);
  }

  @Post("execute")
  executeAction(
    @CurrentUser() userId: string,
    @Body("type") type: string,
    @Body("params") params: Record<string, unknown>
  ) {
    return this.commandCenter.executeAction(userId, type, params);
  }
}
