import request from '@/utils/request'

// 查询角色组
export function getRoles() {
  return request({
    url: '/role/getRoles',
    method: 'get'
  })
}

// 获取所有角色组
export function allRoles() {
  return request({
    url: '/role/getAll',
    method: 'post'
  })
}

// 新增角色组
export function addRole(data) {
  return request({
    url: '/role/add',
    method: 'post',
    data
  })
}

// 更新角色组
export function updateRole(id, data) {
  return request({
    url: '/role/update?id=' + id,
    method: 'post',
    data
  })
}

// 删除角色组
export function deleteRole(id) {
  return request({
    url: '/role/delete?id=' + id,
    method: 'post'
  })
}

// 批量删除
export function multiDeleteRoles(data) {
  return request({
    url: '/role/multiDelete',
    method: 'post',
    data
  })
}
