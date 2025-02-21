<template>
  <div class="setting-container" :class="{ 'night-mode': nightMode }">
    <van-cell-group class="custom-form">
      <!-- 主题模式 -->
      <van-cell title="主题模式" class="form-item">
        <van-radio-group v-model="themeMode" @change="handleThemeChange" direction="vertical">
          <van-radio v-for="item in themeOptions" :key="item.value" :name="item.value" icon-size="16px">
            {{ item.label }}
            <template #icon="props">
              <van-icon :name="props.checked ? item.activeIcon : item.icon" :color="nightMode ? '#fff' : '#2b85e4'" />
            </template>
          </van-radio>
        </van-radio-group>
      </van-cell>

      <!-- 主题颜色 -->
      <van-cell title="主题颜色" class="form-item">
        <van-radio-group v-model="primaryColor" @change="applySettings">
          <div class="color-options">
            <van-radio v-for="color in colorOptions" :key="color.value" :name="color.value" class="color-option">
              <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
              <span class="color-label">{{ color.label }}</span>
            </van-radio>
          </div>
        </van-radio-group>
      </van-cell>

      <!-- 字体设置 -->
      <van-cell title="字体样式" :value="fontLabel" is-link @click="showFontPicker = true" class="form-item" />
      <van-popup v-model="showFontPicker" position="bottom" round>
        <van-picker :columns="fontOptions" @confirm="handleFontConfirm" @cancel="showFontPicker = false" show-toolbar
          value-key="label" />
      </van-popup>

      <!-- 字号设置 -->
      <van-cell title="字体大小" class="form-item">
        <van-stepper v-model="fontSize" :min="12" :max="24" :step="2" integer @change="applySettings" />
      </van-cell>

      <!-- 夜间模式 -->
      <van-cell title="夜间模式" class="form-item">
        <van-switch v-model="nightMode" active-color="#2b85e4" @change="handleNightModeChange" size="20px" />
      </van-cell>

      <!-- 自动夜间模式 -->
      <van-cell title="自动夜间模式" class="form-item">
        <van-switch v-model="autoNightMode" active-color="#2b85e4" @change="checkNightMode" size="20px" />
      </van-cell>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button type="primary" block round @click="saveSettings" class="submit-btn">保存设置</van-button>
        <van-button type="danger" block round @click="resetSettings" class="reset-btn">恢复默认</van-button>
      </div>
    </van-cell-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 主题相关数据
      nightMode: false,
      themeMode: 'light',
      themeOptions: [
        { label: '浅色模式', value: 'light', icon: 'circle', activeIcon: 'checked' },
        { label: '深色模式', value: 'dark', icon: 'circle', activeIcon: 'checked' }
      ],

      // 颜色相关数据
      primaryColor: '#2b85e4',
      colorOptions: [
        { label: '经典蓝', value: '#2b85e4' },
        { label: '活力橙', value: '#ff976a' },
        { label: '草木绿', value: '#07c160' }
      ],

      // 字体相关数据
      fontLabel: '系统默认',
      showFontPicker: false,
      fontOptions: [
        { label: '系统默认', value: 'default' },
        { label: '思源黑体', value: 'NotoSans' },
        { label: '阿里巴巴普惠体', value: 'Alibaba' }
      ],
      fontSize: 16,

      // 夜间模式相关
      autoNightMode: false
    };
  },
  methods: {
    handleThemeChange(value) {
      this.nightMode = value === 'dark';
      this.applySettings();
    },

    applySettings() {
      // 应用样式设置的逻辑
      document.documentElement.style.setProperty('--primary-color', this.primaryColor);
      document.documentElement.style.fontSize = `${this.fontSize}px`;
    },

    handleFontConfirm(font) {
      this.fontLabel = font.label;
      this.showFontPicker = false;
      this.applySettings();
    },

    handleNightModeChange(value) {
      this.nightMode = value;
      this.autoNightMode = false;
    },

    checkNightMode() {
      if (this.autoNightMode) {
        // 自动夜间模式逻辑
        const hour = new Date().getHours();
        this.nightMode = hour >= 18 || hour <= 6;
      }
    },

    saveSettings() {
      // 保存设置到本地存储
      localStorage.setItem('userSettings', JSON.stringify({
        theme: this.themeMode,
        color: this.primaryColor,
        font: this.fontLabel,
        fontSize: this.fontSize,
        nightMode: this.nightMode,
        autoNight: this.autoNightMode
      }));
    },

    resetSettings() {
      // 重置为默认设置
      this.themeMode = 'light';
      this.primaryColor = '#2b85e4';
      this.fontLabel = '系统默认';
      this.fontSize = 16;
      this.nightMode = false;
      this.autoNightMode = false;
      this.applySettings();
    }
  },
  mounted() {
    // 加载保存的设置
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      Object.keys(settings).forEach(key => {
        this[key] = settings[key];
      });
      this.applySettings();
    }
  }
};
</script>

<style lang="scss" scoped>
.setting-container {
  padding: 15px;
  min-height: 100vh;
  background: #f7f8fa;

  &.night-mode {
    background: #1a1a1a;

    .custom-form {
      background: #2a2a2a;

      ::v-deep .van-cell__title,
      ::v-deep .van-cell__value,
      .color-label {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

.custom-form {
  border-radius: 8px;
  overflow: hidden;
}

.form-item {
  ::v-deep .van-cell__title {
    flex: 0 0 100px;
  }
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 0;
}

.color-option {
  display: flex;
  align-items: center;
  padding: 0;
  margin-right: 15px;

  ::v-deep .van-radio__label {
    display: flex;
    align-items: center;
  }
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 6px;
  border: 1px solid #ebedf0;
}

.action-buttons {
  padding: 20px 16px;

  .submit-btn {
    margin-bottom: 12px;
  }

  .reset-btn {
    &::before {
      background-color: var(--van-button-danger-border-color);
    }
  }
}

::v-deep .van-picker__toolbar {
  background: var(--van-background-2);
}
</style>