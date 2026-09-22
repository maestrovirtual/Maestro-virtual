/* eslint-disable */
const { Client } = require('pg');

const url = process.env.DATABASE_URL;

const client = new Client({ connectionString: url, connectionTimeoutMillis: 4000 });

client.connect()
  .then(() => {
    console.log("Connected successfully to 6543");
    return client.query('SELECT NOW()');
  })
  .then((res) => {
    console.log(res.rows);
    client.end();
  })
  .catch(err => {
    console.error("Connection error on 6543:", err.message);
    const client5432 = new Client({ connectionString: process.env.DIRECT_URL, connectionTimeoutMillis: 4000 });
    client5432.connect()
      .then(() => {
        console.log("Connected successfully to 5432");
        client5432.end();
      })
      .catch(err5432 => {
        console.error("Connection error on 5432:", err5432.message);
      });
  });
