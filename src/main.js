import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import dayjs from 'dayjs'
import 'vant/lib/index.css'
import { Lazyload } from 'vant'

Vue.config.productionTip = false
Vue.prototype.$dayjs = dayjs
Vue.use(Lazyload);

App.mpType = 'app'


const app = new Vue({
  ...App
})
app.$mount()
