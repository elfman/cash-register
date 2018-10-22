<template>
  <div class="pending-orders">
    <el-button @click="refresh" icon="el-icon-refresh" size="mini">刷新</el-button>
    <el-table :data="pendingOrders">
      <el-table-column label="序号" type="index"></el-table-column>
      <el-table-column label="商品列表">
        <div class="goods-list" slot-scope="{row}">
          <div v-for="item in row.list" :key="item._id">
            <span>{{item.name}}</span> <span>x{{item.quantity}}</span>
          </div>
        </div>
      </el-table-column>
      <el-table-column label="总金额" prop="total"></el-table-column>
      <el-table-column label="下单时间" width="100">
        <template slot-scope="{row}">
          {{formatCreateTime(row.created_at)}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <div slot-scope="{row}">
          <el-button type="text" size="small" @click="handleCancelClick(row._id)">取消</el-button>
          <el-button type="text" size="small" @click="handleEditClick(row)">修改</el-button>
          <el-button type="text" size="small" @click="handleDoneClick(row._id)">完成</el-button>
        </div>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import moment from 'moment';
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'PendingOrders',
    data() {
      return {};
    },
    methods: {
      ...mapActions('orders', ['getPendingOrders', 'updateOrderStatus']),
      formatCreateTime(time) {
        return moment(time).format('HH:mm:ss');
      },
      handleCancelClick(id) {
        this.updateOrderStatus({ id, status: 'canceled' }).then(() => {
          this.$notify({
            type: 'success',
            title: '已取消',
          });
          this.refresh();
        });
      },
      handleDoneClick(id) {
        this.updateOrderStatus({ id, status: 'done' }).then(() => {
          this.refresh();
        });
      },
      handleEditClick(row) {
        this.$bus.$emit('edit-order', row._id);
      },
      refresh() {
        this.getPendingOrders().catch((err) => {
          this.$notify({
            type: 'error',
            title: '获取已完成订单时失败',
            message: err,
          });
        });
      },
    },
    computed: {
      ...mapState('orders', ['pendingOrders']),
    },
    mounted() {
      this.refresh();
    },
  };
</script>

<style scoped lang="scss">
  .pending-orders {
    :global(.goods-list) {
      p {
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>