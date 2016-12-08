import Router from 'koa-router';
import userService from '../services/user-service';

const signIn = async ({ setBody, setStatus, request, extra }) => {
  const { username, password } = request.body;
  const user = await userService.signIn(username, password, extra);
  setBody(user);
  setStatus(200);
};

const authApi = new Router({ prefix: '/api' });
authApi
  .post('/auth/local', signIn);

export default authApi;
