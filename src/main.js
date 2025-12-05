import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import less from 'less'
import 'element-ui/lib/theme-chalk/index.css';
import clickOutside from './directives/clickOutside'

// 导入APP.vue,基于APP进行渲染
Vue.use(less)
Vue.use(ElementUI);

// 注册全局指令
Vue.directive('click-outside', clickOutside)
// 发生在指令绑定元素外部的点击事件

// 提示当前出于什么开发环境
Vue.config.productionTip = false;
// VUE实例化，提供render方法，进行组件渲染
new Vue({
  render: h => h(App),
  router 
}).$mount('#app');
