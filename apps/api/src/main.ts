import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const isDemo = (process.env.DEMO_MODE ?? "").trim().toLowerCase() === "true";

    // Allow-list — comma-separated. Trailing slashes stripped so a Railway
    // env var like "https://web.example.com/" still matches the browser's
    // slash-less Origin header.
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
    await app.listen(port, "0.0.0.0");
    console.log(`[Bootstrap] API running on port ${port} (demo=${isDemo})`);
  } catch (err) {
    console.error("[Bootstrap] FATAL:", err);
    process.exit(1);
  }
}

bootstrap();
