import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';

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
    const isAuthenticated = localStorage.getItem('access_token'); // Comprueba si el usuario está autenticado
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !isAuthenticated) {
      next('/'); // Redirige a la página de login si no está autenticado
    } else {
      next(); // Si está autenticado, o la ruta no requiere autenticación, continúa
    }
  });

  return Router;
});
