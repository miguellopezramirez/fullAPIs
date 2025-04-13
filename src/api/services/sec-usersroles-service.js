const ztusers = require('../models/mongodb/ztusers')
const ztroles = require('../models/mongodb/ztroles')
const ztvalues = require('../models/mongodb/ztvalues')

async function PatchUserOrRole(req) {
    const { body } = req;
    console.log("[DEBUG] Body recibido:", body);

    const { type, id, data: updates = {} } = body;
    if (!type || !id) throw new Error("Se requiere type e id");
    if (!['user', 'role'].includes(type)) throw new Error("Tipo inválido");

    try {
        // 1. Determinar modelo y filtro
        const Model = type === 'user' ? ztusers : ztroles;
        const filter = type === 'user' ? { USERID: id } : { ROLEID: id };

        // 2. Verificar existencia
        const entity = await Model.findOne(filter);
        if (!entity) throw new Error(`${type} con ID ${id} no encontrado`);

        // 3. Validaciones (roles/privilegios)
        if (type === 'user' && updates.ROLES) {
            await validateRolesExist(updates.ROLES);
        } else if (type === 'role' && updates.PRIVILEGES) {
            await validatePrivilegesExist(updates.PRIVILEGES);
        }

        // 4. Preparar updates (borrado lógico + auditoría)
        if (updates.DETAIL_ROW?.DELETED === true) {
            updates.DETAIL_ROW.ACTIVED = false;
        }
        updates.DETAIL_ROW_REG = updateAuditLog(entity.DETAIL_ROW_REG, 'system');

        // 5. Ejecutar actualización
        const result = await Model.updateOne(filter, { $set: updates });
        return { success: true, modifiedCount: result.modifiedCount };

    } catch (error) {
        console.error("[ERROR] PatchUserOrRole:", error.message);
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

module.exports = { PatchUserOrRole, DeleteUserOrRole };