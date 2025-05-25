const ztlabels = require('../models/mongodb/ztlabels')
const ztvalues = require('../models/mongodb/ztvalues')
const ztroles = require('../models/mongodb/ztroles')

async function GetAllLabelsValues(req) {
    try {
        const query = req.req.query;
        const type = query?.type;

        if (type === 'label') {
            const labelId = query.id;
            if (labelId) {
                return await getLabelById(labelId);
            } else {
                return await getAllLabels();
            }

        } else if (type === 'value') {
            const valueId = query.id;
            const labelId = query.labelID;

            if (valueId) {
                return await getValueById(valueId);
            } else if (labelId) {
                return await getValuesByLabel(labelId);
            } else {
                return await getAllValues();
            }

        }else if (type === 'catalog'){
            return await getAllCatalog();
        } 
        else {
            throw ({code: 400, message:"Parámetro 'type' no válido. Usa 'label', 'value' o 'catalog'." });
        }
    } catch (error) {
        throw error;
    }
}


// LABELS
async function getAllLabels() {
    return await ztlabels.find({}).lean();
}

async function getLabelById(labelId) {
    return await ztlabels.findOne({ LABELID: labelId }).lean();
}

// VALUES
async function getAllValues() {
    return await ztvalues.find({}).lean();
}

async function getValueById(valueId) {
    return await ztvalues.findOne({ VALUEID: valueId }).lean();
}

async function getValuesByLabel(labelId) {
    return await ztvalues.find({ LABELID: labelId }).lean();
}

// Catalagos
async function getAllCatalog() {
  try {
    // Obtener todos los labels
    const labels = await ztlabels.find({
    //   'DETAIL_ROW.ACTIVED': true,
    //   'DETAIL_ROW.DELETED': false
    }).lean();
    
    // Obtener todos los values activos
    const allValues = await ztvalues.find({
    //   'DETAIL_ROW.ACTIVED': true,
    //   'DETAIL_ROW.DELETED': false
    }).lean();
    
    // Mapear los labels con sus values correspondientes
    const result = labels.map(label => {
      // Filtrar los values que pertenecen a este label
      const valuesForLabel = allValues.filter(value => 
        value.LABELID === label.LABELID 
        // && 
        // value.COMPANYID === label.COMPANYID && 
        // value.CEDIID === label.CEDIID
      );
      
      return {
        ...label,
        values: valuesForLabel
      };
    });
    
    return result;
  } catch (error) {
    console.error('Error en getLabelsWithValues:', error);
    throw error;
  }
}

// Patch de labels y values
// Patch para labels y values
async function UpdateLabelsValues(req) {
    const type = parseInt(req.req.query?.type);
    const id = req.req.query?.id;
    

    if (!id) {
        return { message: "Se requiere el parámetro 'id' para actualizar." };
    }

    if (type == 1) {
        const updateData = req.req.body.label;
        return patchLabels(req, id, updateData);
    } else if (type == 2) {
        const updateData = req.req.body.value;
        return patchValues(req, id, updateData);
    } else {
        return { message: "Parámetro 'type' no válido. Usa 1 para labels o 2 para values." };
    }
}

