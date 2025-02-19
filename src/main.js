import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import dayjs from 'dayjs'
import uView from 'uview-ui'
	
Vue.use(uView)

Vue.config.productionTip = false
Vue.prototype.$dayjs = dayjs

App.mpType = 'app'
uni.$u.config.unit = 'rpx'
const app = new Vue({
  ...App
})
app.$mount()
