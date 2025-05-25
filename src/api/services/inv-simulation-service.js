const ztsimulation = require('../models/mongodb/ztsimulation');

async function getAllSimulaciones(req) {
    try {
        // Verifica si se ha proporcionado un USERID en la consulta
        const USERID = req.req.body?.USERID;
        const SIMULATIONID = req.req.query?.id;
        
        // Crear una variable para almacenar la simulación
        let simulation;
        
        // Caso 1: Búsqueda por ID específico
        if (SIMULATIONID != null) {
            simulation = await ztsimulation.findOne({ SIMULATIONID }).lean();
        }
        // Caso 2: Obtener todos los registros (filtrados por campos)
        else {
            simulation = await ztsimulation.find(
                { USERID },
                {
                    SIMULATIONID: 1,
                    SIMULATIONNAME: 1,
                    STARTDATE: 1,
                    ENDDATE: 1,
                    STRATEGY: 1,
                    SYMBOL: 1,
                    SUMMARY: 1,
                    SPECS: 1,
                    _id: 0
                }
            ).lean();
        }

        return simulation;
    } catch(e) {
        console.error("Error en GetAllSimulaciones:", e);
        return { error: e.message }; // Devuelve el error en formato objeto
    }
}

/**
 * Elimina físicamente una simulación de la base de datos por su ID y usuario.
 */
async function deleteSimulation(idSimulation, idUser) {
  if (!idSimulation || !idUser) {
    throw new Error("Parámetros incompletos: se requiere idSimulation y idUser.");
  }

  const deleted = await ztsimulation.findOneAndDelete({ idSimulation, idUser });

  if (!deleted) {
    throw new Error("No se encontró la simulación para eliminar.");
  }

  return {
    message: "Simulación eliminada permanentemente.",
    idSimulation: deleted.idSimulation,
    user: deleted.idUser,
  };
}


const updateSimulationName = async (idSimulation, newName) => {
  if (!idSimulation || !newName) {
    throw new Error("Faltan parámetros obligatorios");
  }

  const updated = await ztsimulation.findOneAndUpdate(
    { idSimulation },
    { simulationName: newName },
    { new: true }
  );

  if (!updated) {
    throw new Error("Simulación no encontrada");
  }

  return updated;
};


module.exports = {
  updateSimulationName,
  deleteSimulation,
  getAllSimulaciones
};
