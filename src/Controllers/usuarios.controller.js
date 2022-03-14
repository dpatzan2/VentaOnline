const Usuarios = require('../models/usuarios.model');
const Producto = require('../models/productos.model');
const Factura = require('../models/Factura.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const PdfkitConstruct = require('pdfkit-construct');
const fs = require('fs'); 
//METODO PARA OBTNER TODA LA LISTA DE USUARIOS (ADMINISTRADORES Y CLIENTES)

function ObtenerUsuarios(req, res) {

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes acceso a esta informacion'})
    }else{
        Usuarios.find((err , usuariosObtenidos) => {
            if(err) return res.send({mensaje: "error:" + err})
            if(!usuariosObtenidos) return res.status(500).send({mensaje: 'No hay usuarios en la base de datos'});
        
        return res.send({usuarios: usuariosObtenidos})
    })
    }
} 


//METODO PARA AGREGAR CLIENTES

function RegistrarClientes(req, res){
    var parametros = req.body;
    var usuarioModelo = new Usuarios();

        if (parametros.nombre && parametros.usuario && parametros.password) {
            usuarioModelo.nombre = parametros.nombre;
            usuarioModelo.usuario = parametros.usuario;
            usuarioModelo.rol = 'Cliente';   
            usuarioModelo.totalCarrito = 0;
            if(parametros.rol == 'Cliente') return res.status(500).send({mensaje: 'No puedes elegir el rol, siempre sera "Cliente"'});
            Usuarios.find({usuario: parametros.usuario}, (err, usuarioEcontrado) => {
                if(usuarioEcontrado == 0){
    
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModelo.password = passwordEncriptada;
    
                        usuarioModelo.save((err, usuarioGuardado) => {
                            if(err) return res.status(500).send({message: 'Error en la peticion'});
                            if(!usuarioGuardado) return res.status(404).send({message: 'No se encontraron usuarios'});
                
                            return res.status(200).send({usuario: usuarioGuardado});
                        });
                    });
                }else{
                    return res.status(500).send({mensaje: 'Este usuario ya esta siendo utilizado, pruebe usando otro'});
                } 
                
            })
        }else{
            return res.status(500).send({mensaje: 'Llene todos los campos requeridos'});
        }
    
}

//METODO PARA PODER AGREGAR ADMINISTRADORES

function RegistrarAdministradores(req, res){
    var parametros = req.body;
    var usuarioModelo = new Usuarios();


    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes permisos para realizar esta accion'});
    }else{
        if (parametros.nombre && parametros.apellido && parametros.usuario && parametros.password) {
            usuarioModelo.nombre = parametros.nombre;
            usuarioModelo.apellido = parametros.apellido;
            usuarioModelo.usuario = parametros.usuario;
            usuarioModelo.rol = 'ADMIN';   
           // if(parametros.rol != 'ROL_ALUMNO' || parametros.rol == '') return res.status(500).send({mensaje: 'No puedes elegir el rol, siempre sera "alumno"'});
            Usuarios.find({usuario: parametros.usuario}, (err, usuarioEcontrado) => {
                if(usuarioEcontrado == 0){
    
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModelo.password = passwordEncriptada;
    
                        usuarioModelo.save((err, usuarioGuardado) => {
                            if(err) return res.status(500).send({message: 'Error en la peticion'});
                            if(!usuarioGuardado) return res.status(404).send({message: 'No se encontraron usuarios'});
                
                            return res.status(200).send({usuario: usuarioGuardado});
                        });
                    });
                }else{
                    return res.status(500).send({mensaje: 'Este usuario ya esta siendo utilizado, pruebe usando otro'});
                } 
                
            })
        }
    }
}


