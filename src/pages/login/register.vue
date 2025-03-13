<template>
  <view class="container">
    <u-form class="form-area" :model="form" ref="uForm">
      <u-form-item prop="phone" borderBottom>
        <u-input
          v-model="form.phone"
          placeholder="请输入手机号码"
          type="number"
          maxlength="11"
          border="none"
        >
          <template #prefix>
            <u-icon name="phone-fill" size="20" color="#999"></u-icon>
          </template>
        </u-input>
      </u-form-item>

      <u-form-item prop="password" borderBottom>
        <u-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          border="none"
        >
          <template #prefix>
            <u-icon name="lock-fill" size="20" color="#999"></u-icon>
          </template>
          <template #suffix>
            <u-icon 
              :name="showPassword ? 'eye-fill' : 'eye-off'" 
              @click="toggleShowPassword"
              color="#909399"
            />
          </template>
        </u-input>
      </u-form-item>

      <u-form-item prop="confirmPassword" borderBottom>
        <u-input
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请确认密码"
          border="none"
        >
          <template #prefix>
            <u-icon name="lock-fill" size="20" color="#999"></u-icon>
          </template>
          <template #suffix>
            <u-icon 
              :name="showConfirmPassword ? 'eye-fill' : 'eye-off'" 
              @click="toggleShowConfirmPassword"
              color="#909399"
            />
          </template>
        </u-input>
      </u-form-item>

      <u-button 
        type="primary" 
        shape="circle" 
        @click="register"
        customStyle="margin-top: 40px"
      >
        注册
      </u-button>
    </u-form>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        phone: '',
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      showConfirmPassword: false
    }
  },
  methods: {
    // 切换密码显示/隐藏
    toggleShowPassword() {
      this.showPassword = !this.showPassword
    },
    // 切换确认密码显示/隐藏
    toggleShowConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    // 注册逻辑
    register() {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.form.phone)) {
        uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
        return;
      }
      let registeredUsers = uni.getStorageSync('registeredUsers') || [];
      if (registeredUsers.some(user => user.phone === this.form.phone)) {
        uni.showToast({ title: '该手机号已注册', icon: 'none' });
        return;
      }
      const encryptedUser = {
        phone: this.form.phone,
        password: btoa(this.form.password)
      };
      registeredUsers.push(encryptedUser);
      uni.setStorageSync('registeredUsers', JSON.stringify(registeredUsers));
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }
  }
}
</script>

<style lang="scss">
.container {
  padding: 20px;
  background-color: #f7f8fa;
}

.form-area {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  
  .u-form-item {
    padding: 0 !important;
    background: #f5f7fa !important;
    border-radius: 8px !important;
    margin-bottom: 20px !important;
    height: 48px;
  }
}
</style>