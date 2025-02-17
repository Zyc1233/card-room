import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import dayjs from 'dayjs'

import 'uview-ui/index.scss'
import uView from 'uview-ui'
	
Vue.use(uView)

Vue.config.productionTip = false
Vue.prototype.$dayjs = dayjs

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
