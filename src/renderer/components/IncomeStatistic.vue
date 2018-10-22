<template>
    <div>
        <div class="operations">
            <div>
                <span>选择月份</span>
                <el-date-picker v-model="month" type="month" @change="onMonthChange" :clearable="false"></el-date-picker>
            </div>
            <div class="summery">
                <span>订单数：{{summery.orderDoneCount}}/{{summery.orderCount}}</span>
                <span>总销售额：{{summery.money}}</span>
                <span>销售商品数：{{summery.productCount}}</span>
                <span>总利润：{{summery.profit}}</span>
            </div>
            <el-button @click="showDiagram" size="mini">图表</el-button>
            <el-button @click="refresh" size="mini">刷新</el-button>
        </div>
        <div class="chart">
            <ve-histogram :data="chartData" :settings="chartSettings" :extend="chartExtend" height="500px"></ve-histogram>
        </div>
        <el-table :data="incomeStatisticData">
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-table v-if="scope.row.detail" :data="scope.row.detail" :border="true" size="mini">
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="商品">
                            <template slot-scope="{row}">
                                <div v-for="item in row.list" :key="item.name">{{item.name}} {{item.price}} x{{item.quantity}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="总价" prop="total"></el-table-column>
                        <el-table-column label="收益" prop="profit"></el-table-column>
                        <el-table-column label="状态">
                            <template slot-scope="{row}">
                                <span>{{statusList[row.status]}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间">
                            <template slot-scope="{row}">
                                <span>{{formatTime(row.created_at)}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="最后更新">
                            <template slot-scope="{row}">
                                <span>{{formatTime(row.updated_at)}}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column label="日期" prop="day">
                <template slot-scope="{row}">{{getDayText(row.day)}}</template>
            </el-table-column>
            <el-table-column label="订单数">
                <template slot-scope="{row}">
                    {{row.orderDoneCount}}/{{row.orderCount}}
                </template>
            </el-table-column>
            <el-table-column label="销售额" prop="sum"></el-table-column>
            <el-table-column label="利润" prop="profit"></el-table-column>
            <el-table-column label="卖出商品" prop="quantity"></el-table-column>
        </el-table>
    </div>
</template>

<script>

  import VeHistogram from 'v-charts/lib/histogram.common';

  import moment from 'moment';
  import { mapState, mapActions } from 'vuex';

  export default {
    name: 'IncomeStatistic',
    components: { VeHistogram },
    data() {
      return {
        activeTab: 0,
        month: moment(`${(new Date()).getFullYear()}-${(new Date().getMonth() + 1)}-01 00:00:00`).toDate(),
        statusList: {
          pending: '未完成',
          done: '已完成',
          canceled: '已取消',
        },
        chartSettings: {
          metrics: ['营业额', '利润'],
        },
        chartExtend: {
          series: {
            label: { show: true, position: 'top' },
          },
        },
      };
    },
    computed: {
      ...mapState('orders', ['incomeStatisticData']),
      chartData() {
        if (!this.incomeStatisticData) {
          return null;
        }
        const rows = [];
        let lastDay = moment(this.month).add(1, 'month').subtract(1, 'day').date();
        if (this.month.getFullYear() === new Date().getFullYear()
          && this.month.getMonth() === new Date().getMonth()) {
          lastDay = new Date().getDate();
        }
        for (let i = 1; i <= lastDay; i += 1) {
          const data = {
            日期: i,
            营业额: 0,
            完成订单: 0,
            商品数: 0,
            利润: 0,
          };
          const dayData = this.incomeStatisticData.find(t => t.day === i);
          if (dayData) {
            data.营业额 = dayData.sum;
            data.完成订单 = dayData.orderDoneCount;
            data.商品数 = dayData.quantity;
            data.利润 = dayData.profit;
          }
          rows.push(data);
        }
        return {
          columns: ['日期', '营业额', '利润'],
          rows,
        };
      },
      monthText() {
        return moment(this.month).format('YYYY-MM');
      },
      summery() {
        const summery = {
          money: 0,
          orderCount: 0,
          orderDoneCount: 0,
          productCount: 0,
          profit: 0,
        };
        if (!this.incomeStatisticData) {
          return summery;
        }
        this.incomeStatisticData.forEach((day) => {
          summery.money += day.sum;
          summery.productCount += day.quantity;
          summery.orderCount += day.orderCount;
          summery.orderDoneCount += day.orderDoneCount;
          summery.profit += day.profit;
        });
        return summery;
      },
    },
    methods: {
      ...mapActions('orders', ['getOrdersOfMonth']),
      refresh() {
        this.getOrdersOfMonth(this.monthText);
      },
      onMonthChange() {
        this.refresh();
      },
      formatTime(date) {
        return moment(date).format('HH:mm:ss');
      },
      getDayText(day) {
        const text = `0${day}`.slice(-2);
        return `${this.monthText}-${text}`;
      },
      showDiagram() {

      },
    },
    mounted() {
      this.refresh();
    },
  };
</script>

<style lang="scss" scoped>
    .operations {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .summery {
        font-size: 14px;
        color: #333;
        span {
            margin-right: 8px;
        }
    }
    .chart {
        margin: 0 20px;
    }
</style>