<template>
  <div>
    <q-layout view="hHh Lpr lff" style="height: 500px" class="shadow-2 rounded-borders">
      <!-- Header -->
      <q-header>
        <q-toolbar>
          <q-btn flat round dense icon="menu" @click="toggleMenu" />
          <q-toolbar-title>Organization</q-toolbar-title>
          <q-list>
            <q-btn flat round dense icon="more_vert">
              <q-menu transition-show="flip-right" transition-hide="flip-left">
                <q-list style="min-width: 100px">
                  <q-item clickable v-close-popup @click="logout">
                    <q-item-section>Cerrar Sesión</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-list>
        </q-toolbar>
      </q-header>

      <!-- Drawer -->
      <q-drawer v-model="menuOpen" :width="250" :breakpoint="500" overlay bordered>
        <q-scroll-area class="fit">
          <q-list>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="inbox" />
              </q-item-section>
              <q-item-section>
                Inbox
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <!-- Page Container -->
      <q-page-container style="background-color: #f1f1f1;">
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { api } from 'boot/axios';
// Usar ref para crear una propiedad reactiva
const menuOpen = ref(false);

// Acceder al enrutador de Vue Router
const router = useRouter();
const authStore = useAuthStore();

// Método para alternar el estado de menuOpen
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
//Método cerrar sesión
const logout = async () => {
  try {
    // Enviar el token en la solicitud de logout
    await api.post('/logout', {}, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });

    // Proceder con el logout en el cliente después de la respuesta del servidor
    authStore.logout();
    router.push('/'); // Redirigir al usuario a la página de inicio de sesión
  } catch (error) {
    console.error('Error en el logout:', error);
  }
};
</script>