//POST
async function PostLabelsValues(req) {
    try {
        const type = parseInt(req.req.query?.type);

        if (type === 1) {
            const labelItem = req.data.label;
            if (!labelItem) {
                throw { code: 400, message: "Se requiere un objeto 'label' en la solicitud" };
            }

            // Validación del label
            if (!labelItem.LABELID || !labelItem.REGUSER) {
                throw { 
                    code: 400, 
                    message: "Los campos LABELID y REGUSER son obligatorios para un label" 
                };
            }

            // Verificar si el label ya existe
            const existingLabel = await ztlabels.findOne({ LABELID: labelItem.LABELID }).lean();
            if (existingLabel) {
                throw { 
                    code: 409, 
                    message: `Ya existe un label con LABELID: ${labelItem.LABELID}` 
                };
            }

            // Crear el nuevo label
            const newLabel = {
                LABELID: labelItem.LABELID,
                COMPANYID: labelItem.COMPANYID,
                CEDIID: labelItem.CEDIID,
                LABEL: labelItem.LABEL,
                INDEX: labelItem.INDEX,
                COLLECTION: labelItem.COLLECTION,
                SECTION: labelItem.SECTION,
                SEQUENCE: labelItem.SEQUENCE,
                IMAGE: labelItem.IMAGE,
                DESCRIPTION: labelItem.DESCRIPTION,
                DETAIL_ROW: {
                    ACTIVED: labelItem.ACTIVED !== undefined ? labelItem.ACTIVED : true,
                    DELETED: false,
                    DETAIL_ROW_REG: [{
                        CURRENT: true,
                        REGDATE: new Date(),
                        REGTIME: new Date(),
                        REGUSER: labelItem.REGUSER
                    }]
                }
            };

            // Guardar el label
            const savedLabel = await ztlabels.create(newLabel);

            return {
                message: "Label insertado correctamente",
                success: true,
                label: newLabel
            };

        } else if (type === 2) {
            const valueItem = req.data.value;
            if (!valueItem) {
                throw { code: 400, message: "Se requiere un objeto 'value' en la solicitud" };
            }

            // Validación del value
            if (!valueItem.VALUEID || !valueItem.LABELID || !valueItem.REGUSER) {
                throw { 
                    code: 400, 
                    message: "Los campos VALUEID, LABELID y REGUSER son obligatorios para un value" 
                };
            }

            // Verificar si el label padre existe
            const labelExists = await ztlabels.findOne({ LABELID: valueItem.LABELID }).lean();
            if (!labelExists) {
                throw { 
                    code: 404, 
                    message: `No existe un label con LABELID: ${valueItem.LABELID}` 
                };
            }

            // Verificar si el value ya existe
            const existingValue = await ztvalues.findOne({ VALUEID: valueItem.VALUEID }).lean();
            if (existingValue) {
                throw { 
                    code: 409, 
                    message: `Ya existe un value con VALUEID: ${valueItem.VALUEID}` 
                };
            }

            // Crear el nuevo value
            const newValue = {
                VALUEID: valueItem.VALUEID,
                COMPANYID: valueItem.COMPANYID,
                CEDIID: valueItem.CEDIID,
                LABELID: valueItem.LABELID,
                VALUEPAID: valueItem.VALUEPAID,
                VALUE: valueItem.VALUE,
                ALIAS: valueItem.ALIAS,
                SEQUENCE: valueItem.SEQUENCE,
                IMAGE: valueItem.IMAGE,
                DESCRIPTION: valueItem.DESCRIPTION,
                DETAIL_ROW: {
                    ACTIVED: valueItem.ACTIVED !== undefined ? valueItem.ACTIVED : true,
                    DELETED: false,
                    DETAIL_ROW_REG: [{
                        CURRENT: true,
                        REGDATE: new Date(),
                        REGTIME: new Date(),
                        REGUSER: valueItem.REGUSER
                    }]
                }
            };

            // Guardar el value
            const savedValue = await ztvalues.create(newValue).lean();

            return {
                message: "Value insertado correctamente",
                success: true,
                value: newValue
            };

        } else {
            throw { 
                code: 400, 
                message: "Parámetro 'type' no válido. Usa 1 para labels o 2 para values." 
            };
        }

    } catch (error) {
        // Si el error ya tiene código (es un error lanzado por nosotros), lo devolvemos tal cual
        if (error.code) {
            throw error;
        }
        // Para otros errores (de base de datos, etc.)
        console.error('Error en PostLabelsValues:', error);
        throw { 
            code: 500, 
            message: "Error interno del servidor al procesar la solicitud" 
        };
    }
}


// Actualización de Labels
async function patchLabels(req, id, updateData) {
    try {
        // 1. Verificar si existe el label
        const existingLabel = await ztlabels.findOne({ LABELID: id }).lean();
        if (!existingLabel) {
            return { message: `No se encontró label con LABELID: ${id}` };
        }

        // 2. Validar cambio de LABELID (si se está intentando modificar)
        if (updateData.LABELID && updateData.LABELID !== id) {
            // Verificar si el nuevo LABELID ya existe
            const labelWithNewId = await ztlabels.findOne({ 
                LABELID: updateData.LABELID 
            }).lean();
            
            if (labelWithNewId) {
                return { 
                    message: "Ya existe un label con el nuevo LABELID especificado",
                    conflict: {
                        existingLabel: labelWithNewId.LABELID,
                        attemptedNewId: updateData.LABELID
                    }
                };
            }

            // Si no existe, permitir el cambio (se actualizará abajo)
        }

        // 3. Realizar la actualización
        const updatedLabel = await ztlabels.findOneAndUpdate(
            { LABELID: id },
            { $set: updateData },
            { new: true, lean: true }
        );

        return {
            message: "Label actualizado exitosamente",
            success: true,
            // updatedLabel: updatedLabel
        };
    } catch (error) {
        throw error;
    }
}

