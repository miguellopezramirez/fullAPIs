const mongoose = require('mongoose');

const ZTUSERS = new mongoose.Schema({
  USERID: { type: String, required: true, unique: true },
  PASSWORD: { type: String, required: true },
  USERNAME: { type: String, required: true },
  ALIAS: { type: String },
  FIRSTNAME: { type: String, required: true },
  LASTNAME: { type: String, required: true },
  BIRTHDAYDATE: { type: Date }, 
  COMPANYID: { type: Number, required: true },
  COMPANYNAME: { type: String, required: true },
  COMPANYALIAS: { type: String },
  CEDIID: { type: String },
  EMPLOYEEID: { type: String, required: true },
  EMAIL: { type: String, match: /.+\@.+\..+/ }, // Validación básica de email
  PHONENUMBER: { type: String },
  EXTENSION: { type: String },
  DEPARTMENT: { type: String, required: true },
  FUNCTION: { type: String, required: true },
  STREET: { type: String },
  POSTALCODE: { type: Number },
  CITY: { type: String, required: true },
  REGION: { type: String },
  STATE: { type: String, required: true },
  COUNTRY: { type: String, required: true },
  AVATAR: { type: String },
  ROLES: [{
    ROLEID: { type: String, required: true },
    ROLEIDSAP: { type: String }
  }],
  DETAIL_ROW: {
    ACTIVED: { type: Boolean, default: true },
    DELETED: { type: Boolean, default: false },
    DETAIL_ROW_REG: [{
      CURRENT: { type: Boolean, default: false },
      REGDATE: { type: Date, default: Date.now },
      REGTIME: { type: Date, default: Date.now },
      REGUSER: { type: String, required: true }
    }]
  }
}, { collection: 'ZTUSERS' });

module.exports = mongoose.model('ZTUSERS', ZTUSERS);