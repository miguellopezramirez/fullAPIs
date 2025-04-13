const mongoose = require('mongoose');

const ZTROLES = new mongoose.Schema({
  ROLEID: { type: String, required: true, unique: true },
  ROLENAME: { type: String, required: true },
  DESCRIPTION: { type: String },
  PRIVILEGES: [{
    PROCESSID: { type: String },
    PRIVILEGEID: [{ type: String}] 
  }],
  DETAIL_ROW: {
    ACTIVED: { type: Boolean, default: true },
    DELETED: { type: Boolean, default: false },
    DETAIL_ROW_REG: [{
      CURRENT: { type: Boolean, default: false },
      REGDATE: { type: Date, default: Date.now },
      REGTIME: { type: Date, default: Date.now }, // Date para manejar tiempo
      REGUSER: { type: String, required: true }
    }]
  }
}, { collection: 'ZTROLES' });

module.exports = mongoose.model('ZTROLES', ZTROLES);