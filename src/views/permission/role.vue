<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-plus" @click="handleAddRole">新增</el-button>
    <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="getRoles">刷新</el-button>
    <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="multiDel">批量删除</el-button>
    <el-table
      ref="roleTable"
      v-loading="listLoading"
      :data="rolesList"
      style="width: 100%;margin-top:30px;"
      border
    >
      <el-table-column type="selection" width="50" align="center" :selectable="canSelect" />
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Key" width="220">
        <template slot-scope="scope">
          {{ scope.row.key }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色组" width="220">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button v-if="scope.row.id > 1" type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'新增'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="role.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="Key">
          <el-input v-model="role.key" placeholder="请输入角色组Key" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入角色组描述"
          />
        </el-form-item>
        <el-form-item v-if="role.id !== 1" label="路由菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoles, addRole, deleteRole, updateRole, multiDeleteRoles } from '@/api/role'
import { getRoutes } from '@/api/routes'

const defaultRole = {
  key: '',
  name: '',
  description: '',
  routes: [],
  rules: []
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      listLoading: true,
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getRoutes()
    this.getRoles()
  },
  methods: {
    // 获取路由列表
    async getRoutes() {
      const res = await getRoutes()
      this.serviceRoutes = res.data
      this.routes = this.generateRoutes(res.data)
    },
    // 获取角色组
    async getRoles() {
      this.listLoading = true
      getRoles().then(res => {
        this.rolesList = res.data
        // 延时
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },

    // 重塑路由结构，使其看起来与侧边栏相同
    generateRoutes(routes, basePath = '/') {
      const res = []
      for (const route of routes) {
        // 路由是否隐藏
        if (route.hidden) { continue }
        const data = {
          path: path.resolve(basePath, route.path),
          title: route.title,
          id: route.id
        }

        // 子路由处理
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    // 打开添加窗口
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    // 打开编辑窗口
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      if (this.role.id > 1) {
        this.$nextTick(() => {
          const routes = this.generateRoutes(this.role.routes)
          console.log(routes)
          this.$refs.tree.setCheckedNodes(this.generateArr(routes))
          // 节点状态
          this.checkStrictly = false
        })
      }
    },
    // 删除确认框
    handleDelete({ $index, row }) {
      this.$confirm('是否确认删除角色组?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: 'Delete succed!'
          })
        })
        .catch(err => { console.error(err) })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)
        // 处理子路由
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    // 提交（新增和更新）
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'

      const checkedKeys = this.$refs.tree.getCheckedKeys()
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
      this.role.rules = halfCheckedKeys.concat(checkedKeys)
      this.role.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)
      if (isEdit) {
        await updateRole(this.role.id, this.role).then(() => {
          this.getRoles()
        })
      } else {
        await addRole(this.role).then(() => {
          this.getRoles()
        })
      }

      const { description, key, name } = this.role
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>Role Key: ${key}</div>
            <div>Role Name: ${name}</div>
            <div>Description: ${description}</div>
          `,
        type: 'success'
      })
    },
    // 禁止选择超级管理员组
    canSelect(row) {
      return row.id === 1 ? 0 : 1
    },
    // 批量删除
    multiDel() {
      const select = this.$refs.roleTable.selection
      if (select.length < 1) {
        this.$message({
          type: 'error',
          message: 'No data selected'
        })
      } else {
        this.$confirm('是否删除选中的角色组？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          const ids = []
          select.forEach(item => {
            ids.push(item.id)
          })
          const res = await multiDeleteRoles(ids)
          this.getRoles()
          this.$notify({
            title: '删除成功',
            message: res.msg,
            type: 'success',
            duration: 2000
          })
        }).catch(e => e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
  ::v-deep {
      .el-dialog {
        .el-dialog__header {
          border-bottom: 1px solid #ebebeb;
        }
        .el-dialog__footer {
          border-top: 1px solid #ebebeb;
        }
      }
    }
}
</style>
