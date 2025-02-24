<template>
  <view class="container">
    <van-form class="form-area" ref="uForm">
      <van-field v-model="form.phone" name="phone" placeholder="请输入手机号码" type="tel" maxlength="11" clearable>
        <template #left-icon>
          <van-icon name="phone-o" size="20" color="#999" />
        </template>
      </van-field>

      <van-field v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" clearable>
        <template #left-icon>
          <van-icon name="lock" size="20" color="#999" />
        </template>
        <template #right-icon>
          <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowPassword" color="#909399" />
        </template>
      </van-field>

      <van-field v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="请确认密码"
        clearable>
        <template #left-icon>
          <van-icon name="lock" size="20" color="#999" />
        </template>
        <template #right-icon>
          <van-icon :name="showConfirmPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowConfirmPassword"
            color="#909399" />
        </template>
      </van-field>

      <van-button type="primary" block round @click="register" custom-style="margin-top: 40px" class="register-btn">
        注册
      </van-button>
    </van-form>
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
      console.log('开始注册验证');
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.form.phone)) {
        console.warn('手机号格式不正确');
        uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        console.warn('两次输入的密码不一致');
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
        return;
      }

      let registeredUsers = JSON.parse(uni.getStorageSync('registeredUsers') || '[]');

      if (registeredUsers?.some(user => user.phone === this.form.phone)) {
        console.warn('该手机号已注册');
        uni.showToast({ title: '该手机号已注册', icon: 'none' });
        return;
      }

      const encryptedUser = {
        phone: this.form.phone,
        password: btoa(this.form.password)
      };
      registeredUsers.push(encryptedUser);

      uni.setStorageSync('registeredUsers', JSON.stringify(registeredUsers));
      console.log('注册成功，跳转到登录页面');

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
  background: var(--background);
}

.form-area {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);

  .van-cell {
    padding: 10px 0;
    margin-bottom: 20px;
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .van-field__left-icon {
    margin-right: 8px;
  }
}

.register-btn {
  background: var(--primary-color);
  color: var(--text-inverse);
  
  &:active {
    filter: brightness(0.9);
  }
}

.protocol-text {
  color: var(--text-secondary);
  
  a {
    color: var(--primary-color);
    text-decoration: underline;
  }
}

.van-field {
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &--disabled {
    opacity: 0.7;
    background: var(--button-bg);
  }
  
  &__right-icon {
    color: var(--text-secondary);
  }
}

.error-message {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  transition: all 0.3s ease;
}
</style>