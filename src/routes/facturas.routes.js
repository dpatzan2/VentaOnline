// IMPORTACIONES
const express = require('express');
const md_autenticacion =  require('../middlewares/autenticacion');
const facturasController = require('../Controllers/factura.controller');

// RUTAS
var api = express.Router();
// FACTURAS
api.get('/facturas', md_autenticacion.Auth,facturasController.mostrarListaFacturas);
api.get('/facturas/productos', md_autenticacion.Auth,facturasController.mostrarProductosFacturas);
api.get('/productos/agotados',md_autenticacion.Auth,facturasController.mostrarProductosAgotados);
api.get('/productos/mas-vendidos',facturasController.ObtenerProductosMasVendidos);


module.exports = api;