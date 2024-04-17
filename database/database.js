const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

pool.query(`CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  protocol TEXT UNIQUE,
  user_id TEXT UNIQUE
)`, (err, result) => {
  if (err) {
    console.error('Erro ao criar a tabela:', err);
  } else {
    console.log('Tabela criada com sucesso.');
  }
});

function insertData(userId, protocol, callback) {
  if (!userId || !protocol) {
    return callback(-1);
  }

  pool.query(`INSERT INTO "user" (user_id, protocol) VALUES ($1, $2) RETURNING id`, [userId, protocol], (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      return callback(-1);
    }
    callback(result.rows[0].id);
  });
}

function getData(user_id, protocol, callback) {
  let sql = `SELECT id, user_id, protocol FROM "user" WHERE`;
  let params = [];

  if (protocol) {
    sql += ` protocol = $1`;
    params.push(protocol);
  } else if (user_id) {
    sql += ` user_id = $1`;
    params.push(user_id);
  } else {
    return callback([]);
  }

  pool.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erro ao buscar dados:', err);
      return callback([]);
    }
    callback(result.rows);
  });
}

function deleteDataByUserId(userId, callback) {
  pool.query(`DELETE FROM "user" WHERE user_id = $1`, [userId], (err, result) => {
    if (err) {
      console.error('Erro ao excluir dados:', err);
      return callback(-1);
    }
    callback(result.rowCount);
  });
}

module.exports = { insertData, getData, deleteDataByUserId };
