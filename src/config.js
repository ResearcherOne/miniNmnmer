const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    throw result.error
}

const HOST = process.env.HOST;
const PORT = parseInt(process.env.PORT);
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

module.exports = {
    HOST: HOST,
    PORT: PORT,
    USERNAME: USERNAME,
    PASSWORD: PASSWORD
}