const mongoose = require('mongoose');

const RolesInfoSchema = new mongoose.Schema({}, { strict: false }); 

const RolesInfo = mongoose.model('roles_info', RolesInfoSchema, 'roles_info'); 


module.exports = RolesInfo;
