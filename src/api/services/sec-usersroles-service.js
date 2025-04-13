const { ZTUSERS, ZTROLES, ZTVALUES } = require('../models/mongodb');
const mongoose = require('mongoose');

async function PatchUserOrRole(req) {
    const { USERID, ROLEID, ...updates } = req.body;
    let entity, entityType;

    try {
        // 1. Determinar entidad (usuario o rol)
        if (USERID) {
            entity = await ZTUSERS.findOne({ USERID });
            entityType = 'user';
            if (!entity) throw new Error(`Usuario con USERID ${USERID} no encontrado`);
        } else if (ROLEID) {
            entity = await ZTROLES.findOne({ ROLEID });
            entityType = 'role';
            if (!entity) throw new Error(`Rol con ROLEID ${ROLEID} no encontrado`);
        } else {
            throw new Error("Se requiere USERID o ROLEID");
        }

        // 2. Validaciones específicas
        if (entityType === 'user' && updates.ROLES) {
            await validateRolesExist(updates.ROLES);
        }

        if (entityType === 'role' && updates.PRIVILEGES) {
            await validatePrivilegesExist(updates.PRIVILEGES);
        }

        // 3. Borrado lógico (si viene en updates)
        if (updates.DETAIL_ROW?.DELETED === true) {
            updates.DETAIL_ROW.ACTIVED = false;
        }

        // 4. Actualizar DETAIL_ROW_REG (auditoría)
        updates.DETAIL_ROW_REG = updateAuditLog(entity.DETAIL_ROW_REG, req.user?.id || 'system');

        // 5. Ejecutar actualización
        const Model = entityType === 'user' ? ZTUSERS : ZTROLES;
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
        // 1. Determinar entidad (usuario o rol)
        if (USERID) {
            // Eliminar usuario
            const result = await ZTUSERS.deleteOne({ USERID });
            if (result.deletedCount === 0) throw new Error(`Usuario con USERID ${USERID} no encontrado`);
            return { success: true, message: `Usuario ${USERID} eliminado físicamente` };

        } else if (ROLEID) {
            // Validar que el rol no esté en uso
            const usersWithRole = await ZTUSERS.countDocuments({ 
                "ROLES.ROLEID": ROLEID 
            });
            if (usersWithRole > 0) throw new Error(`No se puede eliminar: Rol ${ROLEID} está asignado a ${usersWithRole} usuario(s)`);

            // Eliminar rol
            const result = await ZTROLES.deleteOne({ ROLEID });
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
    const existingRoles = await ZTROLES.countDocuments({ ROLEID: { $in: roleIds } });
    if (existingRoles !== roleIds.length) {
        throw new Error("Uno o más ROLES no existen en ZTROLES");
    }
}

async function validatePrivilegesExist(privileges) {
    for (const priv of privileges) {
        // Validar PROCESSID en ZTVALUES
        const processExists = await ZTVALUES.countDocuments({ 
            LABELID: "idProcess", 
            VALUEID: priv.PROCESSID 
        });
        if (!processExists) throw new Error(`PROCESSID ${priv.PROCESSID} no existe`);

        // Validar cada PRIVILEGEID en ZTVALUES
        for (const privilegeId of priv.PRIVILEGEID) {
            const privilegeExists = await ZTVALUES.countDocuments({ 
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