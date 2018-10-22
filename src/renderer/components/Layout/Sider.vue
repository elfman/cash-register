<template>
  <el-aside width="180px">
    <el-card class="wrapper">
      <div v-for="item in tabs" class="tab" :class="{active: item.route === $route.name}" @click="handleTabClick(item.route)">
        {{item.name}}
      </div>
    </el-card>
  </el-aside>
</template>

<script>
  export default {
    name: 'Sider',
    data() {
      return {
        tabs: [{
          route: 'DailyOperation',
          name: '店铺经营',
        }, {
          route: 'ProductManagement',
          name: '商品管理',
        }, {
          route: 'Statics',
          name: '经营状况',
        }],
      };
    },
    methods: {
      handleTabClick(routeName) {
        this.$router.replace({
          name: routeName,
        });
      },
    },
  };
</script>

<style scoped lang="scss">
  .tab {
    width: 100%;
    height: 2.6em;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &.active {
      background-color: #409EFF;
      color: #fff;
    }
  }
  .wrapper {
    position: fixed;
    width: 180px;
    height: 500px;
    :global(.el-card__body) {
      padding: 0;
    }
  }
</style>