//METODO PARA PODER INICIAR SESION
function Login(req, res) {
    var parametros = req.body;

    Usuarios.findOne({usuario: parametros.usuario}, (err, usuarioEcontrado) =>{
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(usuarioEcontrado){
            //COMPARO CONTRASEÑA SIN ENCRIPTAR CON LA ENCRIPTADA
            bcrypt.compare(parametros.password, usuarioEcontrado.password, (err, verificacionPassword)=>{
                //VERIFICAR SI EL PASSWORD COINCIDE EN LA BASE DE DATOS
                if(verificacionPassword){

                    //SI EL PARAMETRO OBTENERTOKEN ES TRUE, CREA EL TOKEN
                    if(parametros.obtenerToken === 'true'){
                        Factura.find({idUsuario: usuarioEcontrado._id}, (err, facturaEncontrada)=>{
                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                            if(facturaEncontrada == '') return res.status(500).send({token: jwt.crearToken(usuarioEcontrado), mensaje: 'Este usuario no ha realizado ninguna compra'})
                    
                            return res.status(200).send({token: jwt.crearToken(usuarioEcontrado), 'tus compras: ': facturaEncontrada}
                                );
                        })
                        //return res.status(500).send({token: jwt.crearToken(usuarioEcontrado)});
                    }else{
                        usuarioEcontrado.password = undefined;
                        return res.status(200).send({usuario: usuarioEcontrado});
                    }
                }else{
                    return res.status(500).send({message: 'la contraseña no coincide'});
                }
            }); 

        }else{
            return res.status(500).send({mensaje: 'El correo no se encuentra registrado'});
        }
    });
}


//METODO PARA PODER MODIFICAR USUARIOS (ADMNISTRADORES Y CLIENTES)

function EditarUsuarios(req, res) {
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

   if(req.user.rol == 'Cliente'){
    if(parametros.rol){
        return res.status(500).send({message: 'No puedes modificar tu rol'})
    }else{
    Usuarios.findByIdAndUpdate({_id: req.user.sub}, parametros, {new: true}, (err, usuarioActualizado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioActualizado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuario: usuarioActualizado});
    });
}

   }else{
       Usuarios.findById(idUsu, (err, usuarioEcontrado)=>{
           if (err) return res.status(500).send({message: 'Ocurrio un error en la peticion de usuario'});
           if(!usuarioEcontrado) return res.status(500).send({message: 'Este usuaio no existe'});

           if(usuarioEcontrado.rol == 'Cliente'){
            Usuarios.findByIdAndUpdate({_id: idUsu}, parametros, {new: true}, (err, usuarioActualizado) => {
                if(err) return res.status(500).send({message: 'Error en la peticion'});
                if(!usuarioActualizado) return res.status(404).send({message: 'No puedes modificar a otro admnistrador'});
        
                return res.status(200).send({usuarios: usuarioActualizado});
            });
           }else{
               if(parametros.rol){
                   if(parametros.nombre || parametros.usuario){
                       return res.status(500).send({mensaje: 'no puedes mmodificar mas, solo su rol'})
                   }else{
                    Usuarios.findByIdAndUpdate({_id: idUsu}, {rol: parametros.rol}, {new: true}, (err, usuarioActualizado) => {
                        if(err) return res.status(500).send({message: 'Error en la peticion'});
                        if(!usuarioActualizado) return res.status(404).send({message: 'No puedes modificar a otro admnistrador'});
                
                        return res.status(200).send({usuarios: usuarioActualizado});
                    });
                   }
               }else{
                if(idUsu == req.user.sub){
                    if(!parametros.rol){
                     Usuarios.findByIdAndUpdate({_id: idUsu}, parametros, {new: true}, (err, usuarioActualizado) => {
                         if(err) return res.status(500).send({message: 'Error en la peticion'});
                         if(!usuarioActualizado) return res.status(404).send({message: 'No puedes modificar a otro admnistrador'});
                 
                         return res.status(200).send({usuarios: usuarioActualizado});
                     });
                    }else{
                        return res.status(500).send({mensaje: 'No puedes modificar tu rol'})
                    }
                }else{
                    return res.status(500).send({mensaje: 'No puedes modificar a otro admnistrador'});
                }
               }
               
           }
       })
        
       }
  
}


