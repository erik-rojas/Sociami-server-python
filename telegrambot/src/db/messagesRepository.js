import Sequelize, { INTEGER, TEXT } from "sequelize";
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  // SQLite only
  storage: './tl.db'
});

const Message = sequelize.define('message', {
  id: {
    type: INTEGER,
    primaryKey: true
  },
  MessageId: INTEGER,
  Text: TEXT
});

Message.sync();

export {Message};