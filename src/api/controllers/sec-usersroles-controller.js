const cds = require('@sap/cds');
const servicio = require('../services/sec-usersroles-service');

class UsersRolesController extends cds.ApplicationService {
    async init() {
        
        // PATCH - Actualización parcial + borrado lógico
        this.on('patchUserOrRole', async (req) => {
            return servicio.PatchUserOrRole(req);
        });

        // DELETE - Borrado físico
        this.on('deleteUserOrRole', async (req) => {
            return servicio.DeleteUserOrRole(req);
        });

        await super.init();
    }
}

module.exports = UsersRolesController;