import { set as mutateSet } from 'lodash';
import shortid from 'shortid';
import logger from '../utils/logger';

const APP_LOG_FORMAT = '[ID:%s IP:%s] %s';
const doLog = (msg, level, context) => {
  const output = msg instanceof Error ? msg.stack : msg;
  logger.log(level, APP_LOG_FORMAT, context.session.id, context.request.ip, output);
};

class Extra {
  constructor(context) {
    this.log = {
      trace: msg => doLog(msg, 'trace', context),
      debug: msg => doLog(msg, 'debug', context),
      info: msg => doLog(msg, 'info', context),
      warn: msg => doLog(msg, 'warn', context),
      error: msg => doLog(msg, 'error', context),
      fatal: msg => doLog(msg, 'fatal', context),
    };
  }

  set(path, value) {
    mutateSet(this, path, value);
  }

  startTransaction(transaction) {
    mutateSet(this, 'rollback', false);
    mutateSet(this, 'transacting', transaction);
  }

  commitTransaction() {
    this.transacting.commit();
  }

  rollbackTransaction(isRollback = false) {
    mutateSet(this, 'rollback', isRollback);
  }
}

export default () => (async (ctx, next) => {
  if (ctx.session && !ctx.session.id) {
    mutateSet(ctx, 'session', { ...ctx.session, id: shortid.generate() });
  }
  mutateSet(ctx, 'extra', new Extra(ctx));
  mutateSet(ctx, 'setBody', body => mutateSet(ctx, 'body', body));
  mutateSet(ctx, 'setStatus', status => mutateSet(ctx, 'status', status));
  mutateSet(ctx, 'setState', state => mutateSet(ctx, 'state', state));
  await next();
});
