// IMPORTACIONES
const express = require('express');
const productosController = require('../controllers/productos.controller');
const md_autenticacion =  require('../middlewares/autenticacion');

// RUTAS
var api = express.Router();
// PRODUCTOS
api.get('/productos', productosController.ObtenerProductos);
api.get('/productos/categoria', productosController.obtenerProductosPorCategoria);
api.get('/productos/id/:idProductos', productosController.ObtenerProductoId);
api.get('/productos/nombre', productosController.ObtenerProductoNombre);
api.post('/productos/agregar', md_autenticacion.Auth,productosController.AgregarProducto);
api.put('/productos/editar/:idProducto',md_autenticacion.Auth, productosController.EditarProducto);
api.delete('/productos/eliminar/:idProducto', md_autenticacion.Auth,productosController.EliminarProducto);
api.put('/productos/stock/:idProducto', md_autenticacion.Auth,productosController.stockProducto);


module.exports = api;