<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <h2>Iniciar Sesión</h2>
      <p class="auth-sub">Ingresa tus credenciales para acceder a tu cuenta</p>

      <div v-if="error" class="auth-error">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            placeholder="••••••••"
            required
          />
        </div>
        <button class="btn btn-dark btn-full" type="submit" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿No tienes cuenta? <RouterLink to="/registro">Regístrate aquí</RouterLink>
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
const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: form.email, password: form.password }),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
