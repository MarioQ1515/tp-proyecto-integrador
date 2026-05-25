<template>
  <div v-if="loading" class="detail-loading">Cargando...</div>
  <div v-else-if="!producto" class="detail-loading">Producto no encontrado.</div>
  <div v-else class="detail-page">
    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <RouterLink to="/">Home</RouterLink>
      <span>/</span>
      <RouterLink to="/productos">Productos</RouterLink>
      <span>/</span>
      <span class="breadcrumb-current">{{ producto.nombre }}</span>
    </div>

    <div class="detail-layout">
      <!-- Imagen -->
      <div class="detail-gallery">
        <div class="detail-gallery-inner" v-html="iconoCategoria"></div>
      </div>

      <!-- Info -->
      <div class="detail-info">
        <div class="detail-box">
          <div class="detail-brand">{{ producto.categoriaId?.nombre || 'Producto' }}</div>
          <h1 class="detail-title">{{ producto.nombre }}</h1>
          <div class="detail-price">
            ${{ producto.precio?.toLocaleString('es-AR') }}
            <span class="detail-tax"> IVA incluido</span>
          </div>
          <div class="detail-divider" />
          <div class="detail-stock">
            <span v-if="producto.stock > 0" class="badge badge-green">
              En stock · {{ producto.stock }} unidades
            </span>
            <span v-else class="badge badge-red">Sin stock</span>
          </div>
        </div>

        <div class="detail-box">
          <div class="qty-row">
            <span class="qty-label">Cantidad</span>
            <div class="qty-ctrl">
              <button @click="cantidad = Math.max(1, cantidad - 1)">−</button>
              <span>{{ cantidad }}</span>
              <button @click="cantidad = Math.min(producto.stock, cantidad + 1)">+</button>
            </div>
          </div>
          <div class="detail-divider" />
          <div class="action-col">
            <button
              class="btn btn-dark btn-full"
              @click="agregarAlCarrito"
              :disabled="producto.stock === 0"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {{ agregado ? '¡Agregado!' : 'Agregar al carrito' }}
            </button>
            <button class="btn btn-outline btn-full" @click="router.push('/carrito')">
              Ver carrito
            </button>
          </div>
        </div>

        <div v-if="producto.descripcion" class="detail-box">
          <div class="detail-specs-title">Descripción</div>
          <p class="detail-desc">{{ producto.descripcion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategoryIcon } from '../utils/categoryIcon.js'
import { apiFetch, isAuthenticated } from '../services/api.js'
import './ProductDetail.css'

const route = useRoute()
const router = useRouter()
const producto = ref(null)
const cantidad = ref(1)
const loading = ref(true)
const agregado = ref(false)

const iconoCategoria = computed(() =>
  getCategoryIcon(producto.value?.categoriaId?.nombre, 80)
)

onMounted(async () => {
  try {
    const data = await apiFetch(`/api/productos/${route.params.id}`)
    producto.value = data
  } catch {
    producto.value = null
  } finally {
    loading.value = false
  }
})

async function agregarAlCarrito() {
  if (!isAuthenticated()) { router.push('/login'); return }
  try {
    await apiFetch('/api/carrito/items', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ productoId: route.params.id, cantidad: cantidad.value }),
    })
    agregado.value = true
    setTimeout(() => { agregado.value = false }, 2000)
  } catch (err) {
    if (err.status === 401) { router.push('/login'); return }
    alert(err.message || 'No se pudo agregar al carrito')
  }
}
</script>
