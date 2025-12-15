import { test as base } from '@playwright/test';
import { RequestHandler } from '../utils/request-handler';
import { APIlogger } from './logger';
import { setCustomExpectLogger } from './custom-expect';
import { config } from '../api-test.config';
import { createToken } from '../helpers/create-token';

export type TestOptions = {
  api: RequestHandler;
  config: typeof config;
};

export type WorkerFixture = {
  authToken: string;
};

const test = base.extend<TestOptions, WorkerFixture>({
  authToken: [
    async ({ }, use) => {
      const token = await createToken(config.userEmail, config.userPassword);
      if (!token) throw new Error('FAILED TO GENERATE TOKEN');
      await use(token);
    },
    { scope: 'worker' }
  ],

  api: async ({ request, authToken }, use) => {
    const logger = new APIlogger();
    setCustomExpectLogger(logger);

    const requestHandler = new RequestHandler(
      request,
      config.apiUrl,
      logger,
      authToken // ← теперь токен приходит правильно
    );

    await use(requestHandler);
  },

  config: async ({ }, use) => {
    await use(config);
  }
});

test.afterEach(async ({ api }) => {
  const logger = (api as any).__logger as APIlogger;
  if (logger) {
    console.log('\n========== API LOGS ==========');
    console.log(logger.getRecentLogs());
  }
});

export { test };
