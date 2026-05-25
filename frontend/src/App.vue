<template>
  <Navbar v-if="!$route.meta.hideNavbar" />
  <RouterView />
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>
