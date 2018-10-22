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
        <el-table :data="cartFiltered" :show-header="false" size="small"
                  show-summary :summary-method="getSummaries">
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column prop="quantity" label="数量" width="30"></el-table-column>
          <el-table-column label="价格" width="80">
            <template slot-scope="{row}">
              {{(row.price * row.quantity).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-button class="summit" type="primary" @click="handleSummitClick">提交</el-button>
    </el-col>
  </el-row>
</template>

<script>
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'Ordering',
    data() {
      return {
        productList: null,
        cart: [],
      };
    },
    methods: {
      ...mapActions('products', ['refreshProducts']),
      ...mapActions('orders', ['createOrder']),
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
            oldItem = oldCart.find(t => t.id === product.id);
          }
          cart.push(Object.assign({}, product, {
            quantity: oldItem ? oldItem.quantity : 0,
          }));
        });
        this.cart = cart;
      },
      getSummaries() {
        let quantity = 0;
        let sum = 0;
        this.cartFiltered.forEach((item) => {
          quantity += item.quantity;
          sum += item.price * item.quantity;
        });
        return ['总计', quantity, sum.toFixed(2)];
      },
      handleSummitClick() {
        this.createOrder(this.cartFiltered).then(() => {
          this.$notify({
            type: 'success',
            title: '提交成功',
          });
          this.clearCart();
        });
      },
      handleClearClick() {
        this.clearCart();
      },
    },
    computed: {
      ...mapState('products', ['products']),
      ...mapState(['fromTime']),
      cartFiltered() {
        return this.cart.filter(t => t.quantity > 0);
      },
    },
    watch: {
      products: {
        immediate: true,
        handler(val) {
          this.syncCart(val, this.cart);
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
</style>