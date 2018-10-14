const mysql: Object = global.require('mysql');

/* 根据id查找信息 */
export function query(db: Object, userid: string): Promise{
  const connection: Object = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });
  connection.connect();

  return new Promise((resolve: Function, reject: Function): void=>{
    connection.query(
      `SELECT id, userid, nickname, record from ${ db.table } WHERE userid=?`,
      [userid],
      (err: Error, results: Array, fields: any): void=>{
        if(err){
          reject(err);
        }else{
          resolve(results);
        }
        connection.end();
      }
    );
  });
}

/* 插入数据库信息 */
export function insert(db: Object, userid: string, nickname: string, record: string): Promise{
  const connection: Object = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });
  connection.connect();

  return new Promise((resolve: Function, reject: Function): void=>{
    connection.query(`INSERT INTO ${ db.table } (userid, nickname, record) VALUES (?, ?, ?)`,
      [userid, nickname, JSON.stringify(record)],
      (err: Error, results: Array, fields: any): void=>{
        if(err){
          reject(err);
        }else{
          resolve(results);
        }
        connection.end();
      }
    );
  });
}

/* 更新数据库数据 */
export function update(db: Object, userid: string, nickname: string, record: string): Promise{
  const connection: Object = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });
  connection.connect();

  return new Promise((resolve: Function, reject: Function): void=>{
    connection.query(`UPDATE ${ db.table } SET nickname=?, record=? WHERE userid=?`,
      [nickname, JSON.stringify(record), userid],
      (err: Error, results: Array, fields: any): void=>{
        if(err){
          reject(err);
        }else{
          resolve(results);
        }
        connection.end();
      }
    );
  });
}

/* 补卡时更新的数据库 */
export function update2(db: Object, userid: string, record: string): Promise{
  const connection: Object = mysql.createConnection({
    host: db.hostname,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database
  });
  connection.connect();

  return new Promise((resolve: Function, reject: Function): void=>{
    connection.query(`UPDATE ${ db.table } SET record=? WHERE userid=?`,
      [JSON.stringify(record), userid],
      (err: Error, results: Array, fields: any): void=>{
        if(err){
          reject(err);
        }else{
          resolve(results);
        }
        connection.end();
      }
    );
  });
}