<template>
  <!-- 整体容器 -->
  <view class="container">
    <!-- 顶部区域：包含logo、标题和登录方式选择 -->
    <view class="header">
      <!-- Logo图片 -->
      <u-image class="login-logo" src="/static/login.png" width="160rpx" height="160rpx"></u-image>
      <!-- 页面标题 -->
      <text class="title">用户登录</text>
      <!-- 登录方式选择区域 -->
      <u-radio-group 
        v-model="loginMethod" 
        @change="val => loginMethod = val"
        :wrap="true"
        class="login-method"
      >
        <u-radio
          name="password"
          label="密码登录"
          active-color="#007aff"
          label-size="32rpx"
          :custom-style="{ marginRight: '40rpx' }"
        ></u-radio>
        <u-radio
          name="code"
          label="验证码登录"
          active-color="#007aff"
          label-size="32rpx"
        ></u-radio>
      </u-radio-group>
    </view>

    <!-- 密码登录表单 -->
    <u-form 
      :model="form" 
      :rules="rules"
      ref="uForm" 
      v-if="loginMethod === 'password'"
      class="form-area"
    >
      <u-form-item prop="phone" :border-bottom="false">
        <u-input
          v-model="form.phone"
          placeholder="请输入手机号码"
          type="number"
          maxlength="11"
          clearable
          :custom-style="{ fontSize: '15px' }"
        >
          <template #prefix>
            <u-icon name="phone" size="20" color="#999"></u-icon>
          </template>
        </u-input>
      </u-form-item>

      <u-form-item prop="password" :border-bottom="false">
        <u-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          clearable
          :custom-style="{ fontSize: '15px' }"
        >
          <template #prefix>
            <u-icon name="lock" size="20" color="#999"></u-icon>
          </template>
          <template #suffix>
            <u-icon 
              :name="showPassword ? 'eye-fill' : 'eye-off'" 
              size="22" 
              color="#999"
              @click="toggleShowPassword"
            ></u-icon>
          </template>
        </u-input>
      </u-form-item>
    </u-form>

    <!-- 验证码登录表单 -->
    <u-form 
      :model="form" 
      :rules="rules"
      ref="uForm" 
      v-else
      class="form-area"
    >
      <u-form-item prop="phone" :border-bottom="false">
        <u-input
          v-model="form.phone"
          placeholder="请输入手机号码"
          type="number"
          maxlength="11"
          clearable
          :custom-style="{ fontSize: '15px' }"
        >
          <template #prefix>
            <u-icon name="phone" size="20" color="#999"></u-icon>
          </template>
        </u-input>
      </u-form-item>

      <u-form-item prop="code" :border-bottom="false">
        <u-input
          v-model="form.code"
          placeholder="请输入验证码"
          type="number"
          maxlength="6"
          clearable
          :custom-style="{ fontSize: '15px' }"
        >
          <template #prefix>
            <u-icon name="email" size="20" color="#999"></u-icon>
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
    </u-form>

    <!-- 记住密码和操作按钮 -->
    <view class="form-options">
      <view class="remember-password">
        <u-checkbox-group 
          v-model="rememberPassword"
          active-color="#007aff"
        >
          <u-checkbox
            name="remember"
            label="记住密码"
            label-size="28rpx"
          ></u-checkbox>
        </u-checkbox-group>
      </view>
      <text class="forgot-text" @click="forgotPassword">忘记密码？</text>
    </view>

    <u-button 
      type="primary" 
      shape="circle" 
      @click="login"
      :custom-style="{ 
        marginTop: '40rpx',
        height: '80rpx',
        fontSize: '32rpx'
      }"
    >
      立即登录
    </u-button>

    <view class="register-tip">
      <text class="register-link" @click="goToRegister">没有账号？立即注册</text>
    </view>
  </view>
</template>

<script>
import Vue from 'vue'

