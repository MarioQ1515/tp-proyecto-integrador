<template>
  <div v-if="loading" class="cart-loading">Cargando carrito...</div>
  <div v-else class="cart-page">
    <div class="cart-layout">
      <div>
        <div class="cart-title">
          Mi carrito <span class="cart-count">({{ items.length }} items)</span>
        </div>

        <div v-if="items.length === 0" class="cart-empty">
          <p>Tu carrito está vacío.</p>
          <RouterLink to="/productos" class="btn btn-dark" style="margin-top:16px; display:inline-flex">
            Ver productos
          </RouterLink>
        </div>
        <div v-else class="cart-items">
          <div v-for="item in items" :key="item._id" class="cart-row">
            <div class="cart-thumb">
              <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
              </svg>
            </div>
            <div class="cart-info">
              <div class="cart-name">{{ item.productoId?.nombre }}</div>
              <div class="cart-meta">${{ item.precioUnitario?.toLocaleString('es-AR') }} c/u</div>
            </div>
            <div class="cart-qty">
              <button @click="actualizarCantidad(item._id, item.cantidad - 1)">−</button>
              <span>{{ item.cantidad }}</span>
              <button @click="actualizarCantidad(item._id, item.cantidad + 1)">+</button>
            </div>
            <div class="cart-line-total">
              ${{ (item.precioUnitario * item.cantidad).toLocaleString('es-AR') }}
            </div>
            <button class="cart-del" @click="eliminarItem(item._id)">✕</button>
          </div>
        </div>
      </div>

      <div v-if="items.length > 0">
        <div class="summary-box">
          <h3>Resumen del pedido</h3>
          <div class="sum-row"><span>Subtotal</span><span>${{ total.toLocaleString('es-AR') }}</span></div>
          <div class="sum-total"><span>Total</span><span>${{ total.toLocaleString('es-AR') }}</span></div>
          <div class="field" style="margin-top:16px">
            <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:4px">
              Dirección de entrega
            </label>
            <input
              type="text"
              v-model="direccion"
              placeholder="Av. Corrientes 1234, CABA"
              style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid #ddd;font-size:0.9rem;box-sizing:border-box"
            />
          </div>
          <p v-if="errorPedido" style="color:#e53e3e;font-size:0.82rem;margin-top:6px;margin-bottom:0">
            {{ errorPedido }}
          </p>
          <button
            class="btn btn-dark btn-full"
            style="margin-top:12px"
            @click="confirmarPedido"
            :disabled="confirmando"
          >
            {{ confirmando ? 'Confirmando...' : 'Confirmar pedido' }}
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <div class="secure-note">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Pago seguro con cifrado SSL
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch, isAuthenticated } from '../services/api.js'
import './Cart.css'

const router = useRouter()
const carrito = ref(null)
const loading = ref(true)
const confirmando = ref(false)
const direccion = ref('')
const errorPedido = ref('')

const items = computed(() => carrito.value?.items || [])
const total = computed(() =>
  items.value.reduce((acc, item) => acc + (item.precioUnitario ?? 0) * item.cantidad, 0)
)

onMounted(() => {
  if (!isAuthenticated()) { router.push('/login'); return }
  fetchCarrito()
})

async function fetchCarrito() {
  try {
    const data = await apiFetch('/api/carrito', { auth: true })
    carrito.value = data
  } catch (err) {
    if (err.status === 401) { router.push('/login'); return }
    carrito.value = null
  } finally {
    loading.value = false
  }
}

async function actualizarCantidad(itemId, cantidad) {
  if (cantidad < 1) { await eliminarItem(itemId); return }
  try {
    await apiFetch(`/api/carrito/items/${itemId}`, {
      method: 'PUT',
      auth: true,
      body: JSON.stringify({ cantidad }),
    })
  } catch (err) {
    if (err.status === 401) { router.push('/login'); return }
    alert(err.message || 'Error al actualizar cantidad')
  }
  await fetchCarrito()
}

async function eliminarItem(itemId) {
  try {
    await apiFetch(`/api/carrito/items/${itemId}`, { method: 'DELETE', auth: true })
  } catch (err) {
    if (err.status === 401) { router.push('/login'); return }
    alert(err.message || 'Error al eliminar item')
  }
  await fetchCarrito()
}

async function confirmarPedido() {
  if (!direccion.value.trim()) {
    errorPedido.value = 'La dirección de entrega es obligatoria'
    return
  }
  errorPedido.value = ''
  confirmando.value = true
  try {
    await apiFetch('/api/pedidos', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ direccionEntrega: direccion.value.trim() }),
    })
    router.push('/pedidos')
  } catch (err) {
    if (err.status === 401) { router.push('/login'); return }
    errorPedido.value = err.message || 'Error al confirmar el pedido'
  } finally {
    confirmando.value = false
  }
}
</script>
