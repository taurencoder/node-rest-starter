import log4js from 'log4js';
import levels from 'log4js/lib/levels';
import config from 'config';

log4js.configure(config.get('log4js'));

const HTTP_LOG_FORMAT = '[ID:%s IP:%s] %d %s %s - %dms';
const middleware = (thisLogger, options = {}) => (
  async (ctx, next) => {
    const { request } = ctx;
    const start = new Date();
    const method = request.method;

    await next();

    const { response, session } = ctx;
    const responseTime = new Date() - start;
    let level = options.level || levels.INFO;

    if (response.status && level === 'auto') {
      if (response.status >= 300) {
        level = levels.WARN;
      } else if (response.status >= 500) {
        level = levels.ERROR;
      } else {
        level = levels.INFO;
      }
    }

    if (thisLogger.isLevelEnabled(level)) {
      thisLogger.log(level, HTTP_LOG_FORMAT, session.id, request.ip,
        response.status, method, request.url, responseTime);
    }
  }
);

const logger = log4js.getLogger('api');
logger.setLevel(config.get('log4js.level'));

export default logger;
export { middleware };
