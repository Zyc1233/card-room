<template>
  <div class="setting-container" :style="{ fontFamily: currentFont }">
    <!-- 主题颜色选择 -->
    <div class="form-group">
      <label for="theme-color">主题颜色</label>
      <select id="theme-color" v-model="themeColor">
        <option value="默认">默认</option>
        <option value="深色">深色</option>
        <option value="浅色">浅色</option>
        <option value="暖色">暖色</option>
        <option value="冷色">冷色</option>
      </select>
    </div>

    <!-- 字体样式选择 -->
    <div class="form-group">
      <label for="font-style">字体样式</label>
      <select id="font-style" v-model="fontFamily">
        <option value="">默认</option>
        <option value="微软雅黑">微软雅黑</option>
        <option value="粗体">粗体</option>
        <option value="华文宋体">华文宋体</option>
        <option value="华文行楷">华文行楷</option>
      </select>
    </div>

    <!-- 字体大小选择 -->
    <div class="form-group">
      <label for="font-size">字体大小</label>
      <select id="font-size" v-model="fontSize">
        <option value="默认">默认</option>
        <option value="大">大</option>
        <option value="小">小</option>
        <option value="超小">超小</option>
      </select>
    </div>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="showConfirmDialog">保存</button>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  setup() {
    // 从本地存储加载已保存的设置
    const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    const themeColor = ref(savedSettings.themeColor || '默认');
    const fontFamily = ref(savedSettings.fontFamily || '');
    const fontSize = ref(savedSettings.fontSize || '默认');

    const currentFont = computed(() => fontFamily.value || 'unset');

    const applyGlobalStyles = () => {
      // 设置全局样式变量
      document.documentElement.style.setProperty('--primary-font', currentFont.value);
      document.documentElement.style.setProperty('--theme-color', getThemeColor(themeColor.value));
      document.documentElement.style.setProperty('--base-font-size', getFontSize(fontSize.value));
    };

    const getThemeColor = (color) => {
      const colors = {
        '默认': '#007bff',
        '深色': '#2c3e50',
        '浅色': '#f8f9fa',
        '暖色': '#e67e22',
        '冷色': '#3498db'
      };
      return colors[color] || colors['默认'];
    };

    const getFontSize = (size) => {
      const sizes = {
        '默认': '14px',
        '大': '18px',
        '小': '12px',
        '超小': '10px'
      };
      return sizes[size] || sizes['默认'];
    };

    const showConfirmDialog = () => {
      // 保存设置到本地存储
      const settings = {
        themeColor: themeColor.value,
        fontFamily: fontFamily.value,
        fontSize: fontSize.value
      };
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // 应用全局样式
      applyGlobalStyles();
      alert('设置已保存并全局应用');
    };

    // 监听主题颜色变化
    watch(themeColor, (newValue) => {
      document.documentElement.style.setProperty('--theme-color', getThemeColor(newValue));
    });

    // 监听字体样式变化
    watch(fontFamily, (newValue) => {
      document.documentElement.style.setProperty('--primary-font', newValue || 'unset');
    });

    // 监听字体大小变化
    watch(fontSize, (newValue) => {
      document.documentElement.style.setProperty('--base-font-size', getFontSize(newValue));
    });

    // 初始化时应用已保存的样式
    applyGlobalStyles();

    return {
      themeColor,
      fontFamily,
      fontSize,
      currentFont,
      showConfirmDialog,
    };
  },
};
</script>

<style scoped>
.setting-container {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 18px;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #0056b3;
}
</style>