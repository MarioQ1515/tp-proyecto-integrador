<template>
  <div class="auth-wrap">
    <div class="auth-card auth-card--wide">
      <h2>Crear cuenta</h2>
      <p class="auth-sub">Completá tus datos para registrarte</p>

      <div v-if="error" class="auth-error">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="two-col">
          <div class="field">
            <label>Nombre</label>
            <input v-model="form.nombre" placeholder="Mario" required />
          </div>
          <div class="field">
            <label>Apellido</label>
            <input v-model="form.apellido" placeholder="García" required />
          </div>
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" v-model="form.email" placeholder="correo@ejemplo.com" required />
        </div>
        <div class="field">
          <label>Teléfono</label>
          <input v-model="form.telefono" placeholder="+54 11 1234-5678" />
        </div>
        <div class="field">
          <label>Dirección</label>
          <input v-model="form.direccion" placeholder="Av. Corrientes 1234, CABA" />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input type="password" v-model="form.password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <button class="btn btn-dark btn-full" type="submit" :disabled="loading">
          {{ loading ? 'Creando cuenta...' : 'Crear mi cuenta' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿Ya tenés cuenta? <RouterLink to="/login">Iniciá sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../services/api.js'
import './Auth.css'

const router = useRouter()
const form = reactive({ nombre: '', apellido: '', email: '', telefono: '', direccion: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await apiFetch('/api/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ ...form }),
    })
    router.push('/login')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
