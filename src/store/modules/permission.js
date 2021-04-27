import { asyncRoutes, constantRoutes } from '@/router'
import { getRoutes } from '@/api/routes'
import Layout from '@/layout'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 后台查询的菜单数据拼装成路由格式的数据
 * @param routes
 */
export function generaMenu(routes, data) {
  data.forEach(item => {
    const menu = {
      path: item.path === '#' ? item.id + '_key' : item.path,
      component: item.component === '#' ? Layout : resolve => require([`@/views${item.component}`], resolve),
      hidden: item.hidden,
      redirect: item.redirect,
      children: [],
      name: 'menu_' + item.id,
      alwaysShow: item.alwaysShow,
      meta: {
        title: item.title,
        id: item.id,
        icon: item.icon === '#' ? '' : item.icon,
        affix: item.affix,
        noCache: item.noCache
      }
    }
    // 一级路由
    if (!item.children && item.pid === 0) {
      menu.name = undefined
      menu.children = [
        {
          path: 'index',
          component: resolve => require([`@/views${item.path}`], resolve),
          name: 'menu_' + item.id,
          meta: { title: item.title, icon: item.icon, noCache: item.noCache, affix: item.affix }
        }
      ]
    }
    // 二级路由
    if (item.children) {
      generaMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const loadMenuData = []
      // 先查询后台并返回左侧菜单数据并把数据添加到路由
      getRoutes(state.token).then(response => {
        let data = response
        if (response.code !== 20000) {
          alert(JSON.stringify('菜单数据加载异常'))
          // throw new Error('菜单数据加载异常')
        } else {
          data = response.data
          Object.assign(loadMenuData, data)
          const tempAsyncRoutes = Object.assign([], asyncRoutes)
          // tempAsyncRoutes = asyncRoutes
          generaMenu(tempAsyncRoutes, loadMenuData)
          let accessedRoutes
          if (roles.includes('admin')) {
            // alert(JSON.stringify(asyncRoutes))
            accessedRoutes = tempAsyncRoutes || []
          } else {
            accessedRoutes = filterAsyncRoutes(tempAsyncRoutes, roles)
          }
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        }
        // generaMenu(asyncRoutes, data)
      }).catch(error => {
        console.log(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
