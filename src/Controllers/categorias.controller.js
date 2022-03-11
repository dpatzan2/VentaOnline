// IMPORTACIONES
const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');

// Obtener datos CATEGORIA de Mongo
function ObtenerCategorias (req, res) {
    Categorias.find((err, categoriasObtenidas) => {
        if (err) return res.send({ mensaje: "Error: " + err });

        return res.send({ categorias: categoriasObtenidas })
    });
}

// OBTENER CATEGORIAS POR ID
function ObtenerCategoriaId(req, res) {
    var idCat = req.params.idCategoria;

    Cateogiras.findById(idCat, (err, categoiraEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!categoiraEncontrada) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ categoria: categoiraEncontrada });
    })
}

// OBTENER CATEGORIAS POR NOMBRE
function ObtenerCategoriaNombre(req, res) {
    var nomCat = req.params.nombreCategoria;

    Productos.find( { nombre : { $regex: nomCat, $options: 'i' } }, (err, categoiraEncontrada) => {
        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if(!categoiraEncontrada) return res.status(404).send({ mensaje: "Error, no se encontraron categorias" });

        return res.status(200).send({ producto: categoiraEncontrada });
    })
}

// AGREGAR CATEGORIAS
function AgregarCateogira (req, res){
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{
        
        
        if( parametros.nombre) {
            
            Categorias.find({nombreCategoria: parametros.nombre}).exec((err, categoriasEncontradas)=>{
                for(let i = 0; i < categoriasEncontradas.length; i++){
                    if(categoriasEncontradas[i].nombreCategoria === parametros.nombre) return res.status(400).send({ mensaje: "Esta categoria ya existe" });
                    
                }
                    var categoriaModelo = new Categorias();
                    categoriaModelo.nombreCategoria = parametros.nombre;


                    categoriaModelo.save((err, categoriaGuardada) => {
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                        if(!categoriaGuardada) return res.status(500).send({ mensaje: "Error al guardar la categoria"});
                                                
                        return res.status(200).send({ categoria: categoriaGuardada});
                    })
            });
        }
    }
}

// EDITAR CATEGORIA
function EditarCategoria (req, res) {
    var idCat = req.params.idCategoria;
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{
        Categorias.findByIdAndUpdate(idCat, parametros, { new: true } ,(err, categoriaActualizada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!categoriaActualizada) return res.status(404).send( { mensaje: 'Error al Editar la categoria'});
    
            return res.status(200).send({ categoria: categoriaActualizada});
        });
    }
}

// ELIMINAR CATEGORIA
function EliminarCategoria(req, res) {
    var idCat = req.params.idCategoria;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{
        Categorias.findOne({_id: idCat}, (err, categoriaProducto)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!categoriaProducto) return res.status(500).send({ mensaje: "no se encontraron productos"})
    
            Categorias.findOne({nombreCategoria: 'Por Defecto'}, (err, categoriaEncontrada)=>{
                if(err) return res.status(500).send({ mensaje: "Error en la peticion de cateogira por defecto" });
                if(!categoriaEncontrada){
                    const modeloCategoria = new Categorias();
                    modeloCategoria.nombreCategoria = 'Por Defecto';
    
                    modeloCategoria.save((err, categoriaGuardada)=>{
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
                        if(!categoriaGuardada) return res.status(500).send({ mensaje: 'no se ha podido agregar la categoria'})
    
                        Productos.updateMany({idCategoria: idCat}, {idCategoria: categoriaGuardada._id}, (err, categoriaActualizada)=>{
                            if(err) return res.status(500).send({ mensaje: "Error en la peticion de actualizar productos" })
                            Categorias.findByIdAndDelete(idCat,{new: true}, (categoriaEliminada)=>{
                                if(err) return res.status(500).send({ mensaje: "Error en la peticion de eliminar la cateogira" })
                                if(categoriaEliminada) return res.status(500).send({ mensaje: "error al eliminar categoria"})
    
                                return res.status(200).send({
                                    editado: categoriaActualizada,
                                    eliminado: categoriaEliminada
                                })
                            })
                        })
                    });
                }else{
                    Productos.updateMany({idCategoria: idCat}, {idCategoria: categoriaEncontrada._id},(err, productosActualizados)=>{
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion al actualizar los productos"})
                        Categorias.findByIdAndDelete(idCat, (err, categoriaEliminada)=>{
                            if(err) return res.status(500).send({ mensaje: 'error en la peticion al eliminar la categoria'})
                            return res.status(200).send({
                                editado: productosActualizados,
                                eliminado: categoriaEliminada
                            })
                        })
                    })
                }
            })
        })
    }
}


module.exports = {
    ObtenerCategorias,
    ObtenerCategoriaId,
    ObtenerCategoriaNombre,
    AgregarCateogira,
    EditarCategoria,
    EliminarCategoria
}