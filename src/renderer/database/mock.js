const faker = require('faker'); // eslint-disable-line
const Nedb = require('nedb');
const moment = require('moment');
const _ = require('lodash');
const path = require('path');
const pinyin = require('pinyin');

const APPDATA = process.env.APPDATA || (process.platform === 'darwin' ? `${process.env.HOME}Library/Preferences` : '/var/local');

let productDb;
let orderDb;
let products = [];
let orders = []; // eslint-disable-line

async function initDb() {
  if (!productDb) {
    productDb = new Nedb({
      filename: path.resolve(APPDATA, './store-manager/product.db'),
      autoload: true,
    });
    await new Promise((resolve) => {
      productDb.remove({}, { multi: true }, (err, num) => {
        if (!err) {
          console.log(`database product clear, ${num} docs removed`); // eslint-disable-line
          resolve(num);
        }
      });
    });
  }

  if (!orderDb) {
    orderDb = new Nedb({
      filename: path.resolve(APPDATA, './store-manager/order.db'),
      autoload: true,
    });
    await new Promise((resolve) => {
      orderDb.remove({}, { multi: true }, (err, num) => {
        if (!err) {
          console.log(`database order clear, ${num} docs removed`); // eslint-disable-line
          resolve(num);
        }
      });
    });
  }
}

function genProductData() {
  const data = [];
  const names = ['珍珠奶茶', '烧仙草', '姜撞奶', '双皮奶', '红豆汤', '绿豆沙', '柠檬茶', '椰奶', '姜茶', '贡茶', '王老吉', '豆浆', '西瓜汁', '苹果汁', '抹茶', '椰汁西米露', '咖啡'];
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    const time = faker.date.past();
    const shortName = pinyin(name, { style: pinyin.STYLE_FIRST_LETTER }).join('');
    const price = faker.random.number({ max: 60, min: 1 }) / 2.0;
    const product = {
      name,
      shortName,
      price,
      cost: price - faker.random.number({ max: price, min: 0 }),
      isOnShelf: true,
      created_at: time,
      updated_at: time,
    };
    data.push(product);
  }
  return new Promise((resolve, reject) => {
    productDb.insert(data, (err, docs) => {
      if (!err) {
        console.log('成功创建商品');
        products = docs;
        resolve(products);
      } else {
        reject(err);
      }
    });
  });
}

function genOrderData() {
  const from = new Date('2018-01-01');
  const end = new Date();
  const statusList = ['pending', 'canceled', 'done'];
  const data = [];
  for (let i = 0; i < 2000; i += 1) {
    let sum = 0;
    let count = 0;
    let profit = 0;
    const goods = _.shuffle(products).slice(0, faker.random.number({ max: 5, min: 1 })).map((t) => { // eslint-disable-line
      const quantity = faker.random.number({ max: 10, min: 1 });
      const total = t.price * quantity;
      const earning = (t.price - t.cost) * quantity;
      count += quantity;
      sum += total;
      profit += earning;
      return {
        _id: t._id,
        name: t.name,
        price: t.price,
        quantity,
        total,
        profit: earning,
      };
    });
    const time = faker.date.between(from, end);
    const day = moment(time).format('YYYY-MM-DD');
    const order = {
      total: sum,
      quantity: count,
      status: faker.random.arrayElement(statusList),
      created_at: time,
      updated_at: time,
      day,
      list: goods,
      profit,
    };
    data.push(order);
  }
  return new Promise((resolve, reject) => {
    orderDb.insert(data, (err, docs) => {
      if (!err) {
        orders = docs;
        resolve(docs);
        console.log('成功创建订单数据');
      } else {
        reject(err);
      }
    });
  });
}

async function run() {
  faker.locale = 'zh_CN';
  await initDb();
  await genProductData();
  await genOrderData();
}

run();
