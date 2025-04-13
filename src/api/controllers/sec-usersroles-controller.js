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

        // PATCH para usuarios
        this.on('update-user', async (req) => {
            const userData = req.data.users; // Accede directamente al objeto users
            return await servicio.PatchUser({ 
                body: {
                    type: 'user',
                    id: userData.USERID, // Asume que USERID viene en el payload
                    data: userData // Todos los campos de actualización
                }
            });
        });

        // PATCH para roles
        this.on('update-rol', async (req) => {
            const roleData = req.data.roles; // Accede directamente al objeto roles
            return await servicio.PatchRole({ 
                body: {
                    type: 'role',
                    id: roleData.ROLEID, // Asume que ROLEID viene en el payload
                    data: roleData // Todos los campos de actualización
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
