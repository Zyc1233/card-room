<template>
  <view class="container">
    <!-- 长辈模式开关 -->
    <u-cell-group>
      <u-cell
        title="长辈模式"
        :isLink="false"
      >
        <template #right-icon>
          <u-switch 
            v-model="elderMode"
            active-color="#409EFF"
            @change="handleElderModeChange"
          ></u-switch>
        </template>
      </u-cell>
    </u-cell-group>

    <!-- 设置项列表（添加长辈模式样式绑定） -->
    <u-cell-group :class="{'elder-mode': elderMode}">
      <!-- 夜间模式切换（添加图标） -->
      <u-cell
        title="夜间模式"
        :isLink="false"
        :title-style="titleStyle"
      >
        <template #icon>
          <u-icon name="star" :size="iconSize"></u-icon>
        </template>
        <template #right-icon>
          <u-switch v-model="nightMode"></u-switch>
        </template>
      </u-cell>

      <!-- 消息通知设置（添加图标） -->
      <u-cell
        title="消息通知"
        :isLink="false"
        :title-style="titleStyle"
      >
        <template #icon>
          <u-icon name="bell" :size="iconSize"></u-icon>
        </template>
        <template #right-icon>
          <u-switch v-model="notify"></u-switch>
        </template>
      </u-cell>

      <!-- 账户安全（添加图标） -->
      <u-cell
        title="账户安全"
        isLink
        @click="handleSecurity"
        :title-style="titleStyle"
      >
        <template #icon>
          <u-icon name="lock" :size="iconSize"></u-icon>
        </template>
      </u-cell>

      <!-- 清除缓存（添加图标） -->
      <u-cell
        title="清除缓存"
        :value="cacheSize"
        isLink
        @click="handleClearCache"
        :title-style="titleStyle"
      >
        <template #icon>
          <u-icon name="trash" :size="iconSize"></u-icon>
        </template>
      </u-cell>

      <!-- 关于我们（添加图标） -->
      <u-cell
        title="关于我们"
        isLink
        @click="handleAbout"
        :title-style="titleStyle"
      >
        <template #icon>
          <u-icon name="info" :size="iconSize"></u-icon>
        </template>
      </u-cell>

      <!-- 版本信息（添加图标） -->
      <u-cell
        title="版本信息"
        value="v1.0.0"
        :isLink="false"
        :title-style="titleStyle"
      >
        <template #icon>
          <u-icon name="tags" :size="iconSize"></u-icon>
        </template>
      </u-cell>
    </u-cell-group>

    <!-- 退出登录按钮（添加长辈模式样式） -->
    <u-button
      :class="{'elder-btn': elderMode}"
      type="error"
      shape="circle"
      class="logout-btn"
      @click="logout"
    >退出登录</u-button>

    <!-- 在原有模板中添加toast组件 -->
    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
