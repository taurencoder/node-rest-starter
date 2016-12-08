exports.up = function (knex) {
  return knex.schema.createTable('areas', (t) => {
    t.increments();
    t.string('name');
    t.string('short_name');
    t.integer('level_id');
    t.integer('parent_id');
    t.integer('type');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('areas');
};
