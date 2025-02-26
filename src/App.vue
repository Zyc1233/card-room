<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		mounted() {
			// const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
			// if (isBrowser) {
			// 	window.addEventListener('app-theme-changed', this.applyThemeSettings);
				
			// 	// 初始化应用设置
			// 	const saved = localStorage.getItem('appSettings');
			// 	if (saved) {
			// 		const settings = JSON.parse(saved);
			// 		document.documentElement.style.cssText = `
			// 			--primary-color: ${settings.color};
			// 			--font-family: ${settings.font.value};
			// 			--font-size: ${settings.fontSize}px;
						
			// 			/* 新增Vant组件变量 */
			// 			--van-primary-color: var(--primary-color);
			// 			--van-font-size-md: var(--font-size);
			// 			--van-font-family: var(--font-family);
			// 		`;
			// 		document.documentElement.classList.toggle('dark-theme', settings.theme === 'dark');
			// 	}
			// }
		},
		methods: {
			// applyThemeSettings(event) {
			// 	if (typeof document !== 'undefined') {
			// 		const { color, font, fontSize, theme } = event.detail;
			// 		document.documentElement.style.setProperty('--primary-color', color);
			// 		document.documentElement.style.setProperty('--font-family', font.value);
			// 		document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
			// 		document.documentElement.classList.toggle('dark-theme', theme === 'dark');
			// 	}
			// }
		}
	}
</script>

<style>
@import 'vant/lib/index.css';
:root {
  --primary-color: #3a7afe;
  --background: #f5f6fa;
  --card-bg: #ffffff;
  --text: #333;
  --text-primary: #303133;
  --text-inverse: #fff;
  --border-color: #e4e7ed;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --button-hover: #f0f0f0;
  --disabled-bg: #f5f5f5;
  --placeholder-color: rgba(0, 0, 0, 0.5);
  
  font-family: system-ui;
  font-size: 16px;
  
  /* 新增全局Vant组件变量 */
  --van-primary-color: var(--primary-color);
  --van-success-color: #07c160;
  --van-danger-color: #ee0a24;
  --van-warning-color: #ff976a;
  
  /* 文字 */
  --van-text-color: var(--text);
  --van-text-color-2: var(--text-secondary);
  --van-font-size-md: var(--font-size);
  --van-font-family: var(--font-family);

  /* 背景 */
  --van-background-color: var(--background);
  --van-background-color-light: var(--card-bg);
  
  /* 边框 */
  --van-border-color: var(--border-color);
  
  /* 组件统一使用CSS变量 */
  .van-button {
    --van-button-default-color: var(--text);
    --van-button-default-background: var(--button-bg);
    --van-button-default-border-color: var(--border-color);
  }
  
  .van-cell {
    --van-cell-background: var(--card-bg);
    --van-cell-text-color: var(--text);
  }

  --van-field-input-text-color: var(--text-primary);
  --van-field-placeholder-text-color: var(--text-secondary);
  --van-field-label-color: var(--text-primary);
  --van-field-border-color: var(--border-color);
  --van-field-background: var(--card-bg);

  --test-color: red;
}

body {
  background-color: var(--background);
  color: var(--text);
  transition: all 0.3s ease;
}

.dark-theme {
  --background: #1a1a1a;
  --card-bg: #2d2d2d;
  --text: rgba(255, 255, 255, 0.92);
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --button-bg: #3a3a3a;
  --border-color: #434343;
  --shadow-color: rgba(255, 255, 255, 0.1);
  --button-hover: #4a4a4a;
  --disabled-bg: #363636;
  --placeholder-color: rgba(255, 255, 255, 0.5);
  --text-inverse: rgba(0, 0, 0, 0.9);
}

/* 添加全局过渡效果 */
* {
  transition: 
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.3s ease;
}

/* 禁用状态过渡 */
.van-button--disabled {
  transition: opacity 0.3s ease;
  opacity: 0.6;
}

/* 增强输入框可见性 */
.van-field__control {
  color: var(--text-primary) !important;
  font-size: var(--font-size) !important;
}

/* 统一图标颜色 */
.van-icon {
  color: var(--text-secondary);
  
  &[class*="__left-icon"] {
    color: var(--text-secondary) !important;
  }
}

/* 统一输入框样式 */
.van-field {
  background: var(--van-field-background);
  
  &__control {
    color: var(--van-field-input-text-color) !important;
    
    &::placeholder {
      color: var(--van-field-placeholder-text-color) !important;
    }
  }
  
  &__label {
    color: var(--van-field-label-color) !important;
  }
  
  &--error {
    --van-field-border-color: var(--error-border);
  }
}

/* 统一图标大小比例 */
.van-icon {
  font-size: calc(var(--font-size) * 1.2);
}

</style>

