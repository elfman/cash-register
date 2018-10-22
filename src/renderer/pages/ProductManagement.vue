<template>
  <div>
    <el-card>
      <el-form :model="form" ref="form" label-width="50px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item prop="name" label="名称">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="shortName" label="简写">
              <el-input v-model="form.shortName"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="price" label="单价">
              <el-input v-model="form.price"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="cost" label="成本">
              <el-input v-model="form.cost"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="actions">
          <el-col :span="12">
            <el-button type="primary" @click="handleSaveClick" size="small">保存</el-button>
            <el-button type="text" @click="handleCancelClick" size="small">{{form.id ? '取消': '重置'}}</el-button>
            <span class="editing-id" v-if="form.id">正在编辑ID：{{form.id}}</span>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="isOnShelf" label="是否上架" label-width="80px">
              <el-switch v-model="form.isOnShelf"></el-switch>
            </el-form-item>
          </el-col>
        </div>
      </el-form>
    </el-card>
    <el-card>
      <el-table :data="products">
        <el-table-column type="index" label="ID" width="50"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="shortName" label="简称" width="120"></el-table-column>
        <el-table-column prop="price" label="单价" width="120"></el-table-column>
        <el-table-column prop="cost" label="成本"></el-table-column>
        <el-table-column prop="isOnShelf" label="上架" width="120">
          <template slot-scope="{row}">
            <el-switch :value="row.isOnShelf" @change="handleTableSwitchChange(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110">
          <template slot-scope="{row}">
            <el-button type="text" @click="handleEditClick(row)">编辑</el-button>
            <el-button type="text" @click="handleRemoveClick(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex';

  export default {
    name: 'ProductManagement',
    data() {
      return {
        form: {
          id: null,
          shortName: '',
          name: '',
          price: '',
          cost: '',
          isOnShelf: true,
        },
      };
    },
    computed: {
      ...mapState('products', ['products']),
    },
    methods: {
      ...mapActions('products', ['refreshProducts', 'addProduct', 'removeProduct', 'updateProduct', 'updateProductOnShelf']),
      resetForm() {
        this.form.id = null;
        this.form.shortName = '';
        this.form.name = '';
        this.form.price = '';
        this.form.cost = '';
        this.form.isOnShelf = true;
      },
      handleSaveClick() {
        const data = {
          id: this.form.id,
          name: this.form.name,
          shortName: this.form.shortName,
          price: parseFloat(this.form.price),
          cost: parseFloat(this.form.cost),
          isOnShelf: this.form.isOnShelf,
        };
        if (this.form.id) {
          this.updateProduct(data).then(() => {
            this.$notify({
              type: 'success',
              title: '更新成功',
            });
            this.resetForm();
          });
        } else {
          this.addProduct(data).then(() => {
            this.$notify({
              type: 'success',
              title: '添加成功',
            });
            this.resetForm();
          });
        }
      },
      handleCancelClick() {
        this.resetForm();
      },
      handleEditClick(row) {
        this.form.id = row._id;
        this.form.name = row.name;
        this.form.price = `${row.price}`;
        this.form.shortName = row.shortName;
        this.form.isOnShelf = row.isOnShelf;
        this.form.cost = row.cost;
      },
      handleRemoveClick(row) {
        this.removeProduct(row._id).then(() => { // eslint-disable-line
          this.$notify({
            type: 'success',
            title: '删除成功',
          });
        });
      },
      handleTableSwitchChange({ _id, isOnShelf }) { // eslint-disable-line
        this.updateProductOnShelf({ id: _id, onShelf: !isOnShelf }).catch((err) => {
          this.$notify({
            type: 'error',
            title: '发生错误',
            message: err,
          });
        });
      },
    },
    mounted() {
      this.refreshProducts();
    },
  };
</script>

<style scoped lang="scss">
  .el-card {
    & + .el-card {
      margin-top: 15px;
    }
  }
  .actions {
    display: flex;
    align-items: center;
    > span {
      margin-left: 30px;
    }
  }
</style>