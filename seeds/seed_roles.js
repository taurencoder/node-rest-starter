exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return Promise.all(([
    knex('operation').del(),
    knex('role').del(),
    knex('user').del(),
  ])).then(() => (
      Promise.all([
        // Inserts seed entries
        knex('operation').insert({
          id: 1001,
          credit: 0,
        }),
        knex('role').insert([{
          id: 1001,
          name: 'ADMIN',
        }, {
          id: 1002,
          name: 'USER',
        }]),
        knex('user').insert({
          id: 1001,
          username: 'superadmin',
          password: '$2a$10$TfmT7LddEYBFvuiukRsnZO6ZALeeuK7PBRTqtWlyU6tpuKIyefDBO',
          role_id: 1001,
        }),
      ])
    ));
};
