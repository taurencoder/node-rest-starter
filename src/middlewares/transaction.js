import bookshelf from '../models/base';

const transactionPromise = () => (
  new Promise((resolve, reject) => (
    bookshelf.transaction((t) => {
      resolve(t);
    }).catch((err) => {
      reject(err);
    })
  ))
);

export const transacting = async (ctx, next) => {
  const { extra } = ctx;
  extra.startTransaction(await transactionPromise());
  try {
    await next();
    extra.commitTransaction();
  } catch (err) {
    extra.rollbackTransaction(true);
    throw err;
  }
};
