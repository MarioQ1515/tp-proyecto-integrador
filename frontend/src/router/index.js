import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Products from '../pages/Products.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import Cart from '../pages/Cart.vue'
import Orders from '../pages/Orders.vue'

const routes = [
  { path: '/login',    component: Login,    meta: { hideNavbar: true } },
  { path: '/registro', component: Register, meta: { hideNavbar: true } },
  { path: '/',         component: Home },
  { path: '/productos',     component: Products },
  { path: '/productos/:id', component: ProductDetail },
  { path: '/carrito',  component: Cart,   meta: { requiresAuth: true } },
  { path: '/pedidos',  component: Orders, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next('/login')
  } else {
    next()
  }
})

export default router
