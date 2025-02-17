<template>
  <view class="container">
    <u-form class="form-area">
      <u-form-item prop="phone">
        <u-input 
          v-model="phone" 
          type="number" 
          placeholder="请输入手机号码"
          maxlength="11"
          border="none"
          clearable
          :custom-style="{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }"
        >
          <template #prefix>
            <u-icon name="phone-fill" size="20" color="#999"></u-icon>
          </template>
        </u-input>
      </u-form-item>

      <u-form-item prop="newPassword">
        <u-input
          v-model="newPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入新密码"
          border="none"
          clearable
          :custom-style="{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }"
        >
          <template #prefix>
            <u-icon name="lock-fill" size="20" color="#999"></u-icon>
          </template>
          <template #suffix>
            <u-icon 
              :name="showPassword ? 'eye-fill' : 'eye-off'" 
              @click="toggleShowPassword"
              color="#999"
            />
          </template>
        </u-input>
      </u-form-item>

      <u-form-item prop="verificationCode">
        <u-input
          v-model="verificationCode"
          type="number"
          placeholder="请输入验证码"
          maxlength="6"
          border="none"
          clearable
          :custom-style="{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }"
        >
          <template #prefix>
            <u-icon name="coupon-fill" size="20" color="#999"></u-icon>
          </template>
          <template #suffix>
            <u-button 
              @click="getVerificationCode" 
              :disabled="counting > 0"
              size="mini"
              :custom-style="{ 
                width: '120px',
                marginLeft: '10px',
                backgroundColor: counting > 0 ? '#e0e0e0' : '#999',
                color: counting > 0 ? '#999' : 'white',
                borderRadius: '8px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center'
              }"
            >
              <u-icon 
                name="chat-fill" 
                size="20" 
                color="white" 
                style="margin-right: 4px;"
              />
              {{ counting > 0 ? `${counting}s` : '获取验证码' }}
            </u-button>
          </template>
        </u-input>
      </u-form-item>

      <u-button 
        @click="resetPassword" 
        type="primary" 
        shape="circle" 
        :custom-style="{ 
          marginTop: '40px',
          height: '50px',
          fontSize: '18px',
          borderRadius: '25px'
        }"
      >
        重置密码
      </u-button>
    </u-form>
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
      const registeredUsers = JSON.parse(uni.getStorageSync('registeredUsers')) || [];
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
      const storedCode = JSON.parse(uni.getStorageSync('verificationCode'));
      if (!storedCode || storedCode.code !== this.verificationCode) {
        uni.showToast({ title: '验证码错误', icon: 'none' });
        return;
      }
      if (Date.now() - storedCode.timestamp > 300000) {
        uni.showToast({ title: '验证码已过期', icon: 'none' });
        return;
      }
      let registeredUsers = JSON.parse(uni.getStorageSync('registeredUsers')) || [];
      const targetUserIndex = registeredUsers.findIndex(user => user.phone === this.phone);
      if (targetUserIndex !== -1) {
        registeredUsers[targetUserIndex].password = btoa(this.newPassword);
        uni.setStorageSync('registeredUsers', JSON.stringify(registeredUsers));
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
  background-color: #f7f8fa;
  min-height: 100vh;
}

.form-area {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
</style>