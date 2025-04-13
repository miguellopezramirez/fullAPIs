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

        // GET ALL USERS
        this.on('READ', 'Users', async (req) => {
            try {
                const users = await servicio.GetAllUsers();
                return users;
            } catch (error) {
                console.error("Error leyendo usuarios:", error);
                req.error(500, "Error al obtener usuarios");
            }
        });

        // GET USER BY ID
        this.on('READ', 'User', async (req) => {
            const { id } = req.params;
            try {
                const user = await servicio.GetUserById(id); // Llamada al servicio para obtener usuario por ID
                return user;
            } catch (error) {
                console.error("Error obteniendo usuario por ID:", error);
                req.error(500, "Error al obtener usuario");
            }
        });

        // GET ALL ROLES
        this.on('READ', 'Roles', async (req) => {
            try {
                const roles = await servicio.GetAllRoles();
                return roles;
            } catch (error) {
                console.error("Error leyendo roles:", error);
                req.error(500, "Error al obtener roles");
            }
        });

        // GET ROLE BY ID
        this.on('READ', 'Role', async (req) => {
            const { id } = req.params;
            try {
                const role = await servicio.GetRoleById(id); // Llamada al servicio para obtener rol por ID
                return role;
            } catch (error) {
                console.error("Error obteniendo rol por ID:", error);
                req.error(500, "Error al obtener rol");
            }
        });

        await super.init();
    }
}

module.exports = UsersRolesController;
