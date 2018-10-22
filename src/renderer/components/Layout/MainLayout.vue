<template>
  <el-container>
    <sider></sider>
    <el-main>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </el-main>
  </el-container>
</template>

<script>
  import Sider from './Sider';

  export default {
    name: 'MainLayout',
    components: { Sider },
  };
</script>

<style scoped lang="scss">

</style>