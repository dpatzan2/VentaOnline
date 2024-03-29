// IMPORTACIONES
const Productos = require('../models/productos.model');
const Categorias = require('../models/categorias.model');

// Obtener datos Productos de Mongo
function ObtenerProductos (req, res) {
    Productos.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err });

        Productos.find((err, productosObtenidosAll) => {
            if (err) return res.send({ mensaje: "Error: " + err });
    
            return res.send({ 'Mas vendidos': productosObtenidos,
        'Lista de productos': productosObtenidosAll})
        })
    }).sort({
        vendido : -1,
    }).limit(5)
}

// OBTENER PRODUCTO POR ID
function ObtenerProductoId(req, res) {
    var idProd = req.params.idProductos;

    Productos.findById(idProd, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEncontrado) return res.status(404).send( { mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ producto: productoEncontrado });
    })
}

// OBTENER PRODUCTO POR NOMBRE
function ObtenerProductoNombre(req, res) {
    var parametros = req.body;
    if(parametros.nombre){
        Productos.find( { nombre : { $regex: parametros.nombre, $options: 'i' } }, (err, productoEncontrado) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!productoEncontrado) return res.status(404).send({ mensaje: "Error, no se encontraron productos" });
    
            return res.status(200).send({ producto: productoEncontrado });
        })
    }else{
        return res.status(500).send({mensaje: 'Coloque el nombre del producto'})
    }
    
}

function obtenerProductosPorCategoria(req, res) {
    var parametros = req.body;

    Categorias.findOne({nombreCategoria: parametros.nombre}, (err, categoriaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!categoriaEncontrada) return res.status(500).send({ mensaje: 'Esta categoria no existe, verifica el nombre'});

        Productos.find({idCategoria: categoriaEncontrada._id}, (err, productoEcontrado) => {
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if(!productoEcontrado) return res.status(500).send({ mensaje: 'Este producto no existe'});

            return res.status(200).send({ producto: productoEcontrado});
        })
    })
}

// AGREGAR PRODUCTOS
function AgregarProducto (req, res){
    var parametros = req.body;
    var productoModelo = new Productos();

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{
        if( parametros.nombre && parametros.cantidad && parametros.precio ) {
            
            Productos.find({nombre : parametros.nombre}, (err, productoEncontrado)=>{
                for(let i = 0; i < productoEncontrado.length; i++){
                    if(productoEncontrado[i].nombre === parametros.nombre) return res.status(400).send({ mensaje: "Este producto ya existe, puede actualizar el stock" });
                    
                }
                Categorias.findOne({_id: parametros.idCategoria}, (err, categoriaEncontrada)=>{
                    if(err) return res.status(500).send({ mensaje: 'esta categoria no existe'});
                    if(!categoriaEncontrada) return res.status(500).send({ mensaje: 'esta categoria no existe'})

                    productoModelo.nombre = parametros.nombre;
                    productoModelo.cantidad = parametros.cantidad;
                    productoModelo.precio = parametros.precio;
                    productoModelo.vendido = 0;
                    productoModelo.idCategoria = parametros.idCategoria;
    
                    productoModelo.save((err, productoGuardado) => {
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                        if(!productoGuardado) return res.status(404).send( { mensaje: "Error, no se agrego ningun producto"});
    
                        return res.status(200).send({ producto: productoGuardado });
                    })
                })
                
            })
            
        }
    }
}

// EDITAR PRODUCTO
function EditarProducto (req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{
        Productos.findByIdAndUpdate(idProd, parametros, { new: true } ,(err, productoActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion2'});
            if(!productoActualizado) return res.status(404).send( { mensaje: 'Error al Editar el Producto'});
        
            return res.status(200).send({ producto: productoActualizado});
        });
        
    }
}

// ELIMINAR PRODUCTO
function EliminarProducto(req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{
        Productos.findByIdAndDelete(idProd, (err, productoEliminado) => {
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!productoEliminado) return res.status(404).send( { mensaje: 'Error al eliminar el Producto'});
    
            return res.status(200).send({ producto: productoEliminado});
        });
    }
}

// INCREMENTAR/RESTAR LA CANTIDAD DEL PRODUCTO

function stockProducto(req, res) {
    const productoId = req.params.idProducto;
    const parametros = req.body;


    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{
        let comparar = 0;
        Productos.findById(productoId, (err, productoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!productoEncontrado) return res.status(500).send({ mensaje: 'Error al editar la cantidad del Producto'});

            if(parametros.cantidad < 0){
                comparar = Number(parametros.cantidad) + Number(productoEncontrado.cantidad)
                if(comparar < 0) return res.status(500).send({mensaje : 'No se puede quitar esta cantidad'})

                Productos.findByIdAndUpdate(productoId, { $inc : { cantidad: parametros.cantidad } }, { new: true },
                    (err, productoModificado) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if(!productoModificado) return res.status(500).send({ mensaje: 'Error al editar la cantidad del Producto'});
            
                    return res.status(200).send({ producto: productoModificado});
                });
            }else{
                Productos.findByIdAndUpdate(productoId, { $inc : { cantidad: parametros.cantidad } }, { new: true },
                    (err, productoModificado) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if(!productoModificado) return res.status(500).send({ mensaje: 'Error al editar la cantidad del Producto'});
            
                    return res.status(200).send({ producto: productoModificado});
                });
            }
        })
        
    }
}


module.exports = {
    ObtenerProductos,
    ObtenerProductoId,
    ObtenerProductoNombre,
    AgregarProducto,
    EditarProducto,
    EliminarProducto,
    stockProducto,
    obtenerProductosPorCategoria
}