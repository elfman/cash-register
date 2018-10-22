import helper from '../../database/helper';
import types from '../mutation-types';

const state = {
  products: null,
};

const mutations = {
  [types.UPDATE_PRODUCTS](state, payload) {
    state.products = payload;
  },
  [types.UPDATE_PRODUCT_ON_SHELF](state, { id, onShelf }) {
    const product = state.products.find(t => t._id === id); // eslint-disable-line
    if (product) {
      product.isOnShelf = onShelf;
    }
  },
};

const actions = {
  refreshProducts({ commit }) {
    return new Promise((resolve, reject) => {
      helper.getAllProducts().then((result) => {
        commit(types.UPDATE_PRODUCTS, result);
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  addProduct({ dispatch }, payload) {
    return new Promise((resolve, reject) => {
      helper.addProduct(payload).then((result) => {
        dispatch('refreshProducts');
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  removeProduct({ dispatch }, id) {
    return helper.removeProduct(id).then((result) => {
      dispatch('refreshProducts');
      return result;
    });
  },
  updateProduct({ dispatch }, payload) {
    return helper.updateProduct(payload).then((result) => {
      dispatch('refreshProducts');
      return result;
    });
  },
  updateProductOnShelf({ commit }, { id, onShelf }) {
    return helper.updateProductOnShelf(id, onShelf).then((result) => {
      if (result) {
        commit(types.UPDATE_PRODUCT_ON_SHELF, { id, onShelf });
      }
      return result;
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
