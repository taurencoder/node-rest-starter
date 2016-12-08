exports.up = function (knex, promise) {
  return knex.schema.createTable('user', (t) => {
    t.increments();
    t.string('nickname', 255);
    t.string('username', 255);
    t.string('email', 255);
    t.string('password', 255);
    t.string('gender', 10);
    t.string('status', 255);
    t.string('manifesto', 255);
    t.datetime('birth_date');
    t.integer('role_id');
    t.timestamps();
  }).createTable('role', (t) => {
    t.increments();
    t.string('key', 50);
    t.string('name', 50);
  }).createTable('operation', (t) => {
    t.increments();
    t.string('key', 50);
    t.string('name', 50);
  }).then(() => (
    promise.all([
      knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 2000'),
      knex.raw('ALTER SEQUENCE roles_id_seq RESTART WITH 2000'),
    ])
  ));
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('operation')
    .dropTable('roles')
    .dropTable('users');
};
