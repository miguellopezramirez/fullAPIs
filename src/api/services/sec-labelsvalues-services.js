const ztlabels = require('../models/mongodb/ztlabels')
const ztvalues = require('../models/mongodb/ztvalues')
const ztroles = require('../models/mongodb/ztroles')

async function GetAllLabelsValues(req) {
    try {
        const type = parseInt(req.req.query?.type);

        if (type == 1) {
            
            return getLabels(req);
        } else if (type == 2) {
            
            return getValues(req)
        } else {
            // Podés personalizar esta parte según tu API
            return { message: "Parámetro 'type' no válido. Usa 1 para labels o 2 para values." };
        }
    } catch (error) {
        throw error;
    }
}

async function getLabels(req) {
    try {
        const labels = await ztlabels.find().lean();
        return (labels);
    } catch (error) {
        throw error;
    }
}

async function getValues(req) {
    try {
        const values = await ztvalues.find().lean();
        return (values);
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
            message: "Label borrado exitosamente",
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
                    message: "No se puede borrar porque tiene valores hijos asociados",
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
                    message: `No se puede borrar porque está siendo usado por ${rolesUsingValue.length} rol(es)`,
                    parentValue: valueToDelete,
                    rolesUsingValue: rolesUsingValue.map(r => r.ROLEID)
                };
            }
        }

        // 3. Si no tiene hijos, proceder con el borrado
        await ztvalues.deleteOne({ VALUEID: id });
        
        return { 
            message: "Value borrado exitosamente",
            deletedValue: valueToDelete 
        };
    } catch (error) {
        throw error;
    }
}


module.exports = { GetAllLabelsValues, DeleteLabelsValues }