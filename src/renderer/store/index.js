import Vue from 'vue';
import Vuex from 'vuex';

import modules from './modules';
import types from './mutation-types';

Vue.use(Vuex);

const fromTime = localStorage.getItem('fromTime');

const state = {
  fromTime: fromTime || Date.now(),
};

const mutations = {
  [types.UPDATE_FROM_TIME](state, payload) {
    state.fromTime = payload;
  },
};

const actions = {
  updateFromTime({ commit }, payload) {
    localStorage.setItem('fromTime', payload);
    commit(types.UPDATE_FROM_TIME, payload);
  },
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules,
  state,
  mutations,
  actions,
});
