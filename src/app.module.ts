/**
 * app.module.ts
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContextModule } from './common/context/context.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ResponseStandardizationInterceptor } from './common/interceptors/response-standardization.interceptor';
import { TestModule } from './test/test.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ContextModule, TestModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseStandardizationInterceptor,
    },
    Reflector,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
