const { Client } = require('pg');

const client = new Client({
    host: 'yohana',
    user: 'yohana',
    password: 'yohana01A',
    database: 'Employee_Tracker',
    port: 3001
});

client.connect();

module.exports = client;

