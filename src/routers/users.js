import Router from 'koa-router';
import { authenticate } from '../middlewares/authentication';
import { transacting } from '../middlewares/transaction';
import userService from '../services/user-service';
import GeneralError from '../errors/general-error';

const getMyProfile = async ({ setBody, setStatus, extra }) => {
  const user = await userService.findUserById(extra.user.id, true, extra);
  setBody(user);
  setStatus(200);
};

const getUserList = async ({ setBody, setStatus, extra }) => {
  const includeFullDetails = extra && extra.user;
  const users = await userService.findAllUsers(includeFullDetails, extra);
  setBody(users);
  setStatus(200);
};

const getUserInfo = async ({ setBody, setStatus, params, extra }) => {
  const includeFullDetails = extra && extra.user;
  const user = await userService.findUserById(params.id, includeFullDetails, extra);
  if (user) {
    setBody(user);
    setStatus(200);
  } else {
    GeneralError.notFound('Cannot find user for given id').boom();
  }
};

const signUp = async ({ setBody, setStatus, request: { body }, extra }) => {
  const user = await userService.signUp(body, extra);
  setBody(user);
  setStatus(201);
};

const resetPassword = async ({ setStatus, request, params, extra }) => {
  const { newPassword, oldPassword } = request.body;
  const { id } = params;
  await userService.resetPassword(id, newPassword, oldPassword, extra);
  setStatus(200);
};

const updateUser = async ({ setBody, setStatus, request: { body }, params: { id }, extra }) => {
  const user = await userService.updateProfile({ ...body, id: Number(id) }, extra);
  setBody(user);
  setStatus(200);
};

const userApi = new Router({ prefix: '/api' });
userApi
  .get('/user/all', getUserList)
  .get('/user/mine', authenticate, getMyProfile)
  .get('/user/:id', getUserInfo)
  .get('/user/:id/action/activate?code')
  .get('/user/:id/action/reset-password?code')
  .put('/user/:id', authenticate, transacting, updateUser)
  .post('/user', transacting, signUp)
  .post('/user/:id/action/request-reset-password')
  .post('/user/:id/action/reset-password', authenticate, transacting, resetPassword);

export default userApi;
