<template>
  <div>
    <el-tabs v-model="activeTab" type="card" :before-leave="handleTabSwitch">
      <el-tab-pane label="经营" name="ordering">
        <ordering :edit-order-id="editOrderId"></ordering>
      </el-tab-pane>
      <el-tab-pane label="未完成订单" name="pending">
        <pending-orders></pending-orders>
      </el-tab-pane>
      <el-tab-pane label="已完成订单" name="completed">
        <completed-orders></completed-orders>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import Ordering from '../components/Ordering';
  import PendingOrders from '../components/PendingOrders';
  import CompletedOrders from '../components/CompletedOrders';

  export default {
    name: 'DailyOperation',
    components: { Ordering, PendingOrders, CompletedOrders },
    data() {
      return {
        activeTab: 'ordering',
        editOrderId: null,
      };
    },
    methods: {
      ...mapActions('orders', ['getPendingOrders', 'getCompletedOrders']),
      ...mapActions('products', ['refreshProducts']),
      handleTabSwitch(activeName) {
        if (activeName === 'pending') {
          this.getPendingOrders();
        } else if (activeName === 'completed') {
          this.getCompletedOrders();
        } else if (activeName === 'ordering') {
          this.refreshProducts();
        }
      },
    },
    mounted() {
      this.$bus.$on('edit-order', (id) => {
        this.activeTab = 'ordering';
        this.editOrderId = id;
      });
    },
  };
</script>

<style scoped lang="scss">

</style>