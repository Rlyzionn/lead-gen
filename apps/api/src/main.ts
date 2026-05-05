import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  console.log("[Bootstrap] starting…");
  console.log(`[Bootstrap] node=${process.version} PORT=${process.env.PORT} DEMO_MODE=${process.env.DEMO_MODE}`);

  try {
    console.log("[Bootstrap] creating Nest app…");
    const app = await NestFactory.create(AppModule, {
      logger: ["log", "error", "warn"],
    });
    console.log("[Bootstrap] Nest app created");

    const isDemo = (process.env.DEMO_MODE ?? "").trim().toLowerCase() === "true";
    const allowedOrigins = (
      process.env.CORS_ORIGINS ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000"
    )
      .split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter(Boolean);

    console.log(`[Bootstrap] CORS demo=${isDemo} allowed=${JSON.stringify(allowedOrigins)}`);

    app.enableCors({
      origin: isDemo ? true : allowedOrigins,
      credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix("api");

    const port = Number(process.env.PORT ?? 3001);
    console.log(`[Bootstrap] calling app.listen(${port}, "0.0.0.0")…`);
    await app.listen(port, "0.0.0.0");
    console.log(`[Bootstrap] API READY on port ${port} (demo=${isDemo})`);
  } catch (err) {
    console.error("[Bootstrap] FATAL:", err);
    process.exit(1);
  }
}

bootstrap();

// Surface any stray async errors that would otherwise kill the process silently
process.on("unhandledRejection", (reason) => {
  console.error("[Process] UnhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[Process] UncaughtException:", err);
});
