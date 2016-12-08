import logger from '../utils/logger';

const isGeneralError = error => (
  error instanceof Error && error.name === 'GeneralError'
);

const isValidationError = error => (
  error instanceof Error && error.isJoi && error.name === 'ValidationError'
);

const isAuthenticationError = error => (
  error instanceof Error && error.status === 401
);

export default () => (async (ctx, next) => {
  const request = ctx.request;
  const requestMethod = request.method;
  const requestUrl = request.url;

  try {
    await next();
  } catch (err) {
    const { extra } = ctx;
    if (isGeneralError(err) && extra && extra.log) {
      const { log } = extra;
      const errorCode = isGeneralError(err) ? err.errorInfo.status : err.status;
      if (errorCode >= 400 && errorCode < 500) {
        log.warn(`${requestMethod} ${requestUrl}`);
        log.warn(err.message);
      } else if (errorCode >= 500) {
        log.error(`${requestMethod} ${requestUrl}`);
        log.error(err.stack);
      } else {
        log.error(err);
      }
    } else if (isValidationError(err) || isAuthenticationError(err)) {
      logger.warn(err.message);
    } else {
      logger.error(err);
    }

    if (extra.transacting && extra.rollback) {
      logger.warn('Rolling back transaction on error...');
      extra.transacting.rollback();
    }

    ctx.setStatus(err.status || 500);
    if (isValidationError(err)) {
      ctx.reason(err, 400);
    } else if (isGeneralError(err)) {
      ctx.reasoni(err.errorInfo);
    } else if (ctx.status === 401) {
      ctx.reason('Not authorized', ctx.status);
    } else {
      ctx.reason('Internal Server Error', ctx.status);
    }
  }
});
