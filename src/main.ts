import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ContextService } from './common/context/context.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- 1. Enable Global Validation Pipe ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      transform: true, // Automatically transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw error on non-whitelisted properties
      // transformOptions: {
      //   enableImplicitConversion: true, // Convert query/path params
      // },
    }),
  );

  // --- 2. Register Global Exception Filter ---
  const httpAdapterHost = app.get(HttpAdapterHost);
  const contextService = app.get(ContextService);
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost, contextService),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
