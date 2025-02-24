<template>
  <view class="container">
    <van-form class="form-area" ref="uForm">
      <van-field v-model="phone" name="phone" placeholder="请输入手机号码" type="tel" maxlength="11" clearable
        :rules="[{ required: true, message: '请输入手机号码' }]">
        <template #left-icon>
          <van-icon name="phone-o" size="20" color="#999" />
        </template>
      </van-field>

      <van-field v-model="newPassword" name="newPassword" :type="showPassword ? 'text' : 'password'"
        placeholder="请输入新密码" clearable :rules="[{ required: true, message: '请输入新密码' }]">
        <template #left-icon>
          <van-icon name="lock" size="20" color="#999" />
        </template>
        <template #right-icon>
          <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" @click="toggleShowPassword" color="#999" />
        </template>
      </van-field>

      <van-field v-model="verificationCode" name="verificationCode" placeholder="请输入验证码" type="digit" maxlength="6"
        clearable :rules="[{ required: true, message: '请输入验证码' }]">
        <template #left-icon>
          <van-icon name="comment-o" size="20" color="#999" />
        </template>
        <template #button>
          <van-button size="small" :disabled="counting > 0" @click="getVerificationCode" custom-style="
              width: 120px;
              background: #{counting > 0 ? 'var(--button-bg)' : 'var(--primary-color)'};
              color: #{counting > 0 ? 'var(--text-secondary)' : 'var(--text-inverse)'};
              border: none;
            ">
            {{ counting > 0 ? `${counting}s` : '获取验证码' }}
          </van-button>
        </template>
      </van-field>

      <van-button type="primary" block round @click="resetPassword" custom-style="margin-top: 40px" class="action-btn">
        重置密码
      </van-button>
    </van-form>
  </view>
</template>

<script>
export default {  
  data() {
    return {
      phone: '',
      verificationCode: '',
      newPassword: '',
      showPassword: false,
      counting: 0,
      phoneLabel: '手机号码',
      passwordLabel: '新密码',
      codeLabel: '验证码'
    }
  },
  methods: {
    // 切换密码显示/隐藏
    toggleShowPassword() {
      this.showPassword = !this.showPassword
    },
    // 获取验证码逻辑
    getVerificationCode() {
      if (this.counting > 0) return;
      const registeredUsers = JSON.parse(uni.getStorageSync('registeredUsers') || '[]');
      if (!registeredUsers.some(u => u.phone === this.phone)) {
        uni.showToast({ title: '该手机号未注册', icon: 'none' });
        return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      uni.setStorageSync('verificationCode', JSON.stringify({
        code: code,
        timestamp: Date.now()
      }));
      uni.showModal({
        title: '验证码',
        content: `您的验证码是：${code}`,
        showCancel: false,
        confirmText: '确定',
        success: () => {
          this.counting = 60;
          const timer = setInterval(() => {
            this.counting--;
            if (this.counting <= 0) {
              clearInterval(timer);
            }
          }, 1000);
        }
      });
    },
    resetPassword() {
      console.log('开始重置密码验证'); // 添加日志输出
      const storedCode = JSON.parse(uni.getStorageSync('verificationCode'));
      if (!storedCode || storedCode.code !== this.verificationCode) {
        console.warn('验证码错误'); // 添加日志输出
        uni.showToast({ title: '验证码错误', icon: 'none' });
        return;
      }
      if (Date.now() - storedCode.timestamp > 300000) {
        console.warn('验证码已过期'); // 添加日志输出
        uni.showToast({ title: '验证码已过期', icon: 'none' });
        return;
      }
      let registeredUsers = JSON.parse(uni.getStorageSync('registeredUsers') || '[]');
      const targetUserIndex = registeredUsers.findIndex(user => user.phone === this.phone);
      if (targetUserIndex !== -1) {
        registeredUsers[targetUserIndex].password = btoa(this.newPassword);
        uni.setStorageSync('registeredUsers', JSON.stringify(registeredUsers));
        console.log('密码重置成功，跳转到登录页面'); // 添加日志输出

        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
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
    padding: 16px 0;
    margin-bottom: 24px;
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .van-field__left-icon {
    margin-right: 8px;
  }
}

.action-btn {
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