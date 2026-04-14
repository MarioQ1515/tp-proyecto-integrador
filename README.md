# Tienda Informática — API REST

Backend de una tienda de productos informáticos desarrollado con **Node.js**, **Express** y **MongoDB**. Incluye autenticación con JWT, control de roles, gestión de catálogo, carrito de compras y pedidos.

---

## Tecnologías

- Node.js + Express 5
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Swagger UI

---

## Funcionalidades

- Registro e inicio de sesión con JWT
- Roles: `usuario` y `admin`
- CRUD de categorías y productos (con soft-delete)
- Carrito de compras por usuario
- Creación de pedidos con descuento de stock atómico y rollback
- Paginación y filtros en listados
- Documentación interactiva con Swagger

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MarioQ1515/tp-proyecto-integrador.git
cd tp-proyecto-integrador

# Instalar dependencias
npm install

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de MongoDB y JWT_SECRET

# Iniciar en modo desarrollo
npm run dev
```

---

## Variables de entorno

Crear el archivo `backend/.env` basado en `backend/.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/<db>
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
```

---

## Documentación de la API

Con el servidor corriendo, la documentación Swagger está disponible en:

[http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Endpoints

### Auth — `/api/auth`
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/registro` | Registrar nuevo usuario | — |
| POST | `/login` | Iniciar sesión, devuelve JWT | — |
| GET | `/perfil` | Obtener perfil del usuario autenticado | Usuario |
| GET | `/usuarios` | Listar usuarios con filtros y paginación | Admin |

### Categorías — `/api/categorias`
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Listar categorías activas | — |
| POST | `/` | Crear categoría | Admin |
| PUT | `/:id` | Actualizar categoría | Admin |
| DELETE | `/:id` | Eliminar categoría (soft-delete) | Admin |

### Productos — `/api/productos`
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Listar productos con filtros y paginación | — |
| GET | `/:id` | Obtener producto por ID | — |
| POST | `/` | Crear producto | Admin |
| PUT | `/:id` | Actualizar producto | Admin |
| DELETE | `/:id` | Eliminar producto (soft-delete) | Admin |

### Carrito — `/api/carrito`
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Obtener carrito activo | Usuario |
| POST | `/items` | Agregar item al carrito | Usuario |
| PUT | `/items/:itemId` | Actualizar cantidad de un item | Usuario |
| DELETE | `/items/:itemId` | Eliminar item del carrito | Usuario |
| DELETE | `/` | Vaciar carrito | Usuario |

### Pedidos — `/api/pedidos`
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/` | Crear pedido desde el carrito | Usuario |
| GET | `/` | Listar pedidos del usuario | Usuario |
| GET | `/:id` | Obtener pedido por ID | Usuario |
| GET | `/admin/todos` | Listar todos los pedidos | Admin |
| PATCH | `/:id/estado` | Actualizar estado del pedido | Admin |

---

## Estructura del proyecto

```
backend/
└── src/
    ├── app.js
    ├── config/
    │   ├── db.js
    │   └── swagger.js
    ├── controllers/
    │   ├── authController.js
    │   ├── carritoController.js
    │   ├── categoriaController.js
    │   ├── pedidoController.js
    │   └── productoController.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── Carrito.js
    │   ├── Categoria.js
    │   ├── Pedido.js
    │   ├── Producto.js
    │   └── Usuario.js
    └── routes/
        ├── authRoutes.js
        ├── carritoRoutes.js
        ├── categoriaRoutes.js
        ├── pedidoRoutes.js
        └── productoRoutes.js
```
