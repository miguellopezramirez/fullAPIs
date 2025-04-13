const cds = require('@sap/cds');
const servicio = require('../services/sec-usersroles-service');

class UsersRolesController extends cds.ApplicationService {
    async init() {
        // DELETE unificado
        this.on('delete', async (req) => {
            const { type, id } = req.data;
            return await servicio.DeleteUserOrRole({ 
                body: { 
                    [type === 'user' ? 'USERID' : 'ROLEID']: id 
                } 
            });
        });

        // PATCH unificado
        this.on('update', async (req) => {
            const { type, id, data } = req.data;
            return await servicio.PatchUserOrRole({ 
                body: {
                    [type === 'user' ? 'USERID' : 'ROLEID']: id,
                    ...data
                }
            });
        });

        await super.init();
    }
}

module.exports = UsersRolesController;