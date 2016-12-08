import Joi from 'joi';
import base from './base';

const Role = base.Model.extend({
  tableName: 'role',

  permittedAttributes: ['id', 'key', 'name'],

  validate: {
    name: Joi.number(),
  },
}, {
  type: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
});

export default base.model('Role', Role);
