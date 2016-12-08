export default () => (async (ctx, next) => {
  ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  ctx.set('Pragma', 'no-cache');

  await next();
});
