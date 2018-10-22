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
            <div>
                <div>销售额图示：</div>
                <ve-pie :data="pieData1" :settings="chartSettings" :legend-visible="false"></ve-pie>
            </div>
            <div>
                <div>纯收益图示：</div>
                <ve-pie :data="pieData2" :settings="chartSettings" :legend-visible="false"></ve-pie>
            </div>
            <div>
                <div>销售量图示：</div>
                <ve-pie :data="pieData3" :settings="chartSettings" :legend-visible="false"></ve-pie>
            </div>
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
            columns: ['name', 'quantity'],
            rows,
          };
          this.pieData3 = {
            columns: ['name', 'profit'],
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

<style scoped>
    .charts {
        margin-top: 40px;
    }
</style>