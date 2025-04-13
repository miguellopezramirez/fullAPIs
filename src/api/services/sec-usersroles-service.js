const ztusers = require('../models/mongodb/ztusers')
const ztroles = require('../models/mongodb/ztroles')
const ztvalues = require('../models/mongodb/ztvalues')

async function PatchUser(req) {
    const { body } = req;
    console.log("[DEBUG] Body recibido para usuario:", body);

    const { id, data: updates = {} } = body;
    if (!id) throw new Error("Se requiere USERID");

    try {
        // 1. Verificar existencia
        const user = await ztusers.findOne({ USERID: id });
        if (!user) throw new Error(`Usuario con USERID ${id} no encontrado`);

        // 2. Validaciones específicas
        if (updates.ROLES) {
            await validateRolesExist(updates.ROLES);
        }

        // 3. Preparar updates
        if (updates.DETAIL_ROW?.DELETED === true) {
            updates.DETAIL_ROW.ACTIVED = false;
        }
        updates.DETAIL_ROW_REG = updateAuditLog(user.DETAIL_ROW_REG, 'system');

        // 4. Ejecutar actualización
        const result = await ztusers.updateOne({ USERID: id }, { $set: updates });
        return { success: true, modifiedCount: result.modifiedCount };

    } catch (error) {
        console.error("[ERROR] PatchUser:", error.message);
        throw error;
    }
}

async function PatchRole(req) {
    const { body } = req;
    console.log("[DEBUG] Body recibido para rol:", body);

    const { id, data: updates = {} } = body;
    if (!id) throw new Error("Se requiere ROLEID");

    try {
        // 1. Verificar existencia
        const role = await ztroles.findOne({ ROLEID: id });
        if (!role) throw new Error(`Rol con ROLEID ${id} no encontrado`);

        // 2. Validaciones específicas
        if (updates.PRIVILEGES) {
            await validatePrivilegesExist(updates.PRIVILEGES);
        }

        // 3. Preparar updates
        if (updates.DETAIL_ROW?.DELETED === true) {
            updates.DETAIL_ROW.ACTIVED = false;
        }
        updates.DETAIL_ROW_REG = updateAuditLog(role.DETAIL_ROW_REG, 'system');

        // 4. Ejecutar actualización
        const result = await ztroles.updateOne({ ROLEID: id }, { $set: updates });
        return { success: true, modifiedCount: result.modifiedCount };

    } catch (error) {
        console.error("[ERROR] PatchRole:", error.message);
        throw error;
    }
}

async function DeleteUserOrRole(req) {
    const { USERID, ROLEID } = req.body;

    try {
        // 1. Determinar entidad (usuario o rol)
        if (USERID) {
            // Eliminar usuario
            const result = await ztusers.deleteOne({ USERID });
            if (result.deletedCount === 0) throw new Error(`Usuario con USERID ${USERID} no encontrado`);
            return { success: true, message: `Usuario ${USERID} eliminado físicamente` };

        } else if (ROLEID) {
            // Validar que el rol no esté en uso
            const usersWithRole = await ztusers.countDocuments({ 
                "ROLES.ROLEID": ROLEID 
            });
            if (usersWithRole > 0) throw new Error(`No se puede eliminar: Rol ${ROLEID} está asignado a ${usersWithRole} usuario(s)`);

            // Eliminar rol
            const result = await ztroles.deleteOne({ ROLEID });
            if (result.deletedCount === 0) throw new Error(`Rol con ROLEID ${ROLEID} no encontrado`);
            return { success: true, message: `Rol ${ROLEID} eliminado físicamente` };

        } else {
            throw new Error("Se requiere USERID o ROLEID");
        }
    } catch (error) {
        console.error("Error en DeleteUserOrRole:", error);
        throw error;
    }
}

// --- Funciones de Validación ---
async function validateRolesExist(roles) {
    const roleIds = roles.map(r => r.ROLEID);
    const existingRoles = await ztroles.countDocuments({ ROLEID: { $in: roleIds } });
    if (existingRoles !== roleIds.length) {
        throw new Error("Uno o más ROLES no existen en ztroles");
    }
}

async function validatePrivilegesExist(privileges) {
    for (const priv of privileges) {
        // Validar PROCESSID en ZTVALUES
        const processExists = await ztvalues.countDocuments({ 
            LABELID: "idProcess", 
            VALUEID: priv.PROCESSID 
        });
        if (!processExists) throw new Error(`PROCESSID ${priv.PROCESSID} no existe`);

        // Validar cada PRIVILEGEID en ZTVALUES
        for (const privilegeId of priv.PRIVILEGEID) {
            const privilegeExists = await ztvalues.countDocuments({ 
                LABELID: "IdPrivileges", 
                VALUEID: privilegeId 
            });
            if (!privilegeExists) throw new Error(`PRIVILEGEID ${privilegeId} no existe`);
        }
    }
}

// --- Auditoría ---
function updateAuditLog(existingLog = [], currentUser) {
    // Marcar registros anteriores como no actuales
    const updatedLog = existingLog.map(entry => ({ ...entry, CURRENT: false }));

    // Añadir nuevo registro
    updatedLog.push({
        CURRENT: true,
        REGDATE: new Date(),
        REGTIME: new Date(),
        REGUSER: currentUser
    });

    return updatedLog;
}

// --- GET ALL ---
async function GetAllUsers() {
    try {
        const users = await ztusers.find({}).lean(); 
      
        return users;
    } catch (error) {
        console.error("Error en GetAllUsers:", error);
        throw error;
    }
}

async function GetAllRoles() {
    try {
        const roles = await ztroles.find({}).lean(); //lean para que parsie en json si no me truena xd
        return roles;
    } catch (error) {
        console.error("Error en GetAllRoles:", error);
        throw error;
    }
}
// --- GET USER BY ID ---
async function GetUserById(userId) {
    try {
        const user = await ztusers.findOne({ USERID: userId }).lean();
        if (!user) throw new Error(`Usuario con USERID ${userId} no encontrado`);
        return user;
    } catch (error) {
        console.error("Error en GetUserById:", error);
        throw error;
    }
}

// --- GET ROLE BY ID ---
async function GetRoleById(roleId) {
    try {
        const role = await ztroles.findOne({ ROLEID: roleId }).lean();
        if (!role) throw new Error(`Rol con ROLEID ${roleId} no encontrado`);
        return role;
    } catch (error) {
        console.error("Error en GetRoleById:", error);
        throw error;
    }
}

module.exports = {
    PatchUser,
    PatchRole,
    DeleteUserOrRole,
    GetAllUsers,
    GetAllRoles,
    GetUserById,  // exportamos la nueva función
    GetRoleById   // exportamos la nueva función
};
