//Importacion de modelos
// ==============================
const UsersSchema = require('../models/mongodb/ztusers');
const RoleSchema = require('../models/mongodb/ztroles');
const ValueSchema = require('../models/mongodb/ztvalues'); // Modelo para validar proceso
const RolesInfoSchema = require('../models/mongodb/getRolesModel'); // Vista Roles
const RolesInfoUsers = require('../models/mongodb/getRolesUsersModel'); // Vista Usuarios por Rol

//────୨ৎ────    
// Servicio CRUD para Roles
//────୨ৎ────
async function RolesCRUD(req) {
  try {
    //────୨ৎ────
    //Parámetros
    //────୨ৎ────
    const { procedure, type, roleid } = req.req.query;
    const currentUser = req.req?.query?.RegUser || 'SYSTEM';
    const body = req.req.body;
    let result;

    // Validación de PRIVILEGIOS -> Validar si los PROCESSID existen
    //────୨ৎ────
    const validarProcessIds = async (privilegios = []) => {
      const processIds = (privilegios || []).map(p =>
        p.PROCESSID.replace('IdProcess-', '').trim()
      );

      const procesosValidos = await ValueSchema.find({
        LABELID: 'IdProcesses',
        VALUEID: { $in: processIds }
      }).lean();

      if (procesosValidos.length !== processIds.length) {
        const encontrados = procesosValidos.map(p => p.VALUEID);
        const faltantes = processIds.filter(id => !encontrados.includes(id));
        throw new Error(`No existe el siguiente proceso en la Base de Datos: ${faltantes.join(', ')}`);
      }
    };

    // Switch princpal de Roles
    //────୨ৎ────
    switch (procedure) {

      //All roles
      //────୨ৎ────
      case 'get':
        switch (type) {
          case 'all':
            // Obtener todos los roles (vista enriquecida)
            //────୨ৎ────
          result = await RolesInfoSchema.find().lean();
            break;
          case 'one':
            // Obtener un solo rol por ROLEID
            //────୨ৎ────
            result = await RolesInfoSchema.find({ ROLEID: roleid }).lean();
            break;
          case 'users':
            // Obtener usuarios relacionados con un rol, con la otra vista enriquecida
            //────୨ৎ────
            const filter = roleid ? { ROLEID: roleid } : {};
            result = await RolesInfoUsers.find(filter).lean();
            break;
          default:
            throw new Error('Tipo inválido en GET');
        }
        break;

      // CREAR NUEVO ROL
      //────୨ৎ────
      case 'post':
        // Validar los privilegios asociados
        //────୨ৎ────
        await validarProcessIds(body.PRIVILEGES);

        // Crear nueva instancia del modelo y registrar el usuario
        //────୨ৎ────
        const instance = new RoleSchema(body);
        instance._reguser = currentUser;

        const nuevoRol = await instance.save();
        result = nuevoRol.toObject();
        break;

      // ACTUALIZAR ROL EXISTENTE
      //────୨ৎ────
      case 'put':
        if (!roleid) throw new Error('Parametro faltante (RoleID)');
        const updateData = body;
        if (!updateData || Object.keys(updateData).length === 0) {
          throw new Error('No se proporcionan campos para actualizar');
        }

        const roleToUpdate = await RoleSchema.findOne({ ROLEID: roleid });
        if (!roleToUpdate) throw new Error('El rol a actualizar no existe');

        // Validar privilegios si se actualizan
        if (updateData.PRIVILEGES) {
          await validarProcessIds(updateData.PRIVILEGES);
        }

        // Historial de modificación (DETAIL_ROW)
        const nowPut = new Date();
        if (!roleToUpdate.DETAIL_ROW) {
          roleToUpdate.DETAIL_ROW = { ACTIVED: true, DELETED: false, DETAIL_ROW_REG: [] };
        }

        if (Array.isArray(roleToUpdate.DETAIL_ROW.DETAIL_ROW_REG)) {
          roleToUpdate.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => {
            if (reg.CURRENT) reg.CURRENT = false;
          });
        } else {
          roleToUpdate.DETAIL_ROW.DETAIL_ROW_REG = [];
        }

        roleToUpdate.DETAIL_ROW.DETAIL_ROW_REG.push({
          CURRENT: true,
          REGDATE: nowPut,
          REGTIME: nowPut,
          REGUSER: currentUser
        });

        // Aplicar cambios
        Object.assign(roleToUpdate, updateData);
        const updatedRole = await roleToUpdate.save();
        result = updatedRole.toObject();
        break;

      // ELIMINAR ROL (Lógica o Física)
      case 'delete':
        if (!roleid) throw new Error('Parametro faltante (RoleID)');

        switch (type) {
          case 'logic':
            // Eliminación lógica (se marca como inactivo y eliminado)
            const roleToLogicDelete = await RoleSchema.findOne({ ROLEID: roleid });
            if (!roleToLogicDelete) throw new Error('No se encontró ningún rol');

            const nowDel = new Date();
            if (!roleToLogicDelete.DETAIL_ROW) {
              roleToLogicDelete.DETAIL_ROW = { ACTIVED: true, DELETED: false, DETAIL_ROW_REG: [] };
            }

            if (Array.isArray(roleToLogicDelete.DETAIL_ROW.DETAIL_ROW_REG)) {
              roleToLogicDelete.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => {
                if (reg.CURRENT) reg.CURRENT = false;
              });
            } else {
              roleToLogicDelete.DETAIL_ROW.DETAIL_ROW_REG = [];
            }

            roleToLogicDelete.DETAIL_ROW.ACTIVED = false;
            roleToLogicDelete.DETAIL_ROW.DELETED = true;
            roleToLogicDelete.DETAIL_ROW.DETAIL_ROW_REG.push({
              CURRENT: true,
              REGDATE: nowDel,
              REGTIME: nowDel,
              REGUSER: currentUser
            });

            const logicDeleted = await roleToLogicDelete.save();
            result = logicDeleted.toObject();
            break;

          case 'hard':
            // Eliminación física (borrado de la base de datos)
            const hardDeleted = await RoleSchema.deleteOne({ ROLEID: roleid });
            if (hardDeleted.deletedCount === 0) {
              throw new Error('No existe el rol especificado.');
            }
            result = { message: 'Rol eliminado.' };
            break;

          default:
            throw new Error('Tipo inválido en DELETE');
        }
        break;

      //Default si no es ningun procedure o es invalido
      //────୨ৎ────
      default:
        throw new Error('Parámetro "procedure" inválido o no especificado');
    }

    // Retornar resultado final
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error en RolesCRUD:', error);
    return { error: true, message: error.message };
  }
}

