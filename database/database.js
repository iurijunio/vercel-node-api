const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protocol TEXT UNIQUE,
        user_id TEXT UNIQUE
    )`);
});

function insertData(userId, protocol, callback) {
  if (!userId || !protocol) {
      return callback(-1);
  }

  db.run(`INSERT INTO user (user_id, protocol) VALUES (?, ?)`, [userId, protocol], function (err) {
      if (err) {
          return callback(-1);
      }
      callback(this.lastID);
  });
}

function getData(user_id, protocol, callback) {
  let sql = `SELECT id, user_id, protocol FROM user WHERE 1`;
  let params = [];

  if (protocol) {
      sql += ` AND protocol = ?`;
      params.push(protocol);
  } else if (user_id) {
      sql += ` AND user_id = ?`;
      params.push(user_id);
  } else {
      return callback([]);
  }

  db.all(sql, params, (err, rows) => {
      if (err) {
          return callback([]);
      }
      callback(rows);
  });
}

function deleteDataByUserId(userId, callback) {
  db.run(`DELETE FROM user WHERE user_id = ?`, [userId], function (err) {
      if (err) {
          console.error('Erro ao excluir dados:', err.message);
          return callback(-1);
      }
      callback(this.changes);
  });
}





module.exports = { insertData, getData, deleteDataByUserId };
