<template>
  <nav class="navbar">
    <RouterLink to="/" class="nav-brand">
      <div class="nav-logo-box">TC</div>
      TechStore
    </RouterLink>

    <div class="nav-links">
      <RouterLink
        to="/productos"
        class="nav-link"
        :class="{ 'nav-link--active': route.path.startsWith('/productos') }"
      >
        Productos
      </RouterLink>

      <template v-if="token">
        <RouterLink to="/pedidos" class="nav-link">Mis pedidos</RouterLink>
        <span class="nav-user">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {{ usuario?.nombre }}
        </span>
        <button class="btn btn-outline btn-sm" @click="handleLogout">Salir</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="nav-link">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Iniciar Sesión
        </RouterLink>
      </template>

      <button class="nav-cart-btn" @click="router.push('/carrito')">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import './Navbar.css'

const router = useRouter()
const route = useRoute()

const token = ref(localStorage.getItem('token'))
const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))

watch(() => route.path, () => {
  token.value = localStorage.getItem('token')
  usuario.value = JSON.parse(localStorage.getItem('usuario') || 'null')
})

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  router.push('/login')
}
</script>
