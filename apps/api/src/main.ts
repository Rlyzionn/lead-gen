import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDemo = process.env.DEMO_MODE === "true";

  // Build allowed origins from env. Comma-separate multiple URLs in
  // CORS_ORIGINS, or fall back to NEXT_PUBLIC_APP_URL, or localhost in dev.
  const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: isDemo ? true : allowedOrigins,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("api");

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, "0.0.0.0");
  console.log(`API running on port ${port}`);
}
bootstrap();
