const ztusers = require('../models/mongodb/ztusers');
const ztroles = require('../models/mongodb/ztroles');
const ztvalues = require('../models/mongodb/ztvalues');

async function PatchUserOrRole(req) {
    const { USERID, ROLEID, ...updates } = req.body;
    let entity, entityType;

    try {
        if (USERID) {
            entity = await ztusers.findOne({ USERID });
            entityType = 'user';
            if (!entity) throw new Error(`Usuario con USERID ${USERID} no encontrado`);
        } else if (ROLEID) {
            entity = await ztroles.findOne({ ROLEID });
            entityType = 'role';
            if (!entity) throw new Error(`Rol con ROLEID ${ROLEID} no encontrado`);
        } else {
            throw new Error("Se requiere USERID o ROLEID");
        }

        if (entityType === 'user' && updates.ROLES) {
            await validateRolesExist(updates.ROLES);
        }

        if (entityType === 'role' && updates.PRIVILEGES) {
            await validatePrivilegesExist(updates.PRIVILEGES);
        }

        if (updates.DETAIL_ROW?.DELETED === true) {
            updates.DETAIL_ROW.ACTIVED = false;
        }

        updates.DETAIL_ROW_REG = updateAuditLog(entity.DETAIL_ROW_REG, req.user?.id || 'system');

        const Model = entityType === 'user' ? ztusers : ztroles;
        const filter = entityType === 'user' ? { USERID } : { ROLEID };
        const result = await Model.updateOne(filter, { $set: updates });

        return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
        console.error("Error en PatchUserOrRole:", error);
        throw error;
    }
}

async function DeleteUserOrRole(req) {
    const { USERID, ROLEID } = req.body;

    try {
        if (USERID) {
            const result = await ztusers.deleteOne({ USERID });
            if (result.deletedCount === 0) throw new Error(`Usuario con USERID ${USERID} no encontrado`);
            return { success: true, message: `Usuario ${USERID} eliminado físicamente` };

        } else if (ROLEID) {
            const usersWithRole = await ztusers.countDocuments({ 
                "ROLES.ROLEID": ROLEID 
            });
            if (usersWithRole > 0) throw new Error(`No se puede eliminar: Rol ${ROLEID} está asignado a ${usersWithRole} usuario(s)`);

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
        const processExists = await ztvalues.countDocuments({ 
            LABELID: "idProcess", 
            VALUEID: priv.PROCESSID 
        });
        if (!processExists) throw new Error(`PROCESSID ${priv.PROCESSID} no existe`);

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
    const updatedLog = existingLog.map(entry => ({ ...entry, CURRENT: false }));

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
    PatchUserOrRole,
    DeleteUserOrRole,
    GetAllUsers,
    GetAllRoles,
    GetUserById,  // exportamos la nueva función
    GetRoleById   // exportamos la nueva función
};
