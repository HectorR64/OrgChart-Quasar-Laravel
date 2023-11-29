import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null, // Agregando una propiedad para el token
    permissions: [],
  }),
  actions: {
    login(data) {
      this.user = data.user;
      this.token = data.token; // Guardar el token
      this.permissions = data.permissions;
      this.saveState();
    },
    logout() {
      this.user = null;
      this.token = null; // Limpiar el token
      this.permissions = [];
      this.saveState();
    },
    saveState() {
      // Guardar el estado en localStorage incluyendo el token
      localStorage.setItem('authState', JSON.stringify({
        user: this.user,
        token: this.token,
        permissions: this.permissions
      }));
    },
    restoreState() {
      const state = localStorage.getItem('authState');
      if (state) {
        const { user, token, permissions } = JSON.parse(state);
        this.user = user;
        this.token = token; // Restaurar el token
        this.permissions = permissions;
      }
    }
  }
});
