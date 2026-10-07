import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  /** Парсит одну TSKV-строку в объект. */
  const parseTskv = (line: string): Record<string, string> =>
    Object.fromEntries(
      line.split('\t').map((pair) => {
        const [key, ...rest] = pair.split('=');
        return [key, rest.join('=')];
      }),
    );

  it('пишет log в TSKV: поля разделены \\t, level=log', () => {
    logger.log('hello', 'world');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = logSpy.mock.calls[0][0] as string;
    const parsed = parseTskv(line);

    expect(parsed.level).toBe('log');
    expect(parsed.message).toBe('hello');
    expect(parsed.optionalParams).toBe(JSON.stringify(['world']));
    expect(parsed.time).toBeDefined();
  });

  it('пишет error с level=error', () => {
    logger.error('boom');

    const parsed = parseTskv(logSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('boom');
  });

  it('пишет warn/debug/verbose с корректным level', () => {
    logger.warn('w');
    logger.debug('d');
    logger.verbose('v');

    const levels = logSpy.mock.calls.map(
      (call) => parseTskv(call[0] as string).level,
    );
    expect(levels).toEqual(['warn', 'debug', 'verbose']);
  });

  it('экранирует табы и переводы строк внутри значений', () => {
    logger.log('a\tb\nc');

    const line = logSpy.mock.calls[0][0] as string;
    // Без optionalParams полей три: level, message, time.
    expect(line.split('\t')).toHaveLength(3);
    expect(parseTskv(line).message).toBe('a b c');
  });

  it('сериализует объект в JSON-строку', () => {
    logger.log({ foo: 'bar' });

    const parsed = parseTskv(logSpy.mock.calls[0][0] as string);
    expect(parsed.message).toBe(JSON.stringify({ foo: 'bar' }));
  });
});
