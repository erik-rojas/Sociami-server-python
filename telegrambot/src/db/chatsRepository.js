import Sequelize, { INTEGER, TEXT, BOOLEAN } from "sequelize";
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  // SQLite only
  storage: './tl.db'
});

const Chat = sequelize.define('chat', {
  id: {
    type: INTEGER,
    primaryKey: true
  },
  ChatId: INTEGER,
  ChatTitle: TEXT,
  IsRunning: BOOLEAN,
  IsAutoPost: BOOLEAN,
  AutoPostTimeHour: INTEGER,
  AutoPostTimeMinute: INTEGER,
  LastPostetTime: TEXT
});

sequelize.sync();

export {Chat};