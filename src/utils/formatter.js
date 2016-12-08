import { reduce, snakeCase, camelCase } from 'lodash/fp';
import seedrandom from 'seedrandom';
import moment from 'moment';

const reduceWithKey = reduce.convert({ cap: false });

export const underscore = reduceWithKey((sofar, value, key) => ({
  ...sofar, [snakeCase(key)]: value }), {});

export const camelize = reduceWithKey((sofar, value, key) => ({
  ...sofar, [[camelCase(key)]]: value }), {});

export const hashid = (prefix) => {
  const now = moment();
  const randomStr = seedrandom()().toString();
  return `${prefix}${now.format('YYYYMMDD')}${randomStr.substr(2, 16)}`;
};
