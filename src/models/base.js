import knex from 'knex';
import { pick, difference } from 'lodash/fp';
import Joi from 'joi';
import config from 'config';
import bookshelf from 'bookshelf';
import { underscore, camelize } from '../utils/formatter';

const myBookshelf = bookshelf(knex(config.database));
myBookshelf.plugin('registry');
myBookshelf.plugin('visibility');
myBookshelf.Model = myBookshelf.Model.extend({
  hasTimestamps: ['createdAt', 'updatedAt'],

  initialize() {
    this.on('saving', this.validateSave);

    if (this.validate) {
      const baseValidation = {
        id: Joi.any().optional(),
      };

      this.validate = this.validate.isJoi
        ? this.validate.keys(baseValidation)
        : Joi.object(this.validate).keys(baseValidation);
    }
  },

  validateSave(model, attrs, options) {
    let validation = null;
    // model is not new or update method explicitly set
    if ((model && !model.isNew()) || (options && (options.method === 'update' || options.patch === true))) {
      const schemaKeys = this.validate._inner.children.map(child => child.key);
      const presentKeys = Object.keys(attrs);
      const optionalKeys = difference(schemaKeys, presentKeys);
      // only validate the keys that are being updated
      validation = Joi.validate(pick(this.permittedAttributes, attrs),
        this.validate.optionalKeys(optionalKeys));
    } else {
      validation = Joi.validate(pick(this.permittedAttributes, this.attributes), this.validate);
    }

    if (validation.error) {
      validation.error.tableName = this.tableName;
      throw validation.error;
    } else {
      return validation.value;
    }
  },

  format(attrs) {
    return underscore(pick(this.permittedAttributes, attrs));
  },

  parse(attrs) {
    return camelize(attrs);
  },
}, {
  async add(data, options) {
    return await this.forge(data).save(null, options);
  },

  async update(data, options) {
    return await this.add(data, options);
  },

  async findOne(id, options) {
    return await this.where('id', id).fetch(options);
  },

  async findOneByProperties(queryParams, options) {
    const params = underscore(queryParams);
    return await this.where(params).fetch(options);
  },

  async findAll(options) {
    return await this.fetchAll(options);
  },

  async findAllByIds(ids, options) {
    return await this.where('id', 'in', ids).fetchAll(options);
  },

  async findAllByProperties(queryParams, options) {
    const params = underscore(queryParams);
    return await this.where(params).fetchAll(options);
  },

  async delete(id, options) {
    return await this.forge({ id }).destroy(options);
  },

  async save(model, options) {
    return await model.save(null, options);
  },

  async saveAll(models, options) {
    return await models.invokeThen('save', null, options);
  },
});

export default myBookshelf;
