const express = require('express');
const usuariosController = require('../Controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();

//rutas para Usuarios
api.get('/usuarios', usuariosController.ObtenerUsuarios);
api.post('/usuarios/agregarAdministradores',md_autenticacion.Auth, usuariosController.RegistrarAdministradores);
api.post('/register', usuariosController.RegistrarClientes);
api.put('/usuarios/editar/:idUsuario?', md_autenticacion.Auth, usuariosController.EditarUsuarios);
api.delete('/usuarios/eliminar/:idUsuario?', md_autenticacion.Auth, usuariosController.EliminarUsuarios);
api.get('/usuarios/buscarNombre/:dBusqueda', usuariosController.BuscarUsuarios);
api.get('/usuarios/buscarApellido/:dBusqueda', usuariosController.BuscarUsuariosA);
api.get('/usuarios/buscarRol/:dBusqueda', usuariosController.BuscarUsuariosR);
api.get('/usuarios/buscarId/:idUsuario', usuariosController.BuscarUsuariosId);
api.post('/login', usuariosController.Login);
api.put('/usuarios/carrito/agregar', md_autenticacion.Auth, usuariosController.agregarProductoCarrito);
api.post('/carrito/confirmar', md_autenticacion.Auth, usuariosController.carritoAfactura);
api.put('/carrito/eliminar', md_autenticacion.Auth, usuariosController.eliminarProductoCarrito)

module.exports = api;