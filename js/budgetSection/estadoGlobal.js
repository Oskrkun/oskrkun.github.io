// estadoGlobal.js
export const estadoGlobal = {
    receta: {
        od_lejos: { esf: null, cil: null, eje: null },
        oi_lejos: { esf: null, cil: null, eje: null },
        od_add: null,
        oi_add: null,
        od_cerca: { esf: null, cil: null, eje: null },
        oi_cerca: { esf: null, cil: null, eje: null }
    },
    filtros: {
        tipoLente: null,
        laboratorio: null,
        tratamientos: [],
        indiceRefraccion: null
    },
    productosFiltrados: []
};