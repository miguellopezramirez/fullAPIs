const ztsimulation = require('../models/mongodb/ztsimulation');
 async function getAllSimulaciones(req) {
      try {
        // Verifica si se ha proporcionado un idUser en la consulta
        const idUser =req.req.body?.idUser;
        const idSimulation = req.req.query?.id;
        
        // Crear una variable para almacenar la simulación
        let simulation;
        
        // Caso 1: Búsqueda por ID específico
        if (idSimulation != null) {
            simulation = await ztsimulation.findOne({idSimulation}).lean();
            console.log("idSimulation", idSimulation);
        }
        // Caso 2: Obtener todos los registros (con paginación)
        else {
           simulation = await ztsimulation.find({idUser}).lean();
           console.log("otro", idUser);
        }

        return (simulation);
    } catch(e) {
        console.error("Error en GetAllPricesHistory:", e);
        return e; // Es mejor propagar el error para manejarlo en el controlador

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
