import Joi from 'joi';
import base from './base';

const User = base.Model.extend({
  tableName: 'user',

  permittedAttributes: ['id', 'username', 'password', 'email', 'gender', 'birthDate',
    'manifesto', 'nickname', 'roleId', 'createdAt', 'updatedAt'],
  hidden: ['password'],

  role() {
    return this.belongsTo('Role');
  },

  validate: {
    username: Joi.string().alphanum().min(6).max(50)
      .required(),
    password: Joi.string().max(255),
    email: Joi.string().email(),
    gender: Joi.string().max(10),
    birthDate: Joi.date(),
    manifesto: Joi.string().max(2000),
    nickname: Joi.string().max(255),
    roleId: Joi.number(),
    updatedAt: Joi.date(),
    createdAt: Joi.date(),
  },
});

export default base.model('User', User);
