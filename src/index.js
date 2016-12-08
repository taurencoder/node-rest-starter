import Koa from 'koa';
import config from 'config';
import cors from 'koa-cors';
import bodyParser from 'koa-better-body';
import session from 'koa-session2';
import locale from 'koa-locale';
import i18n from 'koa-i18n';
import context from './middlewares/context';
import errorHandler from './middlewares/error-handler';
import cacheControl from './middlewares/cache-control';
import reason from './utils/reason';
import logger, { middleware as logMiddleware } from './utils/logger';

import Auth from './routers/auth';
import Resources from './routers/resources';
import Users from './routers/users';

const app = new Koa();
const i18nConfig = {
  directory: './locales',
  locales: ['en-US', 'zh-CN'],
  modes: ['header'],
  indent: 2,
  extension: '.json',
};

locale(app);

if (config.get('app.cors')) {
  app.use(cors({
    origin: '*',
    headers: 'accept, x-requested-with, authorization, content-type, Cache-Control, x-client-type',
  }));
}

app.use(session({ key: config.get('app.sessionId') }));
app.use(cacheControl());
app.use(context());
app.use(bodyParser({ fields: 'body' }));
app.use(i18n(app, i18nConfig));
app.use(logMiddleware(logger, { level: config.get('log4js.level') }));
app.use(errorHandler());
reason(app);

const route = (router) => {
  app.use(router.routes());
  app.use(router.allowedMethods());
};
route(Auth);
route(Resources);
route(Users);

app.listen(config.get('app.port'), () => {
  logger.info(`Running on ${config.util.getEnv('NODE_ENV')} mode`);
  logger.info(`Logging level: ${config.get('log4js.level')}`);
  logger.info(`Listening on port ${config.get('app.port')}`);
});
