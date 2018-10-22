<template>
  <div>
    <p>欢迎使用小店铺管理系统</p>
    <el-row>
      <el-col :span="12">
        <el-button type="info" @click="continueOperation">继续上次经营</el-button>
        <el-button type="primary" @click="openNewDay">开启新篇章</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  export default {
    name: 'Welcome',
    methods: {
      ...mapActions(['updateFromTime']),
      continueOperation() {
        this.$router.push({
          name: 'DailyOperation',
        });
      },
      openNewDay() {
        this.updateFromTime(Date.now());
        this.$router.push({
          name: 'DailyOperation',
        });
      },
    },
    mounted() {
      // if (!localStorage.getItem('fromTime')) {
      //   this.$router.push({
      //     name: 'DailyOperation',
      //   });
      // }
    },
  };
</script>

<style scoped lang="scss">

</style>