import { afterEach, describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'events';
import type * as http from 'http';
import { fetchURLContent } from '../../src/planner/urlFetcher';

const { httpGetMock } = vi.hoisted(() => ({
  httpGetMock: vi.fn(),
}));

vi.mock('http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('http')>();
  return {
    ...actual,
    get: httpGetMock,
  };
});

function mockHTTPResponse(
  body: string,
  contentType = 'text/html; charset=utf-8',
  statusCode = 200
): void {
  httpGetMock.mockImplementation(((...args: any[]) => {
    const callback = args[2] as ((res: http.IncomingMessage) => void) | undefined;
    const req = new EventEmitter() as http.ClientRequest;
    req.destroy = vi.fn() as any;

    const res = new EventEmitter() as http.IncomingMessage;
    res.statusCode = statusCode;
    res.headers = { 'content-type': contentType };

    queueMicrotask(() => {
      callback?.(res);
      queueMicrotask(() => {
        res.emit('data', Buffer.from(body));
        res.emit('end');
      });
    });

    return req;
  }) as typeof http.get);
}

function mockHTTPError(message: string): void {
  httpGetMock.mockImplementation((() => {
    const req = new EventEmitter() as http.ClientRequest;
    req.destroy = vi.fn() as any;

    queueMicrotask(() => {
      req.emit('error', new Error(message));
    });

    return req;
  }) as typeof http.get);
}

describe('fetchURLContent', () => {
  afterEach(() => {
    httpGetMock.mockReset();
  });

  it('should fetch and extract text from HTML', async () => {
    const html = `<html><body>
      <h1>测试标题</h1>
      <p>这是一段足够长的测试文本内容，用于验证HTML解析功能。</p>
      <script>var x = 1;</script>
      <style>body { color: red; }</style>
    </body></html>`;
    mockHTTPResponse(html);

    const text = await fetchURLContent('http://example.test/notice');
    expect(text).toContain('这是一段足够长的测试文本内容，用于验证HTML解析功能');
    expect(text).not.toContain('var x');
    expect(text).not.toContain('color: red');
  });

  it('should strip HTML tags', async () => {
    const html = '<html><body><div class="content"><span>带有标签的足够长的测试文本内容，用于验证标签剥离功能。</span></div></body></html>';
    mockHTTPResponse(html);

    const text = await fetchURLContent('http://example.test/notice');
    expect(text).not.toContain('<span>');
    expect(text).not.toContain('<div');
    expect(text).toContain('带有标签的足够长的测试文本内容');
  });

  it('should decode HTML entities', async () => {
    const html = '<html><body><p>价格是 100 元 &amp; 不含税 &gt; 50 元的测试文本内容用于验证。</p></body></html>';
    mockHTTPResponse(html);

    const text = await fetchURLContent('http://example.test/notice');
    expect(text).toContain('&');
    expect(text).not.toContain('&amp;');
  });

  it('should reject on connection error', async () => {
    mockHTTPError('connection refused');

    await expect(fetchURLContent('http://example.test/notice')).rejects.toThrow(
      '无法访问链接: connection refused'
    );
  });
});
