const Factura = require('../models/Factura.model');
const Usuarios = require('../models/usuarios.model');
const Producto = require('../models/productos.model');



function mostrarListaFacturas(req, res) {
    var parametros = req.body;
    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes acceso a esta informacion'});
    }else{
        if(parametros.idUsuario){
            Factura.find({idUsuario : parametros.idUsuario}, (err, facturaEncontrada)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!facturaEncontrada) return res.status(500).send({mensaje: 'Este usuario no cuenta con facturas'});

                return res.status(200).send({facturas: facturaEncontrada});
            });
        }else{
            Factura.find((err, facturasEncontradas)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!facturasEncontradas) return res.status(500).send({mensaje: 'Este usuario no cuenta con facturas'});

                return res.status(200).send({'Facturas de todos los usuarios': facturasEncontradas});
            });
        }
    }
}

function mostrarProductosFacturas(req, res) {
    var parametros = req.body;
    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes acceso a esta informacion'});
    }else{
        if(parametros.id){
            Factura.findOne({_id : parametros.id}, (err, facturaEncontrada)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!facturaEncontrada) return res.status(500).send({mensaje: 'Este usuario no cuenta con facturas'});

                return res.status(200).send({facturas: facturaEncontrada.listaProductos});
            });
        }else{
            return res.status(500).send({mensaje: 'Debe colocar el id de la factura para ver los prodcutos de una factura'})
        }
    }
}

function mostrarProductosAgotados(req, res) {
    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes acceso a esta informacion'})
    }else{
        Producto.find({cantidad: '0'},(err, productoAgotados) => {
            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
            if(productoAgotados == '') return res.status(500).send({mensaje: 'No hay productos agotados'});
    
            return res.status(200).send({'Productos agotados': productoAgotados})
        })
    }
}

function ObtenerProductosMasVendidos (req, res) {
    Producto.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err });

    
        return res.send({ 'Mas vendidos': productosObtenidos})
        
    }).sort({
        vendido : -1,
    }).limit(5)
}


module.exports = {
    mostrarListaFacturas,
    mostrarProductosFacturas,
    mostrarProductosAgotados,
    ObtenerProductosMasVendidos
}