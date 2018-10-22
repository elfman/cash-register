import Vue from 'vue';
import Vuex from 'vuex';

import modules from './modules';
import types from './mutation-types';

Vue.use(Vuex);

let runTime;
if (localStorage.getItem('runTime')) {
  runTime = new Date(localStorage.getItem('runTime'));
} else {
  runTime = new Date();
  localStorage.setItem('runTime', runTime);
}

const state = {
  runTime,
};

const mutations = {
  [types.UPDATE_RUN_TIME](state, payload) {
    state.runTime = payload;
  },
};

const actions = {
  updateRunTime({ commit }, payload = new Date()) {
    localStorage.setItem('runTime', payload);
    commit(types.UPDATE_RUN_TIME, payload);
  },
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules,
  state,
  mutations,
  actions,
});
