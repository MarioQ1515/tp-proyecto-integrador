<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">Build Your<br />Custom PC</h1>
        <p class="hero-desc">
          Seleccioná componentes compatibles y creá tu PC ideal para gaming o trabajo.
        </p>
        <div class="hero-btns">
          <button class="btn btn-outline" @click="router.push('/productos')">
            Browse Products
          </button>
        </div>
      </div>
      <div class="hero-logo">
        <img :src="'/logofinal.png'" alt="TechStore" class="hero-logo-img" />
      </div>
    </section>

    <!-- Categorías -->
    <section class="home-section">
      <h2 class="home-section-title">Shop by Category</h2>
      <div class="categories-grid">
        <div
          v-for="cat in categorias"
          :key="cat._id"
          class="cat-card"
          @click="router.push(`/productos?catId=${cat._id}&catNombre=${encodeURIComponent(cat.nombre)}`)"
        >
          <span v-html="getCategoryIcon(cat.nombre, 32)"></span>
          <span>{{ cat.nombre }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryIcon } from '../utils/categoryIcon.js'
import { apiFetch } from '../services/api.js'
import './Home.css'

const router = useRouter()
const categorias = ref([])

onMounted(() => {
  apiFetch('/api/categorias')
    .then(data => { categorias.value = data.categorias || [] })
    .catch(() => {})
})
</script>
