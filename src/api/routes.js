import request from '@/utils/request'

// 查询路由
export function getRoutes() {
  return request({
    url: '/routes/index',
    method: 'get'
  })
}

// 新增路由
export function addRoute(data) {
  return request({
    url: '/routes/add',
    method: 'post',
    data
  })
}

// 更新路由
export function updateRoute(id, data) {
  return request({
    url: '/routes/update?id=' + id,
    method: 'post',
    data
  })
}

// 删除路由
export function deleteRoute(id) {
  return request({
    url: '/routes/delete?id=' + id,
    method: 'post'
  })
}

// 批量删除路由
export function multiDeleteRoutes(data) {
  return request({
    url: '/routes/multiDelete',
    method: 'post',
    data // 路由id数组
  })
}
