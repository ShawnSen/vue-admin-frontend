<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        新增
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="getList">
        刷新
      </el-button>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="multiDel">
        批量删除
      </el-button>
    </div>
    <el-table
      ref="ruleTable"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      row-key="id"
      border
      highlight-current-row
      style="width: 100%;"
      max-height="750"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="ID" prop="id" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜单名称" prop="name" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜单图标" prop="icon" align="center" width="80">
        <template slot-scope="{row}">
          <span><svg-icon :icon-class="row.icon" /></span>
        </template>
      </el-table-column>
      <el-table-column label="路由地址" prop="path" align="center">
        <template slot-scope="{row}">
          <span>{{ row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column label="组件路径" prop="component" align="center">
        <template slot-scope="{row}">
          <span>{{ row.component }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重定向" prop="redirect" align="center">
        <template slot-scope="{row}">
          <span>{{ row.redirect }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.sort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="缓存" prop="noCache" align="center" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.noCache == 1" type="success">是</el-tag>
          <el-tag v-if="row.noCache == 0" type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="隐藏" prop="hidden" align="center" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.hidden == 1" type="success">是</el-tag>
          <el-tag v-if="row.hidden == 0" type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总是显示" prop="alwaysShow" align="center" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.alwaysShow == 1" type="success">是</el-tag>
          <el-tag v-if="row.alwaysShow == 0" type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="固钉" prop="affix" align="center" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.affix == 1" type="success">是</el-tag>
          <el-tag v-if="row.affix == 0" type="danger">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.status == 1" type="success">正常</el-tag>
          <el-tag v-if="row.status == 0" type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="action" align="center" width="150">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="delData(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改路由菜单 -->
    <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="父级菜单" prop="pid">
              <el-select v-model="temp.pid" class="filter-item" placeholder="请选择父级菜单">
                <el-option key="0" label="无(一级菜单)" :value="0" />
                <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="temp.title" style="width:200px" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="路由地址" prop="path">
              <el-input v-model="temp.path" style="width:300px" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="temp.component" style="width:300px" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="temp.pid === 0 || !temp.pid" label="重定向" prop="redirect">
              <el-input v-model="temp.redirect" style="width:300px" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="temp.pid === 0 || !temp.pid" label="菜单图标" prop="icon">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
              >
                <IconPicker ref="iconPicker" @selected="selected" @show="$refs['iconPicker'].reset()" />
                <el-input slot="reference" v-model="temp.icon" placeholder="点击选择图标" readonly style="width:300px">
                  <svg-icon v-if="temp.icon" slot="prefix" :icon-class="temp.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="temp.sort" size="small" :min="0" :max="99" label="描述文字" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="缓存" prop="noCache">
              <el-switch v-model="temp.noCache" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="隐藏" prop="affix">
              <el-switch v-model="temp.hidden" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总是显示" prop="alwaysShow">
              <el-switch v-model="temp.alwaysShow" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="固钉" prop="affix">
              <el-switch v-model="temp.affix" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="temp.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRoutes, addRoute, deleteRoute, updateRoute, multiDeleteRoutes } from '@/api/routes'
import IconPicker from '@/components/iconPicker'

export default {
  components: { IconPicker },
  data() {
    return {
      list: [],
      tableKey: 0,
      listLoading: true,
      dialogFormVisible: false,
      listQuery: {
        status: 1
      },
      temp: {
        status: 1,
        icon: '',
        sort: 0
      },
      dialogStatus: '',
      titleMap: {
        update: '编辑',
        create: '新增'
      },
      rules: {
        title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
      },
      dataStatus: [
        { key: 0, name: '禁用' },
        { key: 1, name: '正常' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 图标选择器
    selected(name) {
      this.temp.icon = name
    },
    // 获取路由规则列表
    getList() {
      this.listLoading = true
      getRoutes(this.listQuery).then(res => {
        this.list = res.data
        // 延时
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    // 打开新增窗口
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 打开更新窗口
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 重置表单数据
    resetTemp() {
      this.temp = {
        status: 1,
        icon: '',
        sort: 0
      }
    },
    // 新增数据
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addRoute(this.temp).then(res => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: res.msg,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 更新数据
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateRoute(tempData.id, tempData).then(res => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: res.msg,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 根据ID删除路由规则
    delData(id) {
      this.$confirm('是否删除该路由？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await deleteRoute(id)
        this.getList()
        this.$notify({
          title: 'Success',
          message: res.msg,
          type: 'success',
          duration: 2000
        })
      })
    },
    // 删除勾选的路由规则，含子路由
    multiDel() {
      const arr = this.$refs.ruleTable.selection
      const ids = []
      this.selectIds(ids, arr)
      this.$confirm('是否删除选中的路由？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await multiDeleteRoutes(ids)
        this.getList()
        this.$notify({
          title: '删除成功',
          message: res.msg,
          type: 'success',
          duration: 2000
        })
      }).catch(e => e)
    },
    // 获取选择ids
    selectIds(ids, arr) {
      arr.forEach(item => {
        const id = item.id
        ids.push(id)
        if (item.children) {
          this.selectIds(ids, item.children)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
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
