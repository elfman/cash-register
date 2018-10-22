import Vue from 'vue';
import Router from 'vue-router';

import MainLayout from '../components/Layout/MainLayout';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: require('../pages/Welcome').default,
    },
    {
      path: '',
      component: MainLayout,
      children: [
        {
          path: 'daily-operation',
          name: 'DailyOperation',
          component: require('../pages/DailyOperation').default,
        },
        {
          path: 'product-management',
          name: 'ProductManagement',
          component: require('../pages/ProductManagement').default,
        },
        {
          path: 'statics',
          name: 'Statics',
          component: require('../pages/Statics').default,
        },
      ],
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
