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
                    type,
                    id,  // ← Envía solo 'id' y deja que el servicio decida la key
                    data  // ← Todos los campos de actualización
                }
            });
        });

        await super.init();
    }
}

module.exports = UsersRolesController;