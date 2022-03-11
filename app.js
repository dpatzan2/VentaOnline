//importaciones
const express =require('express');
const cors = require('cors');
var app = express();

//importaciones rutas
const UsuariosRutas = require('./src/routes/usuarios.routes');
const ProductosRutas = require('./src/routes/productos.routes');
const CategoriasRutas = require('./src/routes/categorias.routes');
const FacturasRutas = require('./src/routes/facturas.routes');


//middleware

app.use(express.urlencoded({extended: false}));
app.use(express.json());

//cabecera
app.use(cors());

//carga de rutas

app.use('/api', UsuariosRutas, ProductosRutas, CategoriasRutas, FacturasRutas);



module.exports = app;

