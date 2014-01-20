var Promise = require('bluebird');
var Knex = require('knex');
var knex = Knex.initialize({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite'
  }
});

Promise.all([
  // テーブル削除
  knex.schema.dropTableIfExists('users'),
  knex.schema.dropTableIfExists('posts')
]).then(function() {
  // テーブル作成
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name').index();
      table.integer('age');
      table.timestamps();
    }),
    knex.schema.createTable('posts', function(table) {
      table.increments('id').primary();
      table.integer('userId').index()
           .references('id').inTable('users')
           .onUpdate('cascade').onDelete('cascade');
      table.string('title');
      table.text('body');
      table.timestamps();
    })
  ]);

}).then(function() {
  // macoshitaさんを追加
  return knex('users').insert({
    name: 'macoshita',
    age: 17
  }, 'id');

}).then(function(userId) {
  // macoshitaさんが何個かポスト
  return knex('posts').insert([{
    userId: userId,
    title: 'hello world',
    body: 'To create this post, I use the "knex".'
  }, {
    userId: userId,
    title: 'oh, god',
    body: 'I don\'t come up with a nice post.'
  }]);

}).then(function() {
  // macoshitaさんを探す
  return knex('users').where('name', 'macoshita').select();

}).then(function(users) {
  // macoshitaさんが年齢を変更
  if (users.length !== 1) {
    throw 'not found macoshita';
  }

  var user = users[0];
  user.age = 27;

  return knex('users').update(user);

}).then(function() {
  return knex('users').where('name', 'macoshita').select();
}).then(function(users) {
  console.log(users);
});
