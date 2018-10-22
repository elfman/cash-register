<template>
    <div>
        <div>
            <span>选择时间</span>
            <el-date-picker
                    v-model="range"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions"
                    @change="handleRangeChange"
            ></el-date-picker>
        </div>
        <div class="charts" v-if="chartData">
            <el-row>
                <el-col :span="10">
                    <div>销售额排行：</div>
                    <table>
                        <tr v-for="(item, index) in rankSum" :key="item.name">
                            <td>{{index + 1}}.</td>
                            <td>{{item.name}}</td>
                            <td>{{item.sum}}</td>
                        </tr>
                    </table>
                </el-col>
                <el-col :span="10">
                    <ve-pie :data="pieData1" :settings="chartSettings" width="400px" height="350px" :legend-visible="false"></ve-pie>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <div>纯收益排行：</div>
                    <table>
                        <tr v-for="(item, index) in rankProfit" :key="item.name">
                            <td>{{index + 1}}.</td>
                            <td>{{item.name}}</td>
                            <td>{{item.profit}}</td>
                        </tr>
                    </table>
                </el-col>
                <el-col :span="10">
                    <ve-pie :data="pieData2" :settings="chartSettings" width="400px" :legend-visible="false"></ve-pie>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <div>销售量排行：</div>
                    <table>
                        <tr v-for="(item, index) in rankQuantity" :key="item.name">
                            <td>{{index + 1}}.</td>
                            <td>{{item.name}}</td>
                            <td>{{item.quantity}}</td>
                        </tr>
                    </table>
                </el-col>
                <el-col :span="10">
                    <ve-pie :data="pieData3" :settings="chartSettings" width="400px" :legend-visible="false"></ve-pie>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
  import VeHistogram from 'v-charts/lib/histogram.common';
  import VePie from 'v-charts/lib/pie.common';
  import { mapActions } from 'vuex';

  export default {
    name: 'ProductStatistic',
    components: { VeHistogram, VePie },
    data() {
      const pickerOptions = {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          },
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          },
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          },
        }],
      };
      const chartSettings = {
        labelMap: {
          name: '商品名称',
          sum: '销售额',
          quantity: '销售量',
        },
        limitShowNum: 12,
        offsetY: 170,
      };
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return {
        rangeData: null,
        chartData: null,
        pieData1: null,
        pieData2: null,
        pieData3: null,
        chartSettings,
        staticsData: {},
        range: [start, end],
        pickerOptions,
      };
    },
    methods: {
      ...mapActions('orders', ['getOrdersOfRange']),
      ...mapActions('products', ['refreshProducts']),
      refresh() {
        this.getOrdersOfRange({
          start: this.range[0],
          end: this.range[1],
        }).then((docs) => {
          this.rangeData = docs;
        });
      },
      handleRangeChange(range) {
        this.getOrdersOfRange({
          start: range[0],
          end: range[1],
        }).then((docs) => {
          this.rangeData = docs;
        });
      },
    },
    computed: {
      rankProfit() {
        const rank = this.chartData.rows.slice();
        rank.sort((t1, t2) => t2.profit - t1.profit);
        return rank.slice(0, 10);
      },
      rankQuantity() {
        const rank = this.chartData.rows.slice();
        rank.sort((t1, t2) => t2.quantity - t1.quantity);
        return rank.slice(0, 10);
      },
      rankSum() {
        const rank = this.chartData.rows.slice();
        rank.sort((t1, t2) => t2.sum - t1.sum);
        return rank.slice(0, 10);
      },
    },
    watch: {
      rangeData(val) {
        if (!val) {
          this.chartData = null;
          return;
        }
        const products = {};
        val.forEach((t) => {
          if (t.status !== 'done') return;

          t.list.forEach((item) => {
            const id = item._id; // eslint-disable-line
            if (!products[id]) {
              products[id] = {
                id,
                name: item.name,
                quantity: 0,
                earning: 0,
                profit: 0,
                sum: 0,
              };
            }
            products[id].quantity += item.quantity;
            products[id].sum += item.total;
            products[id].profit += item.profit;
          });
        });
        this.refreshProducts().then((allProducts) => {
          const rows = [];
          Object.keys(products).forEach((key) => {
            const product = allProducts.find(t => t._id === key.id); // eslint-disable-line
            if (product) {
              products[key].name = product.name;
            }
            rows.push(products[key]);
          });
          this.chartData = {
            columns: ['name', 'sum', 'quantity'],
            rows,
          };
          this.pieData1 = {
            columns: ['name', 'sum'],
            rows,
          };
          this.pieData2 = {
            columns: ['name', 'profit'],
            rows,
          };
          this.pieData3 = {
            columns: ['name', 'quantity'],
            rows,
          };
        });
      },
    },
    mounted() {
      this.refresh();
    },
  };
</script>

<style scoped lang="scss">
    .charts {
        margin-top: 20px;
        table {
            margin-top: 14px;
            td:nth-child(2) {
                padding-right: 50px;
            }
        }
    }
</style>