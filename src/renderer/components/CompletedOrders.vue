<template>
  <div>
    <el-button @click="refresh" icon="el-icon-refresh" size="mini">刷新</el-button>
    <el-table :data="completedOrders">
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <el-table v-if="row.list" :data="row.list" :border="true" size="mini">
            <el-table-column label="商品名" prop="name"></el-table-column>
            <el-table-column label="数量" prop="quantity"></el-table-column>
            <el-table-column label="单价">
              <template slot-scope="scope">
                {{(scope.row.price)}}
              </template>
            </el-table-column>
            <el-table-column label="总计" prop="total"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column lable="序号" type="index"></el-table-column>
      <el-table-column label="商品数">
        <template slot-scope="{row}">
          {{quantitySum(row)}}
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="total"></el-table-column>
      <el-table-column label="最后更新" width="160">
        <template slot-scope="{row}">
          {{formatUpdateTime(row.updated_at)}}
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <span slot-scope="{row}">{{statusList[row.status]}}</span>
      </el-table-column>
      <el-table-column label="操作">
        <div slot-scope="{row}">
          <el-button type="text" @click="handleRemoveClick(row._id)">删除</el-button>
        </div>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import moment from 'moment';
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'CompletedOrders',
    data() {
      return {
        statusList: {
          canceled: '已取消',
          done: '已完成',
          pending: '进行中',
        },
      };
    },
    computed: {
      ...mapState('orders', ['completedOrders']),
    },
    methods: {
      ...mapActions('orders', ['getOrderDetail', 'getCompletedOrders', 'removeOrder']),
      formatUpdateTime(time) {
        return moment(time).format('YYYY-MM-DD HH:mm:ss');
      },
      quantitySum(row) {
        if (!row.list) return 0;
        let sum = 0;

        row.list.forEach((t) => {
          sum += t.quantity;
        });
        return sum;
      },
      handleRemoveClick(id) {
        this.removeOrder(id).then(() => {
          this.$notify({
            type: 'success',
            title: '删除成功',
          });
          this.refresh();
        }).catch((err) => {
          this.$notify({
            type: 'error',
            title: '删除失败',
            message: err,
          });
        });
      },
      refresh() {
        this.getCompletedOrders().catch((err) => {
          this.$notify({
            type: 'error',
            title: '获取已完成订单时失败',
            message: err,
          });
        });
      },
    },
    mounted() {
      this.refresh();
    },
  };
</script>

<style scoped lang="scss">

</style>