import { expect, mock, spyOn, test } from 'bun:test';
import { TelegramBot, checkTelegramBotToken } from '../../lib/telegram.js';
import { checkAstraDbCredentials } from '../../lib/astradb.js';
import {
  generateYandexIAMToken,
  generateYCAWSSigningKey,
  getYCPsinaFolder
} from '../../lib/yc.js';
import { generateAWSSigningKey } from '../../lib/ppp-crypto.js';
import { app } from '../setup.js';

test('Telegram methods encode the documented JSON payload without sending a message', async () => {
  const response = new Response('{}');
  const fetch = spyOn(app, 'fetch').mockResolvedValue(response);
  const bot = new TelegramBot({ token: 'test-token' });

  expect(
    await bot.sendMessage('chat', 'text', { disable_notification: true })
  ).toBe(response);
  expect(fetch).toHaveBeenLastCalledWith(
    'https://api.telegram.org/bottest-token/sendMessage',
    {
      method: 'POST',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: 'chat',
        text: 'text',
        disable_notification: true
      })
    }
  );
  await bot.setWebhook('https://example.test/hook', { secret_token: 'test' });
  expect(JSON.parse(fetch.mock.calls.at(-1)[1].body)).toEqual({
    url: 'https://example.test/hook',
    secret_token: 'test'
  });
  await bot.deleteWebhook({ drop_pending_updates: true });
  expect(fetch.mock.calls.at(-1)[0]).toMatch(/\/deleteWebhook$/);
  await checkTelegramBotToken({ token: 'test-token' });
  expect(fetch).toHaveBeenLastCalledWith(
    'https://api.telegram.org/bottest-token/getMe',
    { cache: 'reload' }
  );
});

test('Astra credential check builds a collection-list request', async () => {
  const response = new Response('{}');
  const fetch = spyOn(app, 'fetch').mockResolvedValue(response);

  expect(
    await checkAstraDbCredentials({
      dbUrl: 'https://db.test/base',
      dbToken: 'test-token',
      dbKeyspace: 'space'
    })
  ).toBe(response);
  expect(fetch).toHaveBeenCalledWith('https://db.test/api/json/v1/space', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Token: 'test-token' },
    body: '{"findCollections":{}}'
  });
});

/** @returns {object} JOSE boundary recording claims and headers without real credentials. */
function joseFixture() {
  const state = {};

  return {
    state,
    importPKCS8: mock(async () => 'key'),
    CompactSign: class {
      constructor(payload) {
        state.payload = JSON.parse(new TextDecoder().decode(payload));
      }
      setProtectedHeader(header) {
        state.header = header;
        return this;
      }
      async sign(key) {
        state.key = key;
        return 'signed-jwt';
      }
    }
  };
}

test('Yandex token uses PS256, key ID and five-minute service-account claims', async () => {
  const jose = joseFixture();
  const before = Math.floor(Date.now() / 1000);

  expect(
    await generateYandexIAMToken({
      jose,
      ycServiceAccountID: 'account',
      ycPublicKeyID: 'key-id',
      ycPrivateKey: 'pem'
    })
  ).toBe('signed-jwt');
  expect(jose.importPKCS8).toHaveBeenCalledWith('pem', 'PS256');
  expect(jose.state.header).toEqual({ alg: 'PS256', kid: 'key-id' });
  expect(jose.state.payload).toMatchObject({
    iss: 'account',
    aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens'
  });
  expect(jose.state.payload.iat).toBeGreaterThanOrEqual(before);
  expect(jose.state.payload.exp - jose.state.payload.iat).toBe(300);
});

test('Yandex S3 key fixes the signing region', async () => {
  const options = { ycStaticKeySecret: 'secret', date: '20250101' };

  expect(await generateYCAWSSigningKey(options)).toEqual(
    await generateAWSSigningKey({ ...options, region: 'ru-central1' })
  );
});

test('Yandex folder discovery uses the IAM token and selects the active psina folder', async () => {
  const fetch = spyOn(app, 'fetch')
    .mockResolvedValueOnce(Response.json({ iamToken: 'iam' }))
    .mockResolvedValueOnce(
      Response.json({ clouds: [{ id: 'cloud', name: 'ppp' }] })
    )
    .mockResolvedValueOnce(
      Response.json({
        folders: [
          { id: 'disabled', name: 'psina', status: 'DELETING' },
          { id: 'folder', name: 'psina', status: 'ACTIVE' }
        ]
      })
    );

  expect(await getYCPsinaFolder({ jose: joseFixture() })).toEqual({
    psinaFolderId: 'folder',
    iamToken: 'iam'
  });
  expect(fetch.mock.calls[1][1].headers).toEqual({
    Authorization: 'Bearer iam'
  });
  expect(fetch.mock.calls[2][0]).toMatch(/\/folders\?cloudId=cloud$/);
});

test.each([
  [{ clouds: [] }, undefined, 'Облако'],
  [{ clouds: [{ id: 'cloud', name: 'ppp' }] }, { folders: [] }, 'Каталог']
])(
  'Yandex discovery rejects missing resources',
  async (clouds, folders, message) => {
    const fetch = spyOn(app, 'fetch')
      .mockResolvedValueOnce(Response.json({ iamToken: 'iam' }))
      .mockResolvedValueOnce(Response.json(clouds));

    if (folders) fetch.mockResolvedValueOnce(Response.json(folders));
    await expect(getYCPsinaFolder({ jose: joseFixture() })).rejects.toThrow(
      message
    );
  }
);

test('Yandex key import and HTTP errors stop discovery', async () => {
  const jose = joseFixture();
  jose.importPKCS8.mockRejectedValue(new Error('invalid PEM'));

  await expect(getYCPsinaFolder({ jose })).rejects.toThrow(
    'Не удалось сгенерировать'
  );
  spyOn(app, 'fetch').mockResolvedValue(
    new Response('denied', { status: 403 })
  );
  await expect(getYCPsinaFolder({ jose: joseFixture() })).rejects.toMatchObject(
    { status: 403, message: 'denied' }
  );
});
