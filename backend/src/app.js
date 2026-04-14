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
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger: http://localhost:${PORT}/api/docs`);
  conectarDB();
});
