<template>
  <div v-if="loading" class="orders-loading">Cargando pedidos...</div>
  <div v-else class="orders-page">
    <div class="orders-wrap">
      <div class="orders-head">
        <h2>Mis Pedidos</h2>
        <RouterLink to="/productos" class="btn btn-dark btn-sm">+ Seguir comprando</RouterLink>
      </div>

      <div v-if="pedidos.length === 0" class="orders-empty">
        <p>Todavía no realizaste ningún pedido.</p>
        <RouterLink to="/productos" class="btn btn-dark" style="margin-top:16px;display:inline-flex">
          Ver productos
        </RouterLink>
      </div>

      <div v-for="pedido in pedidos" :key="pedido._id" class="order-card">
        <!-- Header -->
        <div class="order-top">
          <div>
            <div class="order-id">Pedido #{{ pedido._id?.toString().slice(-8).toUpperCase() }}</div>
            <div class="order-date">{{ formatFecha(pedido.fechaPedido || pedido.createdAt) }}</div>
          </div>
          <span :class="`badge ${estadoBadge(pedido.estado).clase}`">
            {{ estadoBadge(pedido.estado).texto }}
          </span>
        </div>

        <!-- Items -->
        <div class="order-items">
          <div v-for="(item, i) in pedido.items || []" :key="i" class="order-item-row">
            <div
              class="order-item-icon"
              v-html="getCategoryIcon(item.productoId?.categoriaId?.nombre, 16)"
            ></div>
            <div class="order-item-name">{{ item.productoId?.nombre || 'Producto eliminado' }}</div>
            <div class="order-item-qty">
              {{ item.cantidad }} × ${{ (item.precioUnitario ?? item.productoId?.precio ?? 0).toLocaleString('es-AR') }}
            </div>
            <div class="order-item-subtotal">
              ${{ (item.subtotal ?? (item.precioUnitario ?? 0) * item.cantidad).toLocaleString('es-AR') }}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="order-foot">
          <div class="order-address">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {{ pedido.direccionEntrega }}
          </div>
          <div class="order-total-wrap">
            <span class="order-total-label">Total</span>
            <span class="order-total">${{ pedido.total?.toLocaleString('es-AR') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryIcon } from '../utils/categoryIcon.js'
import { apiFetch, isAuthenticated } from '../services/api.js'
import './Orders.css'

const router = useRouter()
const pedidos = ref([])
const loading = ref(true)

const ESTADO_BADGE = {
  pendiente:  { clase: 'badge-yellow', texto: 'Pendiente' },
  confirmado: { clase: 'badge-blue',   texto: 'En preparación' },
  enviado:    { clase: 'badge-blue',   texto: 'En camino' },
  entregado:  { clase: 'badge-green',  texto: 'Entregado' },
  cancelado:  { clase: 'badge-gray',   texto: 'Cancelado' },
}

onMounted(async () => {
  if (!isAuthenticated()) { router.push('/login'); return }
  try {
    const data = await apiFetch('/api/pedidos', { auth: true })
    pedidos.value = data.data || []
  } catch (err) {
    if (err.status === 401) { router.push('/login'); return }
    pedidos.value = []
  } finally {
    loading.value = false
  }
})

function estadoBadge(estado) {
  return ESTADO_BADGE[estado] || { clase: 'badge-gray', texto: estado }
}

function formatFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
