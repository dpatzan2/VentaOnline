// IMPORTACIONES
const express = require('express');
const categoriasController = require('../controllers/categorias.controller');
const md_autenticacion =  require('../middlewares/autenticacion');

// RUTAS
var api = express.Router();
// PRODUCTOS
api.get('/categorias', categoriasController.ObtenerCategorias);
api.get('/categorias/id/:idCategoria', categoriasController.ObtenerCategoriaId);
api.get('/categorias/nombre/:nombreCategoria', categoriasController.ObtenerCategoriaNombre);
api.post('/categorias/agregar', md_autenticacion.Auth,categoriasController.AgregarCateogira);
api.put('/categorias/editar/:idCategoria',md_autenticacion.Auth, categoriasController.EditarCategoria);
api.delete('/categorias/eliminar/:idCategoria', md_autenticacion.Auth,categoriasController.EliminarCategoria);


module.exports = api;