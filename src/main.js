import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import dayjs from 'dayjs'
import Vant from 'vant'
import platform from 'platform'

Vue.prototype.$dayjs = dayjs  
Vue.use(Vant)
Vue.config.productionTip = false

App.mpType = 'app'

// 使用 platform 检测平台
console.log('Platform:', platform.os.family)

// 全局错误处理
window.onerror = function (message, source, lineno, colno, error) {
  console.error('Global error:', message, source, lineno, colno, error);
  return true; // 阻止默认错误处理
};

const app = new Vue({
  ...App
})
app.$mount()
