import store from '@/store';

export const authGuard = (to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = store.getters.isLoggedIn;

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
};