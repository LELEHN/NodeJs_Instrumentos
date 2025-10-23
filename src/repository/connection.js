
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({

    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PWD,
    database: process.env.DATABASE

});

export default connection;