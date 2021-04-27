<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleAddAdmin">
        添加
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="getList">
        刷新
      </el-button>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="multiDel">
        批量删除
      </el-button>
    </div>
    <el-table
      ref="adminTable"
      v-loading="listLoading"
      :data="list"
      row-key="id"
      border
      highlight-current-row
      style="width:100%"
      max-height="750"
      default-expand-all
    >
      <el-table-column type="selection" width="50" align="center" :selectable="canSelect" />
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" prop="avatar" align="center" width="80">
        <template slot-scope="{row}">
          <img :src="row.avatar" style="width:40px;height:40px;border-radius:5px">
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色组" prop="role" align="center" width="130">
        <template slot-scope="{row}">
          <el-tag>{{ row.role_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.status == 1" type="success">正常</el-tag>
          <el-tag v-if="row.status == 0" type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="create_time" width="160" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" align="center" width="150">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button v-if="row.id > 1" type="danger" size="mini" @click="delAdmin(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'新增'">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="100px">
        <el-form-item label="角色分组" prop="role_id">
          <el-select v-model="temp.role_id" class="filter-item" placeholder="请选择角色组">
            <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="upAvatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="temp.avatar" :src="temp.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" placeholder="请输入用户名" style="width:400px" :disabled="dialogType==='edit' ? true : false" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" show-password :placeholder="dialogType==='edit' ? '留空则不修改' : '请输入密码'" style="width:400px" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="dialogType==='create'?createAdmin():updateAdmin()">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAdmins, addAdmin, updateAdmin, deleteAdmin, multiDeleteAdmins } from '@/api/admin'
import { allRoles } from '@/api/role'
import { upload } from '@/api/upload'

export default {
  data() {
    return {
      list: [],
      roles: [],
      listLoading: true,
      dialogVisible: false,
      dialogType: 'create',
      temp: {
        password: undefined,
        avatar: ''
      },
      rules: {}
    }
  },
  created() {
    this.getList()
    this.getRolesList()
  },
  methods: {
    // 获取管理员列表
    getList() {
      this.listLoading = true
      getAdmins().then(res => {
        this.list = res.data
        // 延时
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    // 获取角色组列表
    getRolesList() {
      allRoles().then(res => {
        this.roles = res.data
      })
    },
    // 重置表单数据
    resetTemp() {
      this.temp = {
        password: undefined,
        avatar: ''
      }
    },
    // 打开添加窗口
    handleAddAdmin() {
      this.resetTemp()
      this.dialogType = 'create'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 打开编辑窗口
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 新增管理员
    createAdmin() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          addAdmin(tempData).then(res => {
            this.getList()
            this.dialogVisible = false
            this.$notify({
              title: '添加成功',
              message: res.msg,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 更新管理员信息
    updateAdmin() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateAdmin(tempData.id, tempData).then(res => {
            this.getList()
            this.dialogVisible = false
            this.$notify({
              title: '更新成功',
              message: res.msg,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 删除管理员
    delAdmin(id) {
      this.$confirm('确认删除该管理员？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await deleteAdmin(id)
        this.getList()
        this.$notify({
          title: '删除成功',
          message: res.msg,
          type: 'success',
          duration: 2000
        })
      }).catch(e => e)
    },
    // 禁止选择超级管理员账户
    canSelect(row) {
      return row.id === 1 ? 0 : 1
    },
    // 批量删除
    multiDel() {
      const select = this.$refs.adminTable.selection
      const ids = []
      select.forEach(item => {
        ids.push(item.id)
      })
      this.$confirm('是否删除选中的管理员？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await multiDeleteAdmins(ids)
        this.getList()
        this.$notify({
          title: '删除成功',
          message: res.msg,
          type: 'success',
          duration: 2000
        })
      }).catch(e => e)
    },
    // 头像上传，返回头像路径
    upAvatar(file) {
      const formData = new FormData()
      formData.append('file', file.file)
      upload(formData).then(res => {
        this.temp.avatar = res.data
      })
    },
    handleAvatarSuccess(res, file) {
      this.headUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || 'image/png'
      const isLt3M = file.size / 1024 / 1024 < 3

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt3M) {
        this.$message.error('上传头像图片大小不能超过 3MB!')
      }
      return isJPG && isLt3M
    }
  }
}
</script>

<style lang="scss" scoped>
  .avatar-uploader{
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 62px;
    height: 62px;
  }
  .avatar-uploader:hover{
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
  }
  .avatar {
    width: 60px;
    height: 60px;
    display: block;
  }
</style>
