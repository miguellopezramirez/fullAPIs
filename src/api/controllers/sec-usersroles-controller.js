const cds = require('@sap/cds');

const { RolesCRUD, UsersCRUD } = require('../services/sec-usersroles-service');


class SecurityClass extends cds.ApplicationService {
  async init() {

    this.on('usersCRUD', async (req) => {
      return UsersCRUD(req);
    });

    //CRUD COMPLETO DE ROLES ദ്ദി •⩊• ), para no tener que hacer todo x separado
    this.on('rolesCRUD', async (req) => {
      return RolesCRUD(req);
    });

  };


  
};
module.exports = SecurityClass;