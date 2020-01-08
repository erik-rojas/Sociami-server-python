import Sequelize, { INTEGER, TEXT } from "sequelize";
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  // SQLite only
  storage: './tl.db'
});

const OnOffWelcome = sequelize.define('onOffWelcome', {
  id: {
    type: INTEGER,
    primaryKey: true
  },
  ChatId: INTEGER,
  IsOnOff: INTEGER
});

OnOffWelcome.sync();

export {OnOffWelcome};