export default {
   data() {
     return {
       loginMethod: 'password',
       form: {
         phone: uni.getStorageSync('lastLoginPhone') || '',
         password: uni.getStorageSync('savedPassword') || '',
         code: ''
       },
       rememberPassword: uni.getStorageSync('rememberPassword') ? ['remember'] : [],
       showPassword: false,
       counting: 0,
       rules: {
         phone: [
           { 
             required: true, 
             message: '请输入手机号码',
             trigger: ['blur', 'change']
           },
           {
             pattern: /^1[3-9]\d{9}$/,
             message: '手机号格式不正确',
             trigger: ['blur','change']
           }
         ],
         password: [
           { 
             required: true, 
             message: '请输入密码',
             trigger: ['blur', 'change']
           }
         ],
         code: [
           { 
             required: true, 
             message: '请输入验证码',
             trigger: ['blur', 'change']
           }
         ]
       }
     }
   },
  methods: {
    // 切换登录方式
    toggleLoginMethod(event) {
      this.loginMethod = event.detail.value;
    },

    // 切换密码显示/隐藏
    toggleShowPassword() {
      this.showPassword = !this.showPassword;
    },

    getVerificationCode() {
      if (this.counting > 0) return;
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      if (!registeredUsers.some(u => u.phone === this.form.phone)) {
        uni.showToast({ title: '该手机号未注册', icon: 'none' });
        return;
      }
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('verificationCode', JSON.stringify({
        code: verificationCode,
        timestamp: Date.now()
      }));
      uni.showModal({
        title: '验证码',
        content: `您的验证码是：${verificationCode}`,
        showCancel: false
      });
      this.counting = 60;
      const timer = setInterval(() => {
        this.counting--;
        if (this.counting <= 0) clearInterval(timer);
      }, 1000);
    },
    async validateLogin() {
      try {
        await this.$refs.uForm.validate();
        const registeredUsers = JSON.parse(uni.getStorageSync('registeredUsers')) || [];
        const currentUser = registeredUsers.find(u => u.phone === this.form.phone);
        if (!currentUser) {
          return {
            valid: false,
            message: '手机号未注册',
            action: 'register'
          };
        }
        if (this.loginMethod === 'password') {
          if (atob(currentUser.password) !== this.form.password) {
            return {
              valid: false,
              message: '密码不正确',
              action: 'retry'
            };
          }
        } else {
          const storedCode = JSON.parse(localStorage.getItem('verificationCode'));
          if (!storedCode || storedCode.code !== this.form.code) {
            return {
              valid: false,
              message: '验证码错误',
              action: 'retry'
            };
          }
          if (Date.now() - storedCode.timestamp > 300000) {
            return {
              valid: false,
              message: '验证码已过期',
              action: 'retry'
            };
          }
        }
        return { valid: true };
      } catch (errors) {
        return {
          valid: false,
          message: errors[0].message,
          action: errors[0].field === 'phone' ? 'register' : 'retry'
        };
      }
    },
    async login() {
      try {
        // 修改验证方式为await
        const valid = await this.$refs.uForm.validate();
        if (!valid) return;

        const validationResult = await this.validateLogin();
        if (!validationResult.valid) {
          uni.showToast({ title: validationResult.message, icon: 'none' });
          if (validationResult.action === 'register') {
            this.goToRegister();
          }
          return;
        }

        if (this.rememberPassword.includes('remember')) {
          uni.setStorageSync('lastLoginPhone', this.form.phone);
          uni.setStorageSync('savedPassword', this.form.password);
          uni.setStorageSync('rememberPassword', true);
        } else {
          uni.removeStorageSync('lastLoginPhone');
          uni.removeStorageSync('savedPassword');
          uni.removeStorageSync('rememberPassword');
        }
        uni.reLaunch({
          url: '/pages/reservation/reservation' // 替换为实际的主页路由
        });
      } catch (error) {
        // 统一错误处理
        console.error('登录失败:', error);
        uni.showToast({ 
          title: error.message || '登录失败，请检查输入', 
          icon: 'none' 
        });
      }
    },
    // 跳转到忘记密码页面
    forgotPassword() {
      uni.navigateTo({
        url: '/pages/login/forget' // 修改为正确的路由路径
      });
    },
    // 跳转到注册页面
    goToRegister() {
      uni.navigateTo({
        url: '/pages/login/register' // 修改为正确的路由路径
      });
    }
  },
  onShow() {
    this.form.phone = uni.getStorageSync('lastLoginPhone') || '';
    this.form.password = uni.getStorageSync('savedPassword') || '';
    // 修改存储值的转换方式
    this.rememberPassword = uni.getStorageSync('rememberPassword') ? ['remember'] : [];
  }
}
</script>

