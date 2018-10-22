import Vue from 'vue';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App';
import router from './router';
import store from './store';
import helper from './database/helper';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.use(ElementUI);
helper.initDb();

const EventBus = new Vue();

Object.defineProperties(Vue.prototype, {
  $bus: {
    get() {
      return EventBus;
    },
  },
});

global.EventBus = EventBus;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
