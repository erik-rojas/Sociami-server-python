import Sequelize, { INTEGER, TEXT } from "sequelize";
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  // SQLite only
  storage: './tl.db'
});

const WelcomeMessage = sequelize.define('welcomeMessage', {
  Id: {
    type: INTEGER,
    primaryKey: true
  },
  Text: TEXT
});

WelcomeMessage.sync();

export {WelcomeMessage};