import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

const log = new Logger("Bootstrap");

// Strip whitespace + a single trailing slash so a Railway env var like
// "https://web.example.com/" still matches the browser's slash-less Origin header.
function normalizeOrigin(s: string): string {
  return s.trim().replace(/\/+$/, "");
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDemo = (process.env.DEMO_MODE ?? "").trim().toLowerCase() === "true";

  const allowedOrigins = (process.env.CORS_ORIGINS ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  log.log(`CORS: demo=${isDemo}, allowed=${JSON.stringify(allowedOrigins)}`);

  app.enableCors({
    // In demo mode, reflect any origin (the demo is intentionally public).
    // Otherwise compare incoming Origin against the normalized allow-list.
    origin: isDemo
      ? true
      : (origin, cb) => {
          if (!origin) return cb(null, true); // server-to-server / curl
          const normalized = normalizeOrigin(origin);
          if (allowedOrigins.includes(normalized)) return cb(null, true);
          log.warn(`CORS reject: ${origin}`);
          cb(new Error(`Not allowed by CORS: ${origin}`), false);
        },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("api");

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, "0.0.0.0");
  log.log(`API running on port ${port} (demo=${isDemo})`);
}
bootstrap();
