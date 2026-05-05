import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDemo = process.env.DEMO_MODE === "true";
  app.enableCors({
    origin: isDemo ? true : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ?? 3001);
  console.log(`API running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
