import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: { create: jest.Mock };

  const dto: OrderDto = {
    email: 'test@test.ru',
    phone: '+79990000000',
    tickets: [{ film: 'f', session: 's', row: 1, seat: 1 } as never],
  };

  beforeEach(async () => {
    service = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: service }],
    }).compile();

    controller = module.get(OrderController);
  });

  it('create делегирует в OrderService.create с телом запроса', async () => {
    const expected = { total: 1, items: [] };
    service.create.mockResolvedValue(expected);

    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('create пробрасывает ошибку сервиса наверх', async () => {
    service.create.mockRejectedValue(new Error('boom'));

    await expect(controller.create(dto)).rejects.toThrow('boom');
  });
});