<style lang="scss">
/* 容器样式 */
.container {
  min-height: 100vh;
  padding: 40rpx;
  background: linear-gradient(to bottom, #f6f7f9, #ffffff); /* 渐变背景 */
}

/* 顶部区域样式 */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

/* Logo样式 */
.login-logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}

/* 标题样式 */
.title {
  font-size: 48rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 40rpx;
}

/* 登录方式选择区域样式 */
.login-method {
  margin-bottom: 10rpx;
}

/* 单选按钮标签样式 */
.radio-label {
  margin: 0 20rpx;
  font-size: 32rpx;
  color: #666;
}

/* 表单区域样式 - 移除背景和阴影 */
.form-area {
  padding: 20px 0;  /* 只保留上下内边距 */
  background: transparent;  /* 移除白色背景 */
  box-shadow: none;  /* 移除阴影 */
  border-radius: 2;  /* 移除圆角 */
}

/* 表单项样式 */
.form-item {
  position: relative;
  margin-bottom: 10px;
  padding: 12px 0;
  height: 48px; /* 增加高度 */
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}

/* 图标样式 */
.iconfont {
  font-size: 20px;
  color: #999;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

/* 输入框样式 */
input {
  flex: 1;
  height: 44px; /* 增加高度 */
  font-size: 15px;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  padding: 0 10px; /* 增加内边距 */
}

/* 密码显示/隐藏图标样式 */
.eye-icon {
  position: absolute;
  right: 20px; /* 调整位置 */
  color: #999;
  padding: 4px;
  font-size: 30px;
}

/* 记住密码和忘记密码选项样式 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

/* 记住密码标签样式 */
.remember-label {
  font-size: 35rpx;
  color: #666;
  display: flex;
  align-items: center;
}

/* 忘记密码文本样式 */
.forgot-text {
  font-size: 35rpx;
  color: #007aff;
  padding: 10rpx;
}

/* 验证码按钮样式 */
.code-button {
  position: absolute;
  right: 0;
  height: 32px;
  padding: 0 16px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  transition: all 0.3s ease;
}

/* 禁用状态的验证码按钮样式 */
.code-button[disabled] {
  background: #e0e0e0;
  color: #999;
}

/* 底部按钮组样式 */
.button-group {
  margin-top: 5rpx;
}

/* 登录和注册按钮通用样式 */
.login-button,
.register-button {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  margin-bottom: 30rpx;
  border: none;
}

/* 登录按钮样式 */
.login-button {
  background: linear-gradient(to right, #007aff, #0056b3);
  color: white;
}

/* 注册按钮样式 */
.register-button {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

/* 按钮点击效果 */
.button-hover {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 过渡动画效果 */
.form-item,
.button-group button {
  transition: all 0.3s ease;
}

/* 输入框焦点效果 */
.form-item:focus-within {
  border-bottom-color: #007aff;
}

.register-tip {
  text-align: right; /* 文本右对齐 */
  margin-top: 40rpx;
  padding-right: 30rpx;
}

.register-link {
  color: #007aff;
  font-size: 28rpx;
  margin-left: 10rpx; /* 调整间距 */
}
</style>