//METODO PARA ELIMINAR USUARIOS (ADMINISTRADORES Y CLIENTES)
function EliminarUsuarios(req, res) {
    var idUsu = req.params.idUsuario;

    if(req.user.rol == 'Cliente'){
        Usuarios.findByIdAndDelete({_id: req.user.sub}, {new: true}, (err, usuarioEliminado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEliminado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuario: usuarioEliminado});
    })
    }else if(req.user.rol == 'ADMIN'){
        Usuarios.findById(idUsu, (err, usuarioEncontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEncontrado) return res.status(404).send({message: 'No se encontraron usuarios'});

            if(idUsu == req.user.sub){
                Usuarios.findByIdAndDelete(idUsu, {new: true}, (err, usuarioEliminado) => {
                    if(err) return res.status(500).send({message: 'Error en la peticion'});
                    if(!usuarioEliminado) return res.status(404).send({message: 'No se encontraron usuarios'});
            
                    return res.status(200).send({usuarios: usuarioEliminado});
                })
            }else{
                if(usuarioEncontrado.rol == 'ADMIN'){
                    return res.status(500).send({mensaje: 'No puedes eliminar a otro administrador'});
                }else{
                    Usuarios.findByIdAndDelete(idUsu, {new: true}, (err, usuarioEliminado) => {
                        if(err) return res.status(500).send({message: 'Error en la peticion'});
                        if(!usuarioEliminado) return res.status(404).send({message: 'No se encontraron usuarios'});
                
                        return res.status(200).send({usuarios: usuarioEliminado});
                    })
                }
            }

            
        })
    }else{
        return res.status(500).send({mensaje: 'error'})
    }

    
}

//METODO PARA FILTRAR POR NOMBRE

function BuscarUsuarios(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({usuario: {$regex: busqueda, $options: 'i'}}, (err, usuarioEcontrado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEcontrado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuarios: usuarioEcontrado});
    })

    
}

//METODO PARA BUSCAR POR APELLIDO

function BuscarUsuariosA(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({apellido: {$regex: busqueda, $options: 'i'}}, (err, usuarioEcontrado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEcontrado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuarios: usuarioEcontrado});
    })

    
}


//METODO PARA BUSCAR POR ROL
function BuscarUsuariosR(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({rol: {$regex: busqueda, $options: 'i'}}, (err, usuarioEcontrado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEcontrado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuarios: usuarioEcontrado});
    })

    
}

//METODO PARA BUSCAR POR NOMBRE
function BuscarUsuariosId(req, res){
    var idUsu = req.params.idUsuario;

    Usuarios.findById(idUsu, (err, usuarioEcontrado) => {

        if(err) return res.status(500).send({mensaje: 'error en la peticion'});
        if(!usuarioEcontrado) return res.status(404).send({mensaje: 'Error al obtener los datos'});

        return res.status(200).send({usuarios: usuarioEcontrado});
    })
}

