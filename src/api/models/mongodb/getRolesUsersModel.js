const mongoose = require('mongoose');

const RolesInfoUsersSchema = new mongoose.Schema({}, { strict: false }); 

const RolesInfoUsers = mongoose.model('roles_users', RolesInfoUsersSchema, 'roles_users'); 


module.exports = RolesInfoUsers;