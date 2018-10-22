import moment from 'moment';
import path from 'path';
import { remote } from 'electron'; // eslint-disable-line
const Nedb = require('nedb');

let productDb;
let orderDb;

let homedir = remote.app.getPath('userData');
if (process.env.NODE_ENV !== 'production') {
  homedir = path.resolve(homedir, '../store-manager');
}
console.log(remote.app.getName());

function initDb() {
  if (!productDb) {
    productDb = new Nedb({
      filename: path.resolve(homedir, './product.db'),
      autoload: true,
    });
  }

  if (!orderDb) {
    orderDb = new Nedb({
      filename: path.resolve(homedir, './order.db'),
      autoload: true,
    });
  }
}

function addProduct({
  name, shortName, price, cost, isOnShelf,
}) {
  const date = new Date();
  return new Promise((resolve, reject) => {
    productDb.insert({
      name,
      shortName,
      price,
      cost,
      isOnShelf,
      created_at: date,
      updated_at: date,
    }, (err, newDoc) => {
      if (!err) {
        resolve(newDoc);
      } else {
        reject(err);
      }
    });
  });
}

function getAllProducts() {
  return new Promise((resolve, reject) => {
    productDb.find({}, (err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

function removeProduct(id) {
  return new Promise((resolve, reject) => {
    productDb.remove({ _id: id }, {}, (err, num) => {
      if (!err) {
        resolve(num);
      } else {
        reject(err);
      }
    });
  });
}

function updateProduct({
  id, name, shortName, price, cost, isOnShelf,
}) {
  const date = new Date();
  return new Promise((resolve, reject) => {
    productDb.update({ _id: id }, {
      $set: {
        name,
        shortName,
        price,
        cost,
        isOnShelf,
        updated_at: date,
      },
    }, {}, (err, num) => {
      if (!err) {
        resolve(num);
      } else {
        reject(err);
      }
    });
  });
}

function updateProductOnShelf(id, isOnShelf) {
  const date = new Date();
  return new Promise((resolve, reject) => {
    productDb.update({ _id: id }, {
      isOnShelf,
      updated_at: date,
    }, {}, (err, num) => {
      if (!err) {
        resolve(num);
      } else {
        reject(err);
      }
    });
  });
}

function createOrder(goods) {
  const date = new Date();
  const detail = goods.map(t => ({
    _id: t._id,
    name: t.name,
    price: parseFloat(t.price),
    profit: (t.price - t.cost) * t.quantity,
    quantity: t.quantity,
    total: t.price * t.quantity,
  }));
  let total = 0;
  let quantity = 0;
  let profit = 0;
  goods.forEach((t) => {
    total += t.price * t.quantity;
    quantity += t.quantity;
    profit += t.profit;
  });

  const day = moment().format('YYYY-MM-DD');

  return new Promise((resolve, reject) => {
    orderDb.insert({
      total,
      status: 'pending',
      created_at: date,
      updated_at: date,
      day,
      month: `${date.getFullYear()}-${date.getMonth()}`,
      list: detail,
      quantity,
      profit,
    }, (err, doc) => {
      if (!err) {
        resolve(doc);
      } else {
        reject(err);
      }
    });
  });
}

function removeOrder(id) {
  return new Promise((resolve, reject) => {
    orderDb.remove({ _id: id }, (err, num) => {
      if (!err) {
        resolve(num);
      } else {
        reject(err);
      }
    });
  });
}

function getAllOrders() {
  return new Promise((resolve, reject) => {
    orderDb.find({}).sort({ updated_at: -1 }).exec((err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

function getOrdersWithStatus(status) {
  return new Promise((resolve, reject) => {
    orderDb.find({
      status,
    }, (err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

function getOrderDetail(id) {
  return new Promise((resolve, reject) => {
    orderDb.find({ _id: id }, (err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

function getPendingOrders() {
  return new Promise((resolve, reject) => {
    orderDb.find({
      status: 'pending',
    }).sort({ updated_at: -1 }).exec((err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

function getCompletedOrders() {
  return new Promise((resolve, reject) => {
    orderDb.find({
      $not: {
        status: 'pending',
      },
    }).sort({ updated_at: -1 }).exec((err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

function updateOrderStatus(id, status) {
  return new Promise((resolve, reject) => {
    orderDb.update({ _id: id }, {
      $set: {
        status,
        updated_at: new Date(),
      },
    }, {}, (err, num) => {
      if (!err) {
        resolve(num);
      } else {
        reject(err);
      }
    });
  });
}

function getOrdersOfMonth(month) {
  const start = moment(`${month}-01 00:00:00`);
  const end = moment(start).add(1, 'month');
  return new Promise((resolve, reject) => {
    orderDb.find({
      created_at: {
        $gte: start.toDate(),
        $lt: end.toDate(),
      },
    }, (err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

function getOrdersOfRange(start, end) {
  return new Promise((resolve, reject) => {
    orderDb.find({
      created_at: {
        $gte: start,
        $lt: end,
      },
    }, (err, docs) => {
      if (!err) {
        resolve(docs);
      } else {
        reject(err);
      }
    });
  });
}

export default {
  initDb,
  addProduct,
  getAllProducts,
  removeProduct,
  updateProduct,
  updateProductOnShelf,
  getAllOrders,
  createOrder,
  removeOrder,
  getOrdersWithStatus,
  getOrderDetail,
  getPendingOrders,
  updateOrderStatus,
  getCompletedOrders,
  getOrdersOfMonth,
  getOrdersOfRange,
};
