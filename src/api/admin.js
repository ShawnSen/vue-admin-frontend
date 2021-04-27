import request from '@/utils/request'

// 查询管理员
export function getAdmins() {
  return request({
    url: '/admin/getAll',
    method: 'get'
  })
}

// 新增角色组
export function addAdmin(data) {
  return request({
    url: '/admin/add',
    method: 'post',
    data
  })
}

// 更新角色组
export function updateAdmin(id, data) {
  return request({
    url: '/admin/update?id=' + id,
    method: 'post',
    data
  })
}

// 删除角色组
export function deleteAdmin(id) {
  return request({
    url: '/admin/delete?id=' + id,
    method: 'post'
  })
}

// 批量删除
export function multiDeleteAdmins(data) {
  return request({
    url: '/admin/multiDelete',
    method: 'post',
    data
  })
}