function agregarProductoCarrito(req, res) {
    const usuarioLogeado = req.user.sub;
    const parametros = req.body;

    if(req.user.rol == 'ADMIN'){
        return res.status(500).send({mensaje: 'Eres un administrador, no puedes tener carrito'});
    }else{
        Producto.findOne({ nombre: parametros.nombreProducto }, (err, productoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
            if(!productoEncontrado) return res.status(404).send({ mensaje: 'Este producto no existe o verifique que escribio bien el nombre del producto'});
    
            if(parametros.cantidad >= productoEncontrado.cantidad){
                return res.status(500).send({mensaje: 'No contamos con suficiente stock'})
            }else{
                Usuarios.findOne({_id: req.user.sub, carrito:{$elemMatch: {nombreProducto: parametros.nombreProducto}}}, (err, carritoEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: 'Ocurrio un error en la petición'});
                    
        
                    let cantidadLocal = 0;
                    let subTotalLocal = 0;
                    let compararStock = 0;
                    if(carritoEncontrado){
                        for (let i = 0; i <carritoEncontrado.carrito.length; i++) {
                            if(carritoEncontrado.carrito[i].nombreProducto == parametros.nombreProducto){
                                cantidadLocal = carritoEncontrado.carrito[i].cantidadComprada;
                                subTotalLocal = Number(cantidadLocal) + Number(parametros.cantidad);
                                if(subTotalLocal > productoEncontrado.cantidad){
                                    return res.status(500).send({mensaje: 'No contamos con stock suficiente'})
                                }else{
                                    Usuarios.findOneAndUpdate({ carrito: { $elemMatch : { _id: carritoEncontrado.carrito[i]._id} } },
                                        {$inc: { "carrito.$.cantidadComprada":parametros.cantidad}, "carrito.$.subTotal": subTotalLocal  *  productoEncontrado.precio}, 
                                         {new : true}, (err, cantidadAgregada)=>{
                                            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                            if(!cantidadAgregada) return res.status(500)
                                                .send({ mensaje: "Ocurrio un error al querer guardar la cantidad"});
                                
                                                let totalCantidad =0
                                                let totalCarritoLocal = 0;
                                
                                                for(let i = 0; i < cantidadAgregada.carrito.length; i++){
                                                    // totalCarritoLocal = totalCarritoLocal + usuarioActualizado.carrito[i].precioUnitario;
                                                    totalCarritoLocal += cantidadAgregada.carrito[i].subTotal 
                                                     
                                                }
                                
                                                Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},
                                                    (err, totalActualizado)=> {
                                                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                                                        if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
                                
                                                        return res.status(200).send({ sdf: totalActualizado })
                                                    })
                                    })
                                }
                            }else{
        
                            }
                        }
                    }else{
                        Usuarios.findByIdAndUpdate(usuarioLogeado, { $push: { carrito: { nombreProducto: parametros.nombreProducto,
                            cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio, subTotal: parametros.cantidad *  productoEncontrado.precio} } }, { new: true}, 
                            (err, usuarioActualizado)=>{
                                if(err) return res.status(500).send({ mensaje: "Error en la peticion de Usuario"});
                                if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al agregar el producto al carrito'});
                
                                let totalCantidad =0
                                let totalCarritoLocal = 0;
                
                                for(let i = 0; i < usuarioActualizado.carrito.length; i++){
                                    // totalCarritoLocal = totalCarritoLocal + usuarioActualizado.carrito[i].precioUnitario;
                                    totalCarritoLocal += usuarioActualizado.carrito[i].subTotal 
                                     
                                }
                
                                Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},
                                    (err, totalActualizado)=> {
                                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                                        if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
                
                                        return res.status(200).send({ usuario: totalActualizado })
                                    })
                            })
                    }
                    
                })
        
            }
        })
    }
    
}

function carritoAfactura(req, res){
    var parametros = req.body;
    var logueado = req.user.nombre;

     const facturaModel = new Factura();

     if(req.user.rol == 'ADMIN'){
         return res.status(500).send({mensaje: 'Eres un administrador, no puedes tener carrito y tampoco facturas'})
     }else{
        Usuarios.findById(req.user.sub, (err, usuarioEncontrado)=>{

            if(usuarioEncontrado.carrito == ''){
                return res.status(500).send({mensaje: 'El carrito esta vacio, no se puede generar una factura'})
            }else{
                facturaModel.listaProductos = usuarioEncontrado.carrito;
                facturaModel.idUsuario = req.user.sub;
                facturaModel.totalFactura = usuarioEncontrado.totalCarrito;
                if(parametros.nit){
                    facturaModel.nit = parametros.nit
                }else{
                    facturaModel.nit = 'Consumidor final'
                }
                
    
                facturaModel.save((err, facturaGuaardada) => {
                    if (err) return res.status(500).send({mensaje : "Error en la peticion"});
                    if(!facturaGuaardada) return res.status(500).send({mensaje : "Ocurrio un error al intentar guardar la factura"})
                    obtenerPDF(facturaGuaardada, logueado);
                    
                
                    for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {
                        Producto.findOneAndUpdate({nombre: usuarioEncontrado.carrito[i].nombreProducto} , 
                            {  $inc : { cantidad: usuarioEncontrado.carrito[i].cantidadComprada * -1, 
                            vendido: usuarioEncontrado.carrito[i].cantidadComprada }}, (err, datosProducto) =>{
                        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!datosProducto) return res.status(500).send({mensaje: 'Ocurrio un error al modificar el stock'})
    
                    })
                    }
                    Usuarios.findByIdAndUpdate(req.user.sub, { $set: { carrito: [] }, totalCarrito: 0 }, { new: true }, 
                        (err, carritoVacio)=>{
                            return res.status(200).send({ factura: facturaGuaardada })
                        })
                })
                
            }
        }) 
     }
}

