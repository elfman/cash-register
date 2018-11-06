import Vue from 'vue';
import Vuex from 'vuex';
import crypto from 'crypto';
import helper from '../database/helper';

import modules from './modules';
import types from './mutation-types';

Vue.use(Vuex);


const state = {
  password: null,
};

const mutations = {
  [types.UPDATE_PASSWORD](state, payload) {
    state.password = payload;
  },
};

const actions = {
  login({ commit }, payload) {
    const pwd = crypto.createHash('sha1').update(payload).digest('hex');
    helper.initDb(pwd.substr(0, 16));
    commit(types.UPDATE_PASSWORD, pwd);
  },
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules,
  state,
  mutations,
  actions,
});
