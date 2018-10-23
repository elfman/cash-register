<template>
  <el-row :gutter="12">
    <el-col :span="16">
      <el-card>
        <el-table :data="cart" empty-text="空">
          <el-table-column prop="shortName" label="缩写" width="60"></el-table-column>
          <el-table-column prop="name" label="商品名"></el-table-column>
          <el-table-column prop="price" label="单价"></el-table-column>
          <el-table-column label="数量">
            <div slot-scope="{row}">
              <el-input-number v-model="row.quantity" size="mini"></el-input-number>
            </div>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card class="summary">
        <div class="right-header">
          <span>已点商品：</span>
          <el-button type="text" @click="clearCart">清空</el-button>
        </div>
        <el-table :data="cartFiltered" size="small"
                  show-summary :summary-method="getSummaries">
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column prop="quantity" label="数量" width="100"></el-table-column>
          <el-table-column label="价格" width="100">
            <template slot-scope="{row}">
              {{(row.price * row.quantity).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-card class="editing-order" v-if="orderEditing">
        <div class="row title">修改订单</div>
        <div class="row">需补差价：<span>{{(summery.sum - orderEditing.total).toFixed(2)}}</span></div>
        <div class="row">
          <el-button size="mini" @click="handleCancelEditClick">取消修改</el-button>
          <el-button size="mini" @click="handleCancelOrderClick">取消订单</el-button>
        </div>
      </el-card>
      <el-button class="summit" type="primary" @click="handleSummitClick">提交</el-button>
    </el-col>
    <el-dialog :visible.sync="dialogConfirmVisible" title="提示" width="300px">
      <div>下单成功，是否打印小票？</div>
      <div slot="footer">
        <el-button @click="dialogConfirmVisible = false" size="mini">取消</el-button>
        <el-button type="primary" @click="printOrder" size="mini">确定</el-button>
      </div>
    </el-dialog>
    <div class="ticker-preview" :class="{shown: dialogConfirmVisible}">
      <webview ref="webview" :src="ticketTemplatePath" nodeintegration style="flex:1;width:100%;"
               :style="{height: `${webviewHeight}px`}"></webview>
    </div>
  </el-row>
</template>

<script>
  import { mapState, mapActions } from 'vuex';
  import moment from 'moment';

  export default {
    name: 'Ordering',
    props: {
      editOrderId: String,
    },
    data() {
      return {
        productList: null,
        cart: [],
        orderEditing: null,
        lastOrder: null,
        dialogConfirmVisible: false,
        ticketTemplatePath: `file://${__static}/print-template.html`,
      };
    },
    methods: {
      ...mapActions('products', ['refreshProducts']),
      ...mapActions('orders', ['createOrder', 'getOrderDetail', 'updateOrder', 'cancelOrder']),
      clearCart() {
        this.cart.forEach((t) => {
          t.quantity = 0;
        });
      },
      syncCart(products, oldCart) {
        if (!products) {
          this.cart = [];
          return;
        }
        const cart = [];
        products.forEach((product) => {
          if (!product.isOnShelf) return;
          let oldItem = null;
          if (oldCart) {
            oldItem = oldCart.find(t => t._id === product._id);
          }
          cart.push(Object.assign({}, product, {
            quantity: oldItem ? oldItem.quantity : 0,
          }));
        });
        this.cart = cart;
      },
      getSummaries() {
        return ['总计', this.summery.quantity, this.summery.sum.toFixed(2)];
      },
      handleSummitClick() {
        if (!this.cartFiltered || this.cartFiltered.length === 0) return;

        let promise;
        if (!this.orderEditing) {
          promise = this.createOrder(this.cartFiltered);
        } else {
          promise = this.updateOrder({
            id: this.orderEditing._id,
            goods: this.cartFiltered,
          });
        }
        promise.then((order) => {
          this.clearCart();
          this.orderEditing = null;
          this.lastOrder = order;
          this.dialogConfirmVisible = true;
          const { webview } = this.$refs;
          webview.send('fill-order', order);
        });
      },
      handleCancelEditClick() {
        this.orderEditing = null;
      },
      handleCancelOrderClick() {
        this.updateOrderStatus({
          id: this.orderEditing._id,
          status: 'canceled',
        }).then(() => {
          this.$notify({
            type: 'success',
            title: '已取消',
          });
          this.orderEditing = null;
        });
      },
      editOrder(id) {
        this.clearCart();
        this.getOrderDetail(id).then((order) => {
          this.orderEditing = order;
          order.list.forEach((item) => {
            const product = this.cart.find(t => t._id === item._id);
            if (product) {
              product.quantity = item.quantity;
            }
          });
        });
      },
      printOrder() {
        const { webview } = this.$refs;
        webview.print({ silent: true });
      },
      formatTime(date = null, format = 'YYYY-MM-DD HH:mm:ss') {
        return moment(date).format(format);
      },
    },
    computed: {
      ...mapState('products', ['products']),
      ...mapState(['fromTime']),
      cartFiltered() {
        return this.cart.filter(t => t.quantity > 0);
      },
      summery() {
        const summery = {
          quantity: 0,
          sum: 0,
        };
        this.cartFiltered.forEach((item) => {
          summery.quantity += item.quantity;
          summery.sum += item.price * item.quantity;
        });
        return summery;
      },
      webviewHeight() {
        if (!this.lastOrder) return 170;
        return 170 + this.lastOrder.list.length * 24;
      },
    },
    watch: {
      products: {
        immediate: true,
        handler(val) {
          this.syncCart(val, this.cart);
        },
      },
      editOrderId: {
        immediate: true,
        handler(val) {
          if (val) {
            this.editOrder(val);
          }
        },
      },
    },
    mounted() {
      if (!this.products) {
        this.refreshProducts();
      }
    },
  };
</script>

<style scoped lang="scss">
  .summary {
    :global(.el-card__body) {
      padding: 8px 10px;
    }
  }
  .right-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .summit {
    width: 100%;
    margin-top: 16px;
  }
  .editing-order {
    margin-top: 10px;
    font-size: 14px;
    .title {
      font-weight: bold;
      font-size: 17px;
    }
    .row:not(:last-of-type) {
      margin-bottom: 10px;
    }
  }
  .ticker-preview {
    position: fixed;
    left: -200%;
    top: -200%;
    z-index: 9999;
    display: flex;
    width: 400px;
    flex-direction: column;
    background-color: #fff;
    border-radius: 10px;
    transform: translateX(-50%);
    &.shown {
      left: 50%;
      top: 400px;
    }
  }
</style>