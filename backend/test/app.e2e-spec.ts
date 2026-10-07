import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('Afisha API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/afisha');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/afisha/films → 200 и { total, items }', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/afisha/films')
      .expect(200);
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('GET /api/afisha/films/:id/schedule → 404 для несуществующего фильма', async () => {
    await request(app.getHttpServer())
      .get('/api/afisha/films/00000000-0000-0000-0000-000000000000/schedule')
      .expect(404);
  });

  it('POST /api/afisha/order → 400 при некорректном UUID', async () => {
    await request(app.getHttpServer())
      .post('/api/afisha/order')
      .send({
        email: 'test@test.ru',
        phone: '+79990000000',
        tickets: [
          { film: 'not-a-uuid', session: 'not-a-uuid', row: 1, seat: 1 },
        ],
      })
      .expect(400);
  });
});
