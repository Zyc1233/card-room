<template>
  <view class="setting-container" :class="{ 'night-mode': nightMode }">
    <u-form class="custom-form">
      <!-- 主题模式 -->
      <u-form-item label="主题模式" label-width="160rpx" borderBottom>
        <u-radio-group v-model="themeMode" @change="handleThemeChange">
          <u-radio 
            v-for="item in themeOptions"
            :key="item.value"
            :label="item.label"
            :name="item.value"
          ></u-radio>
        </u-radio-group>
      </u-form-item>

      <!-- 主题颜色 -->
      <u-form-item label="主题颜色" label-width="160rpx" borderBottom>
        <u-radio-group v-model="primaryColor" @change="applySettings">
          <u-radio
            v-for="color in colorOptions"
            :key="color.value"
            :name="color.value"
          >
            <template #icon>
              <view 
                class="color-preview"
                :style="{ backgroundColor: color.value }"
              ></view>
            </template>
            <text class="color-label">{{ color.label }}</text>
          </u-radio>
        </u-radio-group>
      </u-form-item>

      <!-- 字体设置 -->
      <u-form-item label="字体样式" label-width="160rpx" borderBottom>
        <u-input
          v-model="fontLabel"
          placeholder="请选择字体"
          disabled
          @click="showFontPicker = true"
        />
        <u-picker
          :show="showFontPicker"
          :columns="[fontOptions]"
          keyName="label"
          @confirm="handleFontConfirm"
          @cancel="showFontPicker = false"
        />
      </u-form-item>

      <!-- 字号设置 -->
      <u-form-item label="字体大小" label-width="160rpx" borderBottom>
        <u-number-box 
          v-model="fontSize"
          :min="12"
          :max="24"
          :step="2"
          integer
          @change="applySettings"
        />
      </u-form-item>

      <!-- 夜间模式 -->
      <u-form-item label="夜间模式" label-width="160rpx" borderBottom>
        <u-switch
          v-model="nightMode"
          activeColor="#2b85e4"
          @change="handleNightModeChange"
        ></u-switch>
      </u-form-item>

      <!-- 自动夜间模式 -->
      <u-form-item label="自动夜间模式" label-width="160rpx" borderBottom>
        <u-switch
          v-model="autoNightMode"
          activeColor="#2b85e4"
          @change="checkNightMode"
        ></u-switch>
      </u-form-item>

      <!-- 操作按钮 -->
      <u-button
        type="primary"
        shape="circle"
        customStyle="margin-top: 60rpx"
        @click="saveSettings"
      >保存设置</u-button>
      
      <u-button
        type="error"
        shape="circle"
        customStyle="margin-top: 30rpx"
        @click="resetSettings"
      >恢复默认</u-button>
    </u-form>
  </view>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export default {
  setup() {
    // 响应式状态
    const themeMode = ref('light');
    const fontFamily = ref('');
    const fontSize = ref(14);
    const nightMode = ref(false);
    const showFontPicker = ref(false);
    const primaryColor = ref('#2b85e4');
    const autoNightMode = ref(false);

    // 新增系统主题监听
    const systemThemeQuery = uni.getSystemTheme ? uni.getSystemTheme() : null;
    const systemTheme = ref('light');

    // 优化配置选项
    const themeOptions = [
      { label: '浅色模式', value: 'light', icon: 'sun' },
      { label: '深色模式', value: 'dark', icon: 'moon' },
      { label: '自动模式', value: 'auto', icon: 'auto' }
    ];

    const fontOptions = [
      { label: '系统默认', value: '' },
      { label: '思源黑体', value: 'Source Han Sans' },
      { label: '阿里巴巴普惠体', value: 'Alibaba PuHuiTi' },
      { label: '手写体', value: 'Zhi Mang Xing' }
    ];

    const colorOptions = [
      { label: '科技蓝', value: '#2b85e4' },
      { label: '活力橙', value: '#ff7900' },
      { label: '清新绿', value: '#19be6b' },
      { label: '浪漫紫', value: '#8a6de9' }
    ];

    // 计算属性
    const fontLabel = computed(() => {
      return fontOptions.find(item => item.value === fontFamily.value)?.label || '请选择字体';
    });

    // 新增主题相关变量
    const isAutoTheme = computed(() => themeMode.value === 'auto');
    const actualTheme = computed(() => {
      return isAutoTheme.value ? systemTheme.value : themeMode.value;
    });

    // 优化字体加载逻辑
    const fontLoading = ref(false);
    const fontLoadError = ref(null);

    // 应用设置
    const applySettings = () => {
      // 应用主题色
      applyColorTheme();
      
      // 应用字体
      if (fontFamily.value) {
        uni.loadFontFace({
          family: fontFamily.value,
          source: `url("/static/fonts/${fontFamily.value}.ttf")`,
          success: () => console.log('字体加载成功'),
          fail: (err) => console.error('字体加载失败:', err)
        });
      }

      // 应用字号
      document.documentElement.style.fontSize = `${fontSize.value}px`;

      // 应用夜间模式
      applyTheme();
    };

    // 完善主题应用逻辑
    const applyTheme = () => {
      const theme = actualTheme.value;
      document.documentElement.classList.toggle('dark-theme', theme === 'dark');
      document.documentElement.style.colorScheme = theme;
    };

    // 增强颜色处理
    const applyColorTheme = () => {
      const root = document.documentElement.style;
      root.setProperty('--primary-color', primaryColor.value);
      root.setProperty('--primary-hover', adjustColor(primaryColor.value, 20));
      root.setProperty('--primary-active', adjustColor(primaryColor.value, -20));
    };

    // 优化自动夜间模式检测
    const checkNightMode = () => {
      if (autoNightMode.value) {
        const isNight = checkIsNightTime();
        const shouldNightMode = isNight || (isAutoTheme.value && systemTheme.value === 'dark');
        
        if (nightMode.value !== shouldNightMode) {
          nightMode.value = shouldNightMode;
          applySettings();
        }
      }
    };

    // 新增工具函数
    const adjustColor = (hex, percent) => {
      // 实现颜色调整逻辑
    };

    const checkIsNightTime = () => {
      const hours = new Date().getHours();
      return hours > 18 || hours < 6;
    };

    // 加载保存的设置
    const loadSettings = () => {
      try {
        const settings = uni.getStorageSync('appSettings') || {};
        themeMode.value = settings.theme || 'light';
        fontFamily.value = settings.font || '';
        fontSize.value = settings.size || 14;
        nightMode.value = settings.nightMode || false;
        primaryColor.value = settings.primaryColor || '#2b85e4';
        autoNightMode.value = settings.autoNightMode || false;
        applySettings();
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };

    // 保存设置
    const saveSettings = async () => {
      try {
        const settings = {
          theme: themeMode.value,
          font: fontFamily.value,
          size: fontSize.value,
          nightMode: nightMode.value,
          primaryColor: primaryColor.value,
          autoNightMode: autoNightMode.value
        };

        await uni.setStorage({ key: 'appSettings', data: settings });
        uni.$u.toast('设置保存成功');
      } catch (error) {
        uni.$u.toast('保存失败，请重试');
        console.error('保存失败:', error);
      }
    };

    // 恢复默认设置
    const resetSettings = () => {
      themeMode.value = 'light';
      fontFamily.value = '';
      fontSize.value = 14;
      nightMode.value = false;
      primaryColor.value = '#2b85e4';
      autoNightMode.value = false;
      applySettings();
      uni.$u.toast('已恢复默认设置');
    };

    // 生命周期钩子
    onMounted(() => {
      loadSettings();
      const timer = setInterval(checkNightMode, 300000); // 5分钟检测一次
      
      if (systemThemeQuery) {
        systemThemeQuery.onChange(res => {
          systemTheme.value = res.theme;
          if (isAutoTheme.value) applyTheme();
        });
      }

      onBeforeUnmount(() => {
        clearInterval(timer);
        systemThemeQuery?.offChange();
      });
    });

    return {
      // 状态
      themeMode,
      fontFamily,
      fontSize,
      nightMode,
      showFontPicker,
      primaryColor,
      autoNightMode,
      
      // 配置选项
      themeOptions,
      fontOptions,
      colorOptions,
      
      // 计算属性
      fontLabel,
      actualTheme,
      fontLoading,
      fontLoadError,
      
      // 方法
      handleThemeChange: applySettings,
      handleFontConfirm: (e) => {
        fontFamily.value = e.value[0].value;
        showFontPicker.value = false;
        applySettings();
      },
      handleNightModeChange: applySettings,
      checkNightMode,
      saveSettings,
      resetSettings
    };
  }
};
</script>

<style lang="scss" scoped>
.setting-container {
  padding: 30rpx;
  min-height: 100vh;
  background-color: #f8f8f8;
  transition: background-color 0.3s ease;

  &.night-mode {
    background-color: #1a1a1a;
    color: #ffffff;

    .custom-form {
      background-color: #2a2a2a;
    }

    .u-form-item__body__right__content {
      color: rgba(255,255,255,0.9);
    }
    
    .color-preview {
      border-color: #444;
    }
  }

  &:not(.night-mode) {
    .color-preview {
      border-color: #ddd;
    }
  }
}

.custom-form {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 0 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
  transition: background-color 0.3s ease;
}

.color-preview {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 2rpx solid #eee;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(1.1);
  }
}

.color-label {
  margin-left: 10rpx;
  font-size: 28rpx;
}

::v-deep {
  .u-form-item__body {
    padding: 28rpx 0;
  }

  .u-radio__text {
    display: flex;
    align-items: center;
  }

  .u-input--disabled {
    color: #606266 !important;
  }
}

// 新增过渡动画
.u-radio-group,
.u-form-item__body {
  transition: all 0.3s ease;
}

// 新增错误提示
.font-error {
  color: #e54d42;
  font-size: 24rpx;
  margin-top: 10rpx;
}
</style>