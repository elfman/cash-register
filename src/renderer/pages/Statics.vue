<template>
  <div>
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="收入统计" name="income">
        <income-statistic></income-statistic>
      </el-tab-pane>
      <el-tab-pane label="销售统计" name="products">
        <product-statistic></product-statistic>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import IncomeStatistic from '../components/IncomeStatistic';
  import ProductStatistic from '../components/ProductStatistic';

  export default {
    name: 'Statics',
    components: { IncomeStatistic, ProductStatistic },
    data() {
      return {
        activeTab: 'income',
      };
    },
  };
</script>

<style scoped lang="scss">

</style>