export default {
  data() {
    return {
      elderMode: false,
      nightMode: false,
      notify: true,
      cacheSize: '256MB', // 实际开发中需要动态计算
      theme: {
        day: {
          bgColor: '#f5f5f5',
          textColor: '#333',
          cardBg: '#ffffff'
        },
        night: {
          bgColor: '#2d2d2d',
          textColor: '#e6e6e6',
          cardBg: '#3a3a3a',
          elderCardBg: '#2e2e2e' // 手动加深后的颜色
        }
      }
    };
  },
  computed: {
    titleStyle() {
      return this.elderMode ? { fontSize: '36rpx' } : {};
    },
    iconSize() {
      return this.elderMode ? 40 : 32;
    },
    containerStyle() {
      return {
        backgroundColor: this.nightMode ? this.theme.night.bgColor : this.theme.day.bgColor,
        color: this.nightMode ? this.theme.night.textColor : this.theme.day.textColor
      };
    },
    cellGroupStyle() {
      return {
        backgroundColor: this.nightMode ? this.theme.night.cardBg : this.theme.day.cardBg
      };
    }
  },
  methods: {
    handleElderModeChange(val) {
      uni.showToast({
        title: val ? '已开启长辈模式' : '已关闭长辈模式',
        icon: 'none'
      });
      // 实际开发中可以持久化存储这个设置
    },
    handleSecurity() {
      // 跳转账户安全页面
    },
    handleClearCache() {
      // 清除缓存逻辑
    },
    handleAbout() {
      // 跳转关于我们页面
      uni.navigateTo({
        url: '/pages/help/help'
      });
    },
    async logout() {
      const { confirm } = await this.showConfirmModal('确认退出', '确定要退出登录吗？');
      if (!confirm) return;

      try {
        uni.navigateTo({
          url: '/pages/login/login'
        });
        this.showFeedback('已退出登录');
      } catch (error) {
        this.showFeedback('退出登录失败', 'error');
        console.error('路由跳转错误:', error);
      }
    },
    async showConfirmModal(title, content) {
      try {
        const res = await uni.showModal({
          title,
          content,
          showCancel: true
        });
        return { confirm: res.confirm };
      } catch (error) {
        console.error('弹窗错误:', error);
        return { confirm: false };
      }
    },
    showFeedback(message, type = 'success') {
      if (this.$refs.uToast) {
        this.$refs.uToast.show({
          type,
          message,
          icon: type === 'success' ? 'checkmark-circle' : 'close-circle'
        });
      } else {
        uni.showToast({
          title: message,
          icon: 'none'
        });
      }
    },
    handleNightModeChange(val) {
      uni.setStorageSync('nightMode', val);
      this.applyNightMode(val);
      uni.showToast({
        title: val ? '已开启夜间模式' : '已关闭夜间模式',
        icon: 'none'
      });
    },
    applyNightMode(isNight) {
      // 修改uView主题变量
      if (isNight) {
        uni.$u.config({
          theme: {
            'color-primary': '#7d7d7d',
            'color-secondary': '#5a5a5a',
            'text-color': '#e6e6e6',
            'border-color': '#4a4a4a'
          }
        });
      } else {
        uni.$u.config({
          theme: uni.$u.configDefault.theme
        });
      }
    }
  },
  mounted() {
    const savedMode = uni.getStorageSync('nightMode');
    if (savedMode) {
      this.nightMode = savedMode;
      this.applyNightMode(savedMode);
    }
  }
};
</script>

<style lang="scss" scoped>
.elder-mode {
  .u-cell-title {
    font-size: 36rpx !important;
  }
  .u-cell-value {
    font-size: 32rpx !important;
  }
  .u-icon {
    margin-right: 30rpx !important;
  }
}

.elder-btn {
  font-size: 40rpx !important;
  height: 100rpx !important;
  letter-spacing: 4rpx;
}

// 添加长辈模式背景色
.container.elder-mode {
  background-color: #FFF8ED;
  .u-cell-group {
    background-color: #ffffff;
    border-radius: 20rpx;
    margin: 30rpx;
    .u-cell {
      padding: 35rpx 30rpx !important;
    }
  }
}

.container {
  background-color: v-bind('theme.day.bgColor');
  &[class*="night"] {
    background-color: v-bind('theme.night.bgColor');
    
    .u-cell-group {
      background-color: v-bind('theme.night.cardBg');
      color: v-bind('theme.night.textColor');
    }
    
    .elder-mode .u-cell-group {
      background-color: v-bind('theme.night.cardBg');
      opacity: 0.9;
    }
  }
  min-height: 100vh;
  padding: 20rpx;

  .logout-btn {
    margin: 40rpx auto;
    width: 80%;
  }
}

// 夜间模式文字颜色覆盖
.night-mode {
  .u-cell-title, .u-cell-value {
    color: #e6e6e6 !important;
  }
  
  .u-cell__right-icon__text {
    color: #a0a0a0 !important;
  }
}
</style>
