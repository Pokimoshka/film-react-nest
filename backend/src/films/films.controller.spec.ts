import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: { findAll: jest.Mock; findSchedule: jest.Mock };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findSchedule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [{ provide: FilmsService, useValue: service }],
    }).compile();

    controller = module.get(FilmsController);
  });

  it('findAll делегирует в FilmsService.findAll', async () => {
    const expected = { total: 1, items: [{ id: '1' } as never] };
    service.findAll.mockResolvedValue(expected);

    await expect(controller.findAll()).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findSchedule делегирует в FilmsService.findSchedule с id', async () => {
    const expected = { total: 0, items: [] };
    service.findSchedule.mockResolvedValue(expected);

    await expect(controller.findSchedule('abc')).resolves.toBe(expected);
    expect(service.findSchedule).toHaveBeenCalledWith('abc');
  });

  it('findSchedule пробрасывает NotFoundException из сервиса', async () => {
    service.findSchedule.mockRejectedValue(new NotFoundException('no film'));

    await expect(controller.findSchedule('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