function eliminarProductoCarrito(req, res) {
    var parametros = req.body;
    
    let totalCarritoLocal = 0;

    if(req.user.rol == 'ADMIN'){
        return res.status(500).send({mensaje: 'Eres un administrador, no puedes realizar esta accio'})
    }else{
        Producto.findOne({nombre: parametros.nombreProducto}, (err, productoEncontrado) => {
            if (err) return res.status(500).send({mensaje: 'Error en la peticion'})
            if(!productoEncontrado) return res.status(500).send({mensaje: 'Este producto no existe, verifica el nombre'});
    
            Usuarios.updateOne({_id: req.user.sub},{ $pull: { carrito: {nombreProducto:parametros.nombreProducto} } }, (err, carritoEliminado)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!carritoEliminado) return res.status(500).send({mensaje: 'Este producto no esta en tu carrito, verfica bien el nombre'});
                Usuarios.findOne({_id: req.user.sub}, (err, usuarioEncontrado) =>{
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                    if(!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
        
                    for (let i = 0; i < usuarioEncontrado.carrito.length; i++){
                        totalCarritoLocal += usuarioEncontrado.carrito[i].subTotal  
                    }
        
                    Usuarios.findByIdAndUpdate({_id: req.user.sub},  { totalCarrito: totalCarritoLocal }, {new: true},
                        (err, totalActualizado)=> {
                            if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                            if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
            
                            return res.status(200).send({ usuario: totalActualizado })
                        });
                });
                
            });
        });
    }
}

function obtenerPDF(facturaGuaardada, logueado)  {
    var hoy = new Date();
    var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();	
    var hora = hoy.getHours() + '_' + hoy.getMinutes() + '_' + hoy.getSeconds();
    const doc = new PdfkitConstruct({
        bufferPages: true,
    });

    doc.setDocumentHeader({}, () => {


        doc.lineJoin('miter')
            .rect(0, 0, doc.page.width, doc.header.options.heightNumber).fill("#ededed");

        doc.fill("#115dc8")
            .fontSize(20)
            .text("Factura de: \n" + logueado + '\n', doc.header.x+40, doc.header.y);
    });
    
        doc.text('Factura no: '+ facturaGuaardada._id, doc.header.x+80, doc.header.y+80)
        doc.text('******************************************************************');
        doc.text('Datos del cliente:'+'\n nit: '+ facturaGuaardada.nit)
        doc.text('******************************************************************');
        doc.text('Detalles de la compra: '+'\n productos: '+facturaGuaardada.listaProductos);
        doc.text('******************************************************************');
        doc.text('Total: ' + facturaGuaardada.totalFactura)
        doc.setDocumentFooter({}, () => {

            doc.lineJoin('miter')
                .rect(0, doc.footer.y, doc.page.width, doc.footer.options.heightNumber).fill("#ededed");

            doc.fill("#000000")
                .fontSize(8)
                .text("Fecha: " + fecha + ' ' + hora, doc.footer.x, doc.footer.y-45);
        });


    doc.render();
    doc.pipe(fs.createWriteStream('pdfs/'+ logueado+ '-factura-' + fecha+ '-'+ hora + '.pdf'));
    doc.end();
}

module.exports = {
    ObtenerUsuarios,
    RegistrarClientes,
    RegistrarAdministradores,
    EditarUsuarios,
    EliminarUsuarios,
    BuscarUsuarios,
    BuscarUsuariosA,
    BuscarUsuariosR,
    BuscarUsuariosId,
    Login,
    agregarProductoCarrito,
    carritoAfactura,
    eliminarProductoCarrito
}