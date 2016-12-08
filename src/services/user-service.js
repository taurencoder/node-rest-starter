import bcrypt from 'bcrypt';
import thenify from 'thenify';
import { authorize } from 'cancan';
import { pick } from 'lodash/fp';
import User from '../models/user';
import Role from '../models/role';
import GeneralError from '../errors/general-error';
import { createToken } from '../utils/token';

const genSalt = thenify(bcrypt.genSalt);
const hash = thenify(bcrypt.hash);
const compare = thenify(bcrypt.compare);

const UserService = {
  findUserById: async (userId, includeFullDetails, extra) => {
    const { log } = extra;
    log.info(`start fetching user for id: ${userId}`);
    const relations = [...(extra.withRelated || []), 'role'];
    if (includeFullDetails) {
      relations.push('account');
    }
    const options = { ...extra, withRelated: relations };
    return await User.findOne(userId, options);
  },

  findAllUsers: async (includeFullDetails, extra) => {
    const { log } = extra;
    log.info('start fetching user list...');
    const relations = [...(extra.withRelated || []), 'role'];
    if (includeFullDetails) {
      authorize(extra.user, 'manage', 'all');
      relations.push('account');
    }
    const options = { ...extra, withRelated: relations };
    return await User.findAll(options);
  },

  findUserByProperties: async (params, extra) => {
    const { log } = extra;
    log.info(`start fetching user for properties: ${JSON.stringify(params)}`);
    const options = { ...extra, withRelated: ['role', 'account'] };
    return await User.findOneByProperties(params, options);
  },

  signIn: async (username, password, extra) => {
    const user = await UserService.findUserByProperties({ username }, extra);
    if (!user) {
      GeneralError.unauthorized('Cannot find user for account name %(username)s')
        .params({ username })
        .boom();
    }

    const validPassword = await compare(password, user.get('password'));
    if (validPassword) {
      user.set('authorization', createToken(username));
      return user;
    }

    GeneralError.unauthorized('Login failed, please check username and password').boom();
    return null;
  },

  signUp: async (newUser, extra) => {
    const { username, password } = newUser;
    const existUser = await User.findOneByProperties({ username }, extra);
    if (existUser) {
      GeneralError.badRequest('Account name %(username)s has already been registered')
        .params({ username })
        .boom();
    }

    const salt = await genSalt();
    const hashPwd = await hash(password || '', salt);
    const userRole = await Role.findOneByProperties({ name: Role.type.USER }, extra);
    const user = await User.add({
      username,
      password: hashPwd,
      roleId: userRole.get('id'),
    }, extra);

    const savedUser = await UserService.findUserById(user.get('id'), false, extra);
    savedUser.set('authorization', createToken(username));
    return savedUser;
  },

  resetPassword: async (userId, newPassword, oldPassword, extra) => {
    authorize(extra.user, 'edit', new User({ id: userId }));

    const user = await User.findOne(userId, extra);
    if (!user) {
      GeneralError.notFound('Cannot find user to reset password').boom();
    }

    const validOldPassword = await compare(oldPassword, user.get('password'));
    if (validOldPassword) {
      const salt = await genSalt();
      const hashPwd = await hash(newPassword || '', salt);
      await User.update({ id: userId, password: hashPwd });
      return await UserService.findUserById(userId, false, extra);
    }

    GeneralError.badRequest('Old password is invalid').boom();
    return null;
  },

  updateProfile: async (user, extra) => {
    authorize(extra.user, 'edit', new User(user));

    const { log } = extra;
    log.info(`start updating user profile for id: ${user.id}`);
    return await User.update(pick(['id', 'nickname', 'name', 'position', 'gender', 'email',
      'birthDate', 'poster', 'manifesto', 'phoneNumber', 'province', 'city',
      'skillEnergy', 'skillAttention', 'skillPerformance', 'skillActivity',
      'skillVictories', 'skillLadderPoints'], user), extra);
  },

};

export default UserService;
