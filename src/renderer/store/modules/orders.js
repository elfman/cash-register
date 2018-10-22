
import helper from '../../database/helper';
import types from '../mutation-types';

const state = {
  orders: null,
  pendingOrders: null,
  completedOrders: null,
  incomeStatisticData: null,
};

const mutations = {
  [types.UPDATE_PENDING_ORDERS](state, payload) {
    state.pendingOrders = payload;
  },
  [types.UPDATE_COMPLETED_ORDERS](state, payload) {
    state.completedOrders = payload;
  },
  [types.UPDATE_INCOME_DATA](state, payload) {
    state.incomeStatisticData = payload;
  },
};

const actions = {
  getOrderDetail(id) {
    return new Promise((resolve, reject) => {
      helper.getOrderDetail(id).then((data) => {
        resolve(data);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  createOrder(store, goods) {
    return new Promise((resolve, reject) => {
      console.log(goods);
      helper.createOrder(goods).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  refreshOrders({ commit }, status) {
    return new Promise((resolve, reject) => {
      let prom = null;
      const type = status ? `UPDATE_${status.toUpperCase()}_ORDERS` : 'UPDATE_ORDERS';
      if (!status) {
        prom = helper.getAllOrders();
      } else {
        prom = helper.getOrdersWithStatus(status);
      }
      prom.then((result) => {
        commit(types[type], result);
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  updateOrderStatus(store, { id, status }) {
    return new Promise((resolve, reject) => {
      helper.updateOrderStatus(id, status).then((result) => {
        if (result === 1) {
          resolve(true);
        } else {
          reject('Order ID not found');
        }
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getPendingOrders({ commit }) {
    return new Promise((resolve, reject) => {
      helper.getPendingOrders().then((result) => {
        commit(types.UPDATE_PENDING_ORDERS, result);
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getCompletedOrders({ commit }, startTime = new Date(localStorage.getItem('runTime'))) {
    return new Promise((resolve, reject) => {
      helper.getCompletedOrders(startTime).then((result) => {
        commit(types.UPDATE_COMPLETED_ORDERS, result);
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  removeOrder(store, id) {
    return new Promise((resolve, reject) => {
      helper.removeOrder(id).then((result) => {
        if (result === 0) {
          reject('order id not found');
        } else {
          resolve(true);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  },

  getOrdersOfMonth({ commit }, month) {
    return new Promise((resolve, reject) => {
      helper.getOrdersOfMonth(month).then((result) => {
        let res = [];
        result.forEach((t) => {
          const day = parseInt(t.day.split('-')[2], 10);
          if (!res[day]) {
            res[day] = {
              sum: 0,
              quantity: 0,
              orderDoneCount: 0,
              orderCount: 0,
              profit: 0,
              detail: [],
              day,
            };
          }
          res[day].detail.push(t);
          res[day].orderCount += 1;
          if (t.status === 'done') {
            res[day].sum += t.total;
            res[day].quantity += t.quantity;
            res[day].orderDoneCount += 1;
            res[day].profit += t.profit;
          }
        });
        Object.keys(res).forEach((key) => {
          res[key].detail.sort((t1, t2) => t1.created_at > t2.created_at);
        });
        res = res.filter(t => !!t);

        commit(types.UPDATE_INCOME_DATA, res);
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getOrdersOfRange(store, { start, end }) {
    return new Promise((resolve, reject) => {
      helper.getOrdersOfRange(start, end).then((docs) => {
        resolve(docs);
      }).catch((err) => {
        reject(err);
      });
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
