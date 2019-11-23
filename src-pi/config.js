const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    throw result.error
}

const HOST = process.env.HOST;
const PORT = parseInt(process.env.PORT);
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const TELEPRECENSE_RECEIVE_COMMANDS_TOPIC = process.env.TELEPRECENSE_RECEIVE_COMMANDS_TOPIC;
const TELEPRECENSE_PUBLISH_EVENTS_TOPIC = process.env.TELEPRECENSE_PUBLISH_EVENTS_TOPIC;

module.exports = {
    HOST: HOST,
    PORT: PORT,
    USERNAME: USERNAME,
    PASSWORD: PASSWORD,

    TELEPRECENSE_RECEIVE_COMMANDS_TOPIC: TELEPRECENSE_RECEIVE_COMMANDS_TOPIC,
    TELEPRECENSE_PUBLISH_EVENTS_TOPIC: TELEPRECENSE_PUBLISH_EVENTS_TOPIC
}