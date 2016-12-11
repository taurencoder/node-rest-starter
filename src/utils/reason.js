/* eslint no-underscore-dangle: 0 */

import { assign, set } from 'lodash';
import { map } from 'lodash/fp';

const singleError = (context, error, params) => ([{
  field: 'default',
  message: context.i18n.__(error, params),
}]);

export default (app, i18nOptions, options = {}) => {
  const okResp = options.ok || { ok: true };
  const errorReason = options.reason || { error: 'service not available' };

  assign(app.context, {
    /**
     * Set ok return.
     *
     * @param {Object} obj (optional)
     * @param {Number} status (optional)
     * @api public
     */
    ok(obj = {}, status) {
      if (typeof obj === 'number') {
        this.status = obj;
        this.body = {};
      } else {
        this.status = status || 200;
        this.body = obj;
      }
      set(obj, 'ok', obj.ok || okResp.ok);
    },
    /**
     * Set error-prone return
     *
     * @param {Object|String} errors (optional)
     * @param {Number} status (optional)
     * @api public
     */
    reason(errors = {}, status) {
      const body = {};
      const context = this;

      if (typeof errors === 'number') {
        this.status = errors;
        body.errors = singleError(context, errorReason.error);
      } else if (errors.isJoi) {
        body.errors = map(({ message, path }) => ({
          field: path,
          message,
        }))(errors.details);
      } else if (typeof errors === 'string') {
        body.errors = singleError(context, errors, {});
      } else {
        const keys = Object.keys(errors);
        if (keys.length > 0) {
          body.errors = keys.map(key => ({
            field: key,
            message: context.i18n.__(errors[key]),
          }));
        } else {
          body.errors = singleError(context, errorReason.error);
        }
      }
      this.setStatus(status || 500);
      this.setBody(body);
    },

    reasoni(info) {
      const body = {};
      const context = this;
      const errors = info.message || {};
      const status = info.status || 500;
      const params = info.params || {};
      if (typeof errors === 'string') {
        body.errors = singleError(context, errors, params);
      } else {
        const keys = Object.keys(errors);
        if (keys.length > 0) {
          body.errors = keys.map(key => ({
            field: key,
            message: context.i18n.__(errors[key], params),
          }));
        } else {
          body.errors = singleError(context, errorReason.error, params);
        }
      }
      this.setStatus(status);
      this.setBody(body);
    },
  });
  return app;
};
