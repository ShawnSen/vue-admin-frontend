<template>
  <div class="icon-picker">
    <el-input v-model="name" class="icon-search" clearable placeholder="输入图标名称" @clear="filterIcons" @input.native="filterIcons">
      <i slot="suffix" class="el-icon-search el-input__icon" />
    </el-input>
    <div class="icon-list">
      <el-row>
        <el-col v-for="(item, index) in iconList" :key="index" class="svg-box">
          <el-tooltip effect="dark" :content="item" placement="top-start">
            <svg-icon :icon-class="item" @click="iconPicker(item)" />
          </el-tooltip>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import svgIcons from '../../icons/svg-icon'
export default {
  name: 'IconPicker',
  data() {
    return {
      name: '',
      iconList: svgIcons
    }
  },
  methods: {
    filterIcons() {
      if (this.name) {
        this.iconList = this.iconList.filter(item => item.includes(this.name))
      } else {
        this.iconList = svgIcons
      }
    },
    iconPicker(name) {
      this.$emit('selected', name)
      document.body.click()
    },
    reset() {
      this.name = ''
      this.iconList = svgIcons
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-picker {
  width: 100%;
  padding: 5px 0 5px 0;
  .icon-search{
    position: relative;
  }
  .icon-list {
    height: 230px;
    overflow-y: auto;
    .svg-box {
      height: 40px;
      width: 40px;
      padding: 7px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin: 6px;
      .svg-icon {
        width: 24px;
        height: 24px;
      }
    }
    .svg-box :hover {
      color: #409EFF;
    }
  }
}
</style>
