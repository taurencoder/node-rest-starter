import moment from 'moment';
import jwt from 'jwt-simple';
import config from 'config';

export const createToken = (username) => {
  const payload = {
    username,
    exp: moment().add(6, 'days').valueOf(),
  };

  return jwt.encode(payload, config.get('app.jwtSecret'), 'HS512');
};
