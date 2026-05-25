<template>
  <div class="products-page">
    <!-- Sidebar -->
    <aside class="categories-sidebar">
      <div class="categories-label">Categorías</div>
      <button
        class="category-nav-item"
        :class="{ active: categoriaActiva === '' }"
        @click="handleCategoria('', '')"
      >
        Todos
      </button>
      <button
        v-for="cat in categorias"
        :key="cat._id"
        class="category-nav-item"
        :class="{ active: categoriaActiva === cat._id }"
        @click="handleCategoria(cat._id, cat.nombre)"
      >
        {{ cat.nombre }}
      </button>
    </aside>

    <!-- Main -->
    <div class="products-main">
      <div class="products-topbar">
        <h2>{{ tituloActivo }}</h2>
        <span class="products-count">{{ loading ? '...' : `${totalProductos} productos` }}</span>
      </div>

      <div v-if="loading" class="products-loading">Cargando productos...</div>
      <div v-else-if="productos.length === 0" class="products-empty">No hay productos disponibles.</div>
      <div v-else class="products-grid">
        <div
          v-for="prod in productos"
          :key="prod._id"
          class="catalog-card"
          @click="router.push(`/productos/${prod._id}`)"
        >
          <div class="catalog-img" v-html="getCategoryIcon(prod.categoriaId?.nombre, 56)"></div>
          <div class="catalog-body">
            <div class="catalog-cat">{{ prod.categoriaId?.nombre || 'Producto' }}</div>
            <div class="catalog-name">{{ prod.nombre }}</div>
            <div class="catalog-price">${{ prod.precio?.toLocaleString('es-AR') }}</div>
            <button class="catalog-cta" @click.stop="agregarAlCarrito(prod._id)">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>

      <div v-if="totalPaginas > 1" class="pagination">
        <button class="pg" @click="pagina--" :disabled="pagina === 1">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          v-for="n in totalPaginas"
          :key="n"
          class="pg"
          :class="{ active: pagina === n }"
          @click="pagina = n"
        >
          {{ n }}
        </button>
        <button class="pg" @click="pagina++" :disabled="pagina === totalPaginas">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCategoryIcon } from '../utils/categoryIcon.js'
import { apiFetch, isAuthenticated } from '../services/api.js'
import './Products.css'

const router = useRouter()
const route = useRoute()
const productos = ref([])
const categorias = ref([])

// Inicializar desde query params de forma sincrónica para evitar double-fetch
const categoriaActiva = ref(route.query.catId || '')
const categoriaActivaNombre = ref(route.query.catNombre || '')

const loading = ref(true)
const pagina = ref(1)
const totalPaginas = ref(1)
const totalProductos = ref(0)

const tituloActivo = computed(() => categoriaActivaNombre.value || 'Todos los productos')

onMounted(() => {
  apiFetch('/api/categorias')
    .then(data => { categorias.value = data.categorias || [] })
    .catch(() => {})
})

// immediate:true reemplaza la llamada manual en onMounted (evita el double-fetch)
watch([pagina, categoriaActiva], cargarProductos, { immediate: true })

// Sincronizar estado si el usuario navega con el botón Atrás del browser
watch(() => route.query.catId, (newId) => {
  categoriaActiva.value = newId || ''
  categoriaActivaNombre.value = route.query.catNombre || ''
  pagina.value = 1
})

async function cargarProductos() {
  loading.value = true
  const params = new URLSearchParams({ page: pagina.value, limit: 9 })
  if (categoriaActiva.value) params.append('categoria', categoriaActiva.value)
  try {
    const data = await apiFetch(`/api/productos?${params}`)
    productos.value = data.data || []
    totalPaginas.value = data.paginacion?.totalPages || 1
    totalProductos.value = data.paginacion?.total || (data.data || []).length
  } catch {
    productos.value = []
  } finally {
    loading.value = false
  }
}

function handleCategoria(id, nombre) {
  categoriaActiva.value = id
  categoriaActivaNombre.value = nombre
  pagina.value = 1
}

async function agregarAlCarrito(productoId) {
  if (!isAuthenticated()) { router.push('/login'); return }
  try {
    await apiFetch('/api/carrito/items', {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ productoId, cantidad: 1 }),
    })
  } catch (err) {
    if (err.status === 401) { router.push('/login'); return }
    alert(err.message || 'No se pudo agregar al carrito')
  }
}
</script>
