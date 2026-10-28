import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('пишет log в JSON с полем level=log', () => {
    logger.log('hello', 'world');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(logSpy.mock.calls[0][0] as string);

    expect(payload).toMatchObject({
      level: 'log',
      message: 'hello',
      optionalParams: ['world'],
    });
    expect(typeof payload.timestamp).toBe('string');
  });

  it('пишет error с полем level=error', () => {
    logger.error('boom');

    const payload = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(payload.level).toBe('error');
    expect(payload.message).toBe('boom');
  });

  it('пишет warn/debug/verbose с корректным level', () => {
    logger.warn('w');
    logger.debug('d');
    logger.verbose('v');

    const levels = logSpy.mock.calls.map(
      (call) => JSON.parse(call[0] as string).level,
    );
    expect(levels).toEqual(['warn', 'debug', 'verbose']);
  });

  it('сохраняет объект message как есть', () => {
    logger.log({ foo: 'bar' });

    const payload = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(payload.message).toEqual({ foo: 'bar' });
  });
});
