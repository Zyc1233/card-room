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
			// 监听主题变化事件
			window.addEventListener('app-theme-changed', this.applyThemeSettings);
			
			// 初始化应用设置
			const saved = localStorage.getItem('appSettings');
			if (saved) {
				const settings = JSON.parse(saved);
				document.documentElement.style.cssText = `
					--primary-color: ${settings.color};
					--font-family: ${settings.font.value};
					--font-size: ${settings.fontSize}px;
				`;
				document.documentElement.classList.toggle('dark-theme', settings.theme === 'dark');
			}
		},
		methods: {
			applyThemeSettings(event) {
				const { color, font, fontSize, theme } = event.detail;
				document.documentElement.style.setProperty('--primary-color', color);
				document.documentElement.style.setProperty('--font-family', font.value);
				document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
				document.documentElement.classList.toggle('dark-theme', theme === 'dark');
			}
		}
	}
</script>

<style>
:root {
  --primary-color: #3a7afe;
  --background: #f5f6fa;
  --card-bg: #ffffff;
  --text: #333;
  --text-primary: #303133;
  --text-inverse: rgba(255, 255, 255, 0.9);
  --border-color: #e4e7ed;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --button-hover: #f0f0f0;
  --disabled-bg: #f5f5f5;
  
  font-family: system-ui;
  font-size: 16px;
}

body {
  background-color: var(--background);
  color: var(--text);
  transition: all 0.3s ease;
}

.dark-theme {
  --background: #1a1a1a;
  --card-bg: #2d2d2d;
  --text: rgba(255, 255, 255, 0.9);
  --button-bg: #3a3a3a;
  --text-primary: rgba(255, 255, 255, 0.92);
  --border-color: #434343;
  --shadow-color: rgba(255, 255, 255, 0.1);
  --button-hover: #4a4a4a;
  --disabled-bg: #363636;
}

/* 添加全局过渡效果 */
* {
  transition: 
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}
</style>

