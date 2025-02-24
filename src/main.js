import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import dayjs from 'dayjs'
import 'vant/lib/index.css'
import { Lazyload, Toast } from 'vant'
import { lightTheme, darkTheme } from './themes'

// 使用 Vue.mixin() 添加全局方法
Vue.mixin({
  methods: {
    applyTheme(theme) {
      for (let key in theme) {
        document.documentElement.style.setProperty(key, theme[key]);
      }
    }
  }
});

Vue.config.productionTip = false
Vue.prototype.$dayjs = dayjs  
Vue.use(Lazyload);
Vue.prototype.$toast = Toast;

App.mpType = 'app'


const app = new Vue({
  ...App
})
app.$mount()
Vue.prototype.$applyTheme = Vue.prototype.applyTheme;
Vue.prototype.$applyTheme(darkTheme);