const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

pool.query(`CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  protocol TEXT UNIQUE,
  user_id TEXT UNIQUE,
  active BOOLEAN DEFAULT false
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

  const query = `
    INSERT INTO "user" (user_id, protocol, active) 
    VALUES ($1, $2, $3) 
    RETURNING id`;
  
  const values = [userId, protocol, false];
  
  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      return callback(-1);
    }
    callback(result.rows[0].id);
  });
}

function getData(user_id, protocol, status, callback) {
  function fetchAndProcessData(callback) {
    let sql = `SELECT id, user_id, protocol, active FROM "user" WHERE protocol = $1`;
    let params = [protocol];

    if (user_id) {
      sql += ` AND user_id = $2`;
      params.push(user_id);
    }

    pool.query(sql, params, (err, result) => {
      if (err) {
        console.error('Erro ao buscar dados:', err);
        return callback([]);
      }

      // Verificar e processar os dados com base no status
      const rows = result.rows;
      const updatePromises = [];

      rows.forEach(row => {
        if (row.active === false && status === true) {
          const updateQuery = `
            UPDATE "user"
            SET active = true
            WHERE id = $1
          `;
          const updateParams = [row.id];
          updatePromises.push(pool.query(updateQuery, updateParams));
        }
      });

      // Executar todas as atualizações em paralelo
      Promise.all(updatePromises)
        .then(() => {
          callback(rows); // Após atualizações, chama o callback com os resultados originais
        })
        .catch((updateErr) => {
          console.error('Erro ao atualizar dados:', updateErr);
          callback([]); // Em caso de erro, chama o callback com um array vazio
        });
    });
  }

  // Chamar a função para buscar e processar os dados
  fetchAndProcessData(callback);
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
