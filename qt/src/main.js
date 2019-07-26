import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import qs from 'qs';
import vcolorpicker from 'vcolorpicker'
import router from './router'
Vue.use(vcolorpicker)
Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs;
Vue.prototype.$baseurl="http://www.imgserver.ld1314.cn:8082";
// Vue.prototype.$baseurl="http://localhost:8081";
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