// ==============================
// USERSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
// ==============================


// ==============================
// FUNCIÓN AUXILIAR: validarRol
// ==============================
const validarRol = async (roles) => {
    if (!roles || roles.length === 0) return [];
    let rolesId = roles.map(r => r.ROLEID);
    let validation = await RoleSchema.find({ ROLEID: { $in: rolesId } }).lean();
    if (validation.length !== roles.length) {
        const encontrados = validation.map(r => r.ROLEID);
        const faltantes = rolesId.filter(id => !encontrados.includes(id));
        throw new Error(`Alguno de los roles ingresados no existe: ${faltantes.join(', ')}`);
    }
    return roles;
};

// ==============================
// FUNCIÓN PRINCIPAL: UsersCRUD
// ==============================
async function UsersCRUD(req) {
    try {
        const { procedure, type, userid } = req.req.query;
        let res;

        switch (procedure) {
            case 'get':
                if (type === 'all') {
                    res = await GetAllUsers();
                } else if (type === 'one') {
                    res = await GetOneUser(userid);
                } else {
                    throw new Error("Coloca un tipo de búsqueda válido (all o one)");
                }
                break;

            case 'post':
                res = await PostUser(req);
                break;

            case 'put':
                res = await UpdateUser(req, userid);
                break;

            case 'delete':
                if (type === 'logic') {
                    res = await LogDelete(userid, req);
                } else if (type === 'hard') {
                    res = await HardDelete(userid);
                } else {
                    throw new Error("Tipo de borrado inválido (logic o hard)");
                }
                break;

            default:
                throw new Error('Parámetros inválidos o incompletos');
        }

        return res;
    } catch (error) {
        console.error('Error en UsersCRUD:', error);
        return { error: true, message: error.message };
    }
}

// ==============================
// GET ALL USERS
// ==============================
async function GetAllUsers() {
    const allUsers = await UsersSchema.find().lean();
    const enrichedUsers = await Promise.all(allUsers.map(async user => {
        const userRoles = user.ROLES || [];
        const fullRoles = await Promise.all(userRoles.map(async roleRef => {
            const role = await RoleSchema
                .findOne({ ROLEID: roleRef.ROLEID })
                .select("-DETAIL_ROW")
                .lean();
            return role || {
                ROLEID: roleRef.ROLEID,
                error: "Rol no encontrado"
            };
        }));
        return {
            ...user,
            ROLES: fullRoles
        };
    }));
    return enrichedUsers;
}

