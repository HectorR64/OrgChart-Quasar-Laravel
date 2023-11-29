import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  // Guard de navegación
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore(); // Usar store Pinia
    const isAuthenticated = !!authStore.token; // Verificar si el token está presente

    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next('/login'); // Redirige al login si no hay token y la ruta lo requiere
    } else {
      next(); // Continúa si hay token o la ruta no requiere autenticación
    }
  });


  return Router;
});
