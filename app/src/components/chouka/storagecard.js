const mysql = global.require('mysql');

/* 根据id查找信息 */
export function query(db, userid) {
  const connection = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });

  connection.connect();

  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT id, userid, nickname, record from ${ db.table } WHERE userid=?`,
      [userid],
      (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.end();
      }
    );
  });
}

export function query2(db, useridOrNickname) {
  const connection = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });

  connection.connect();

  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT id, userid, nickname, record from ${ db.table } WHERE userid=? OR nickname=?`,
      [useridOrNickname, useridOrNickname],
      (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.end();
      }
    );
  });
}

/* 插入数据库信息 */
export function insert(db, userid, nickname, record, points) {
  const connection = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });

  connection.connect();

  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO ${ db.table } (userid, nickname, record, points) VALUES (?, ?, ?, ?)`,
      [userid, nickname, JSON.stringify(record), points],
      (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.end();
      }
    );
  });
}

/* 更新数据库数据 */
export function update(db, userid, nickname, record, points) {
  const connection = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });

  connection.connect();

  return new Promise((resolve, reject) => {
    connection.query(`UPDATE ${ db.table } SET nickname=?, record=?, points=? WHERE userid=?`,
      [nickname, JSON.stringify(record), points, userid],
      (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.end();
      }
    );
  });
}

/* 补卡时更新的数据库 */
export function update2(db, userid, record) {
  const connection = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });

  connection.connect();

  return new Promise((resolve, reject) => {
    connection.query(`UPDATE ${ db.table } SET record=? WHERE userid=?`,
      [JSON.stringify(record), userid],
      (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.end();
      }
    );
  });
}