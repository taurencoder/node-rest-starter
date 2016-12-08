import jwt from 'jwt-simple';
import config from 'config';
import configCancan from '../utils/config-cancan';
import GeneralError from '../errors/general-error';
import userService from '../services/user-service';

export const authenticate = async (ctx, next) => {
  let decoded = null;
  const token = (ctx.request.body && ctx.request.body.authorization) ||
      (ctx.req.headers && ctx.req.headers.authorization) ||
      ctx.cookies.get('authorization') ||
      (ctx.request.query && ctx.request.query.authorization);

  if (!token) {
    GeneralError.unauthorized('Authentication must be provided').boom();
  }

  try {
    decoded = jwt.decode(token, config.get('app.jwtSecret'));
  } catch (err) {
    GeneralError.unauthorized('Failed to verify token signature').boom();
  }

  if (decoded && decoded.exp <= Date.now()) {
    GeneralError.unauthorized('Token expired').boom();
  }

  const authenticatedUser = await userService.findUserByProperties({
    username: decoded.username,
  }, ctx.extra);

  if (!authenticatedUser) {
    GeneralError.unauthorized('Authentication failed').boom();
  } else {
    configCancan(authenticatedUser);
  }

  if (ctx.extra) {
    ctx.extra.set('authorization', token);
    ctx.extra.set('user', authenticatedUser);
  }

  await next();
};
