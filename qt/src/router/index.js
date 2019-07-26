import Vue from 'vue'
import Router from 'vue-router'


import login from '@/components/login' // 登录
import register from '@/components/register' // 登录
import index from '@/components/index' // 登录
import drawList from '@/components/drawList' // 登录
import drawItem from '@/components/drawItem' // 登录

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/register',
      name: 'register',
      component: register
    },
    {
      path: '/index',
      name: 'index',
      component: index
    },
    {
      path: '/drawList',
      name: 'drawList',
      component: drawList
    },
    {
      path: '/drawItem',
      name: 'drawItem',
      component: drawItem
    }
  ]
})
