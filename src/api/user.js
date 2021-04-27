import request from '@/utils/request'

// 登录接口
export function login(data) {
  return request({
    url: '/login/login',
    method: 'post',
    data
  })
}

// 获取当前登录用户信息
export function getInfo(token) {
  return request({
    url: '/admin/userinfo',
    method: 'get',
    params: { token }
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}