// Actualización de Values
async function patchValues(req, id, updateData) {
    try {
        // 1. Encontrar el value que se quiere actualizar
        const valueToUpdate = await ztvalues.findOne({ VALUEID: id }).lean();
        if (!valueToUpdate) {
            return { message: `No se encontró value con VALUEID: ${id}` };
        }

        // 2. Validar que no se modifique LABELID o VALUEPAID
        if (updateData.LABELID && updateData.LABELID !== valueToUpdate.LABELID) {
            return { message: "No se puede modificar el LABELID de un value existente" };
        }

        if (updateData.VALUEPAID && updateData.VALUEPAID !== valueToUpdate.VALUEPAID) {
            return { message: "No se puede modificar el VALUEPAID de un value existente" };
        }
        

        // 3. Validar que si se modifica el VALUEID, el nuevo no exista ya
        if (updateData.VALUEID && updateData.VALUEID !== id) {
                // 4. Validar que no tenga valores dependientes
            const valor = await valideLabelid(valueToUpdate, "modificar");
            if (valor !== "" ) { // o simplemente if (valor != null)
                return valor;
            }
            const existingValue = await ztvalues.findOne({ VALUEID: updateData.VALUEID }).lean();
            if (existingValue) {
                return { message: `El VALUEID ${updateData.VALUEID} ya está en uso` };
            }
        }
        
        // 5. Si pasa todas las validaciones, proceder con la actualización
        const updatedValue = await ztvalues.findOneAndUpdate(
            { VALUEID: id },
            { $set: updateData },
            { new: true, lean: true }
        );
        
        return { 
            message: "Value actualizado exitosamente",
            success: true,
            // updatedValue: updatedValue 
        };
    } catch (error) {
        throw error;
    }
}

// Delete de labels y values
async function DeleteLabelsValues(req) {
    const type = parseInt(req.req.query?.type); 
    const id = req.req.query?.id;

    if (!id) {
        return { message: "Se requiere el parámetro 'id' para borrar." };
    }

    if (type == 1) {
        return deleteLabels(req, id);
    } else if (type == 2) {
        return deleteValues(req, id);
    } else {
        return { message: "Parámetro 'type' no válido. Usa 1 para labels o 2 para values." };
    }
}
// Borrado de Labels
async function deleteLabels(req, id) {
    try {
        const labelToDelete = await ztlabels.findOne({ LABELID: id }).lean();
        if (!labelToDelete) {
            return { message: `No se encontró label con idlabel: ${id}` };
        }
        
        await ztlabels.deleteOne({ LABELID: id });
        return { 
            message: "Label borrado fisicamente exitosamente",
            deletedLabel: labelToDelete 
        };
    } catch (error) {
        throw error;
    }
}

//Borrado de Values
async function deleteValues(req, id) {
    try {
        // 1. Encontrar el value que se quiere borrar
        const valueToDelete = await ztvalues.findOne({ VALUEID: id }).lean();
        if (!valueToDelete) {
            return { message: `No se encontró value con VALUEID: ${id}` };
        }

        // 2. Validar que no tenga valores dependientes
        const valor = await valideLabelid(valueToDelete, "borrar");
        if (valor !== "") { // o simplemente if (valor != null)
            return valor;
        }

        // 3. Si no tiene hijos, proceder con el borrado
        await ztvalues.deleteOne({ VALUEID: id });
        
        return { 
            message: "Value borrado fisicamente exitosamente",
            deletedValue: valueToDelete 
        };
    } catch (error) {
        throw error;
    }
}

async function valideLabelid(valueToDelete, mensaje) {
    // 2. Validar si tiene hijos
    let children = [];

    // Caso especial para LABELID = "IdApplications", "IdViews"
    if (["IdApplications", "IdViews"].includes(valueToDelete.LABELID)) {
        const appName = valueToDelete.VALUEID;
        children = await ztvalues.find({ 
            VALUEPAID: { $regex: new RegExp(`${valueToDelete.LABELID}-${appName}`) } 
        }).lean();
        // Si tiene hijos no se puede borrar
        if (children.length > 0) {
            return { 
                message: `No se puede ${mensaje} porque tiene valores hijos asociados`,
                parentValue: valueToDelete,
                childValues: children 
            };
        }
    } 

    

    if (["IdProcesses", "IdPrivileges"].includes(valueToDelete.LABELID)) {
        let rolesUsingValue = [];
        
        if (valueToDelete.LABELID === "IdProcesses") {
            // Buscar en PROCESSID de ztroles
            const processPattern = `IdProcesses-${valueToDelete.VALUEID}`;
            rolesUsingValue = await ztroles.find({
                "PRIVILEGES.PROCESSID": { 
                    $regex: new RegExp(`^${processPattern}$`), 
                    $options: 'i' 
                }
            }).lean();
        } 
        else if (valueToDelete.LABELID === "IdPrivileges") {
            // Buscar en PRIVILEGEID de ztroles
            rolesUsingValue = await ztroles.find({
                "PRIVILEGES.PRIVILEGEID": valueToDelete.VALUEID
            }).lean();
        }

        if (rolesUsingValue.length > 0) {
            return { 
                message: `No se puede ${mensaje} porque está siendo usado por ${rolesUsingValue.length} rol(es)`,
                parentValue: valueToDelete,
                rolesUsingValue: rolesUsingValue.map(r => r.ROLEID)
            };
        }
    }
    return "";
}


module.exports = { GetAllLabelsValues, DeleteLabelsValues, UpdateLabelsValues, PostLabelsValues }