<template>
  <div>
    <el-tabs v-model="activeTab" type="card" :before-leave="handleTabSwitch">
      <el-tab-pane label="经营" name="operate">
        <ordering></ordering>
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
        activeTab: 'operate',
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
        } else if (activeName === 'operate') {
          this.refreshProducts();
        }
      },
    },
  };
</script>

<style scoped lang="scss">

</style>