// ==============================
// GET ONE USER
// ==============================
async function GetOneUser(userid) {
    const user = await UsersSchema.findOne({ USERID: userid }).lean();
    if (!user) return { mensaje: 'No se encontró el usuario' };
    const userRoles = user.ROLES || [];
    const fullRoles = await Promise.all(userRoles.map(async roleRef => {
        const role = await RoleSchema
            .findOne({ ROLEID: roleRef.ROLEID })
            .select("-DETAIL_ROW")
            .lean();
        return role ? { ...roleRef, ...role } : {
            ROLEID: roleRef.ROLEID,
            error: "Rol no encontrado"
        };
    }));
    return {
        ...user,
        ROLES: fullRoles
    };
}

// ==============================
// POST USER
// ==============================
async function PostUser(req) {
    const currentUser = req.req?.query?.RegUser || 'SYSTEM';
    const newUser = req.req.body;
    if (!newUser) throw new Error('No envió los datos del usuario a agregar');
    newUser.ROLES = await validarRol(newUser.ROLES || []);
    const instance = new UsersSchema(newUser);
    instance._reguser = currentUser;
    const validUser = await instance.save();
    return validUser.toObject();
}

// ==============================
// PUT USER
// ==============================
async function UpdateUser(req, userid) {
    const currentUser = req.req?.query?.RegUser || 'SYSTEM';
    const cambios = req.req.body;
    const user = await UsersSchema.findOne({ USERID: userid });
    if (!user) throw new Error('No se encontró ningún usuario');
    if (!cambios || Object.keys(cambios).length === 0)
        throw new Error('No se enviaron datos para actualizar');
    if (cambios.ROLES) {
        cambios.ROLES = await validarRol(cambios.ROLES);
    }
    if (!user.DETAIL_ROW) {
        user.DETAIL_ROW = { ACTIVED: true, DELETED: false, DETAIL_ROW_REG: [] };
    }
    const now = new Date();
    if (!Array.isArray(user.DETAIL_ROW.DETAIL_ROW_REG)) {
        user.DETAIL_ROW.DETAIL_ROW_REG = [];
    } else {
        user.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => {
            if (reg.CURRENT) reg.CURRENT = false;
        });
    }
    user.DETAIL_ROW.DETAIL_ROW_REG.push({
        CURRENT: true,
        REGDATE: now,
        REGTIME: now,
        REGUSER: currentUser
    });
    Object.keys(cambios).forEach(key => {
        user[key] = cambios[key];
    });
    const updated = await user.save();
    return updated.toObject();
}

// ==============================
// LOGICAL DELETE
// ==============================
async function LogDelete(userid, req) {
    const currentUser = req.req?.query?.RegUser || 'SYSTEM';
    const user = await UsersSchema.findOne({ USERID: userid });
    if (!user) throw new Error('No se encontró ningún usuario');
    if (!user.DETAIL_ROW) {
        user.DETAIL_ROW = { ACTIVED: true, DELETED: false, DETAIL_ROW_REG: [] };
    }
    const now = new Date();
    if (!Array.isArray(user.DETAIL_ROW.DETAIL_ROW_REG)) {
        user.DETAIL_ROW.DETAIL_ROW_REG = [];
    } else {
        user.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => {
            if (reg.CURRENT) reg.CURRENT = false;
        });
    }
    user.DETAIL_ROW.ACTIVED = false;
    user.DETAIL_ROW.DELETED = true;
    user.DETAIL_ROW.DETAIL_ROW_REG.push({
        CURRENT: true,
        REGDATE: now,
        REGTIME: now,
        REGUSER: currentUser
    });
    const updated = await user.save();
    return updated.toObject();
}

// ==============================
// HARD DELETE
// ==============================
async function HardDelete(userid) {
    const deleted = await UsersSchema.findOneAndDelete({ USERID: userid });
    if (!deleted) {
        throw new Error("No se pudo eliminar el usuario especificado");
    }
    return { mensaje: 'Usuario eliminado con éxito y para siempre' };
}

// Exportar función principal del servicio
module.exports = { RolesCRUD, UsersCRUD };
