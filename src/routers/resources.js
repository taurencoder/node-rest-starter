import Router from 'koa-router';
import config from 'config';
import qn from 'qn';
import uuid from 'node-uuid';
import thenify from 'thenify';
import { authenticate } from '../middlewares/authentication';
import GeneralError from '../errors/general-error';

const qnClient = qn.create(config.get('qn'));
const qnUploadPromise = thenify(qnClient.uploadFile).bind(qnClient);

const uploadFile = async({ setBody, setStatus, request: { files } }) => {
  if (files.length) {
    const results = await Promise.all(files.map(file => (
      qnUploadPromise(file.path, { key: `${uuid.v4()}-${file.name}`, 'x:filename': file.name })
    )));
    const content = results.map(result => ({
      url: result[0].url,
      filename: result[0]['x:filename'],
      size: result[0]['x:size'],
    }));
    setBody(content);
    setStatus(201);
  } else {
    GeneralError.badRequest('Upload files set could not be empty').boom();
  }
};

const resourceApi = new Router({ prefix: '/api' });
resourceApi
  .post('/resource', authenticate, uploadFile);

export default resourceApi;
