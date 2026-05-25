require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const swaggerSpec = require('./config/swagger');

const authRoutes      = require('./routes/authRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes  = require('./routes/productoRoutes');
const carritoRoutes   = require('./routes/carritoRoutes');
const pedidoRoutes    = require('./routes/pedidoRoutes');

const app = express();

// Middlewares globales
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

// Documentación Swagger
app.get('/api/docs/swagger.json', (req, res) => res.json(swaggerSpec));
app.get('/api/docs', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tienda Informática - API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/swagger.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      deepLinking: true
    });
  </script>
</body>
</html>`);
});

// Rutas
app.use('/api/auth',       authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos',  productoRoutes);
app.use('/api/carrito',    carritoRoutes);
app.use('/api/pedidos',    pedidoRoutes);

const PORT = process.env.PORT || 3000;

const start = async () => {
  await conectarDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación Swagger: http://localhost:${PORT}/api/docs`);
  });
};

start();
