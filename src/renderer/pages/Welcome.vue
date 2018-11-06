<template>
  <div class="container">
    <el-card class="form">
      <p>欢迎使用小店铺管理系统</p>
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="重复密码" prop="confirm" v-if="!hasPassword">
          <el-input v-model="form.confirm"></el-input>
        </el-form-item>
      </el-form>
      <div class="bottom">
        <el-button @click="handleClick" type="primary">{{hasPassword ? '登录' : '设置密码'}}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import crypto from 'crypto';

  export default {
    name: 'Welcome',
    data() {
      const confirmPwdValidator = (rule, value, callback) => {
        if (this.hasPassword) {
          callback();
          return;
        }
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.form.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      };
      const rules = {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, message: '请输入3位以上的密码', trigger: 'blur' },
        ],
        confirm: [
          { validator: confirmPwdValidator, required: !this.hasPassword, trigger: 'blur' },
        ],
      };
      return {
        rules,
        form: {
          password: null,
          confirm: null,
        },
      };
    },
    methods: {
      ...mapActions(['login']),
      handleClick() {
        this.$refs.form.validate((valid) => {
          if (!valid) return;

          if (this.hasPassword) {
            if (this.checkPassword()) {
              this.doLogin();
            } else {
              this.$message({
                type: 'error',
                message: '密码错误',
                center: true,
              });
            }
          } else {
            this.setPassword();
            this.doLogin();
          }
        });
      },
      setPassword() {
        const key = Date.now().toString();
        const hmac = crypto.createHmac('sha512', key);
        hmac.update(this.form.password);
        localStorage.setItem('secret', hmac.digest('hex'));
        localStorage.setItem('secret-key', key);
      },
      checkPassword() {
        const pwd = localStorage.getItem('secret');
        const key = localStorage.getItem('secret-key');
        if (!pwd || !key) return false;
        const hmac = crypto.createHmac('sha512', key);
        hmac.update(this.form.password);
        return pwd === hmac.digest('hex');
      },
      doLogin() {
        this.login(this.form.password);
        this.$message({
          type: 'success',
          message: '设置密码成功',
          center: true,
        });
        this.$router.replace({
          name: 'DailyOperation',
        });
      },
    },
    computed: {
      hasPassword() {
        return !!(localStorage.getItem('secret') && localStorage.getItem('secret-key'));
      },
    },
    mounted() {
    },
  };
</script>

<style scoped lang="scss">
  .container {
    display: flex;
    width: 100vw;
    height: 100vh;
  }
  .form {
    margin: auto;
    width: 400px;
    transform: translateY(-100px);
  }
  .el-card__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      text-align: center;
    }
    .bottom {
      text-align: center;
    }
  }
</style>