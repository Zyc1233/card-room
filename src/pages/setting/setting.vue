<template>
  <div class="new-settings" :class="{ 'dark-theme': isDark }">
    <!-- 头部 -->
    <div class="header">
      <h1>个性化设置</h1>
      <div class="theme-switch">
        <span class="switch-label">{{ isDark ? '深色主题' : '浅色主题' }}</span>
        <van-switch v-model="isDark" size="24px" @change="toggleTheme" />
      </div>
    </div>

    <!-- 主题颜色 -->
    <div class="settings-card">
      <div class="card-header">
        <van-icon name="color" size="20px" />
        <h3>主题配色</h3>
      </div>
      <div class="color-grid">
        <div 
          v-for="color in themeColors" 
          :key="color" 
          class="color-item" 
          :class="{ active: activeColor === color }"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        > 
          <van-icon v-show="activeColor === color" name="success" color="white" />
        </div>
      </div>
    </div>

    <!-- 字体设置 -->
    <div class="settings-card">
      <div class="card-header">
        <van-icon name="font" size="20px" />
        <h3>字体设置</h3>
      </div>
      
      <!-- 字体选择 -->
      <div class="font-selector">
        <div 
          v-for="font in fontList" 
          :key="font.name"
          class="font-card"
          :class="{ active: currentFont === font.name }"
          @click="selectFont(font)"
        >
          <div class="font-preview" :style="{ fontFamily: font.value }">Aa</div>
          <span class="font-name">{{ font.name }}</span>
        </div>
      </div>

      <!-- 字体大小 -->
      <div class="miui-size-control">
        <div class="size-header">
          <span>字号大小</span>
          <span class="current-size">{{ sizeOptions[sliderValue].label }}（{{ fontSize }}px）</span>
        </div>
        <div class="slider-container">
          <van-slider
            v-model="sliderValue"
            :min="0"
            :max="4"
            :step="1"
            bar-height="4px"
            inactive-color="#ebedf0"
            active-color="#007dff"
            @change="updateFontSize"
          >
            <template #button>
              <div class="miui-slider-button">
                <div class="button-core"></div>
              </div>
            </template>
          </van-slider>
          <div class="scale-marks">
            <div 
              v-for="(item, index) in sizeOptions" 
              :key="index"
              class="scale-mark"
              :class="{ active: sliderValue >= index }"
            ></div>
          </div>
        </div>
        <div class="size-labels">
          <span 
            v-for="(item, index) in sizeOptions" 
            :key="index"
            :class="{ active: sliderValue === index }"
          >
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="fab-container">
      <van-button round type="primary" @click="saveSettings">
        <van-icon name="success" size="20px" />
        应用设置
      </van-button>
      <van-button 
        round 
        type="danger" 
        style="margin-top: 12px;"
        @click="logout"
      >
        <van-icon name="clear" size="20px" />
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script>
import { Toast, Dialog } from 'vant';

export default {
	components:{
		[Dialog.name] : Dialog
	},
  data() {
    return {
      isDark: false,
      activeColor: '#3a7afe',
      themeColors: [
        '#3a7afe', // 科技蓝
        '#00bc87', // 生态绿
        '#ff6b6b', // 活力红
        '#f4a548', // 温暖橙
        '#8e44ad', // 梦幻紫
      ],
      currentFont: '系统默认',
      fontList: [
        { name: '系统默认', value: 'system-ui' },
        { name: '鸿蒙字体', value: 'HarmonyOS_Sans' },
        { name: 'OPPO Sans', value: 'OPPOSans' },
        { name: '阿里健康体', value: 'AlibabaHealth' },
      ],
      fontSize: 16,
      sliderValue: 1, // 默认位置索引
      sizeOptions: [
        { label: '小号', value: 14 },
        { label: '默认', value: 16 },
        { label: '大号', value: 18 },
        { label: '超大', value: 20 },
        { label: '巨无霸', value: 24 }
      ],
      marks: {
        0: '小号',
        1: '默认',
        2: '大号',
        3: '超大',
        4: '巨无霸'
      }
    }
  },
  methods: {
    toggleTheme() {
      document.documentElement.classList.toggle('dark-theme', this.isDark)
      this.applyGlobalStyles()
    },
    selectColor(color) {
      this.activeColor = color
      this.applyGlobalStyles()
    },
    selectFont(font) {
      this.currentFont = font.name
      this.applyGlobalStyles()
    },
    selectSize(size) {
      this.fontSize = size
      this.applyGlobalStyles()
    },
    applyGlobalStyles() {
      // 应用主题色
      document.documentElement.style.setProperty('--primary-color', this.activeColor)
      // 应用暗黑模式
      document.documentElement.classList.toggle('dark-theme', this.isDark)
      // 应用字体
      document.documentElement.style.fontFamily = this.currentFont.value
      // 应用字号
      document.documentElement.style.fontSize = `${this.fontSize}px`
      
      // 同步到iframe（如果有）
      const iframes = document.getElementsByTagName('iframe')
      for (let iframe of iframes) {
        iframe.contentDocument.documentElement.style.cssText = document.documentElement.style.cssText
      }
    },
    saveSettings() {
      const settings = {
        theme: this.isDark ? 'dark' : 'light',
        color: this.activeColor,
        font: this.currentFont,
        fontSize: this.fontSize
      }
      
      // 保存到本地存储
      localStorage.setItem('appSettings', JSON.stringify(settings))
      
      // 应用全局样式
      this.applyGlobalStyles()
      
      // 触发全局事件
      window.dispatchEvent(new CustomEvent('global-styles-update', { detail: settings }))
      
      Toast({
        message: '设置已全局应用',
        type: 'success',
        duration: 1500
      })
    },
    updateFontSize() {
      this.fontSize = this.sizeOptions[this.sliderValue].value
      this.applyGlobalStyles()
    },
	async showConfirmModal(title, content) {
	  try {
	    await Dialog.confirm({
	      title,
	      message: content
	    });
	    return true;
	  } catch (error) {
	    return false;
	  }
	},
    async logout() {
      const confirm = await this.showConfirmModal('退出确认', '确定要退出当前账号吗？')
      if (!confirm) return
      
      localStorage.removeItem('userToken')
      Toast({
        message: '已退出登录',
        type: 'success',
        duration: 1000
      })
      this.$router.replace('/pages/login/login')
    }
  },
  mounted() {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      this.isDark = settings.theme === 'dark'
      this.activeColor = settings.color
      this.currentFont = settings.font
      this.fontSize = settings.fontSize
      this.sliderValue = this.sizeOptions.findIndex(opt => opt.value === this.fontSize) || 1
      
      // 初始化时应用全局样式
      this.applyGlobalStyles()
    }
  }
}
</script>

<style lang="scss" scoped>
.new-settings {
  padding: 20px;
  min-height: 100vh;
  background: var(--background);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.dark-theme {
    --background: #1a1a1a;
    --card-bg: #2d2d2d;
    --text: rgba(255, 255, 255, 0.9);
  }

  :root {
    --primary-color: #3a7afe;
    --background: #f5f6fa;
    --card-bg: #ffffff;
    --text: #333;
    
    font-family: system-ui;
    font-size: 16px;
  }

  body {
    background-color: var(--background);
    color: var(--text);
    transition: all 0.3s ease;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  h1 {
    font-size: 24px;
    color: var(--text);
  }
}

.settings-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    h3 {
      margin-left: 12px;
      font-size: 18px;
      color: var(--text);
    }
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  border: 1px solid var(--border-color);
  .color-item {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.1);
    }
    &.active {
      box-shadow: 0 0 0 2px var(--card-bg), 0 0 0 4px var(--primary-color);
    }
  }
}

.font-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  .font-card {
    background: var(--card-bg);
    border: 2px solid #eee;
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s;
    &.active {
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(58, 122, 254, 0.2);
    }
    .font-preview {
      font-size: 24px;
      margin-bottom: 8px;
      color: var(--text);
    }
    .font-name {
      font-size: 14px;
      color: var(--text);
    }
  }
}

.miui-size-control {
  margin-top: 28px;

  .size-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    font-size: 14px;
    color: var(--text);

    .current-size {
      color: #007dff;
      font-weight: 500;
    }
  }

  .slider-container {
    position: relative;
    padding: 0 12px;
  }

  .scale-marks {
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 8px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;

    .scale-mark {
      width: 4px;
      height: 8px;
      background: #ebedf0;
      border-radius: 2px;
      transition: background 0.2s;

      &.active {
        background: #007dff;
      }
    }
  }

  .miui-slider-button {
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    border: 2px solid #007dff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 125, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;

    .button-core {
      width: 8px;
      height: 8px;
      background: #007dff;
      border-radius: 50%;
    }
  }

  .size-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    padding: 0 8px;

    span {
      font-size: 12px;
      color: #999;
      width: 20%;
      text-align: center;
      transition: color 0.2s;

      &.active {
        color: #007dff;
        font-weight: 500;
      }
    }
  }

  // 覆盖vant默认样式
  ::v-deep .van-slider {
    height: 8px;

    &__bar {
      height: 4px;
      background-color: #007dff !important;
    }

    &__button {
      width: 24px;
      height: 24px;
      box-shadow: none;
      background: transparent;
    }
  }
}

.fab-container {
  position: fixed;
  bottom: 30px;
  left: 20px;
  right: 20px;
  button {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(58, 122, 254, 0.3);
    & + button {
      margin-top: 12px;
    }
  }
}

.theme-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .switch-label {
    color: var(--text-primary);
    font-size: 14px;
    margin-right: 8px;
  }
}
</style>