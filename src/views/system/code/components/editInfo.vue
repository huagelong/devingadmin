<!--
 - devinggoAdmin is committed to providing solutions for quickly building web applications
 - Please view the LICENSE file that was distributed with this source code,
 - For the full copyright and license information.
 - Thank you very much for using devinggoAdmin.
 -
 - @Author X.Mo<root@imoi.cn>
 - @Link   https://gitee.com/xmo/devinggoadmin-vue
-->
<template>
  <a-modal v-model:visible="visible" :on-before-ok="save" fullscreen unmount-on-close>
    <template #title>编辑生成信息 - {{ record?.table_comment }}</template>

    <a-spin :loading="loading" tip="加载数据中..." class="w-full">
      <a-form :model="form" ref="formRef">
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane title="配置信息" key="base_config">

            <a-divider orientation="left">基础信息</a-divider>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="表名称" field="table_name" label-col-flex="auto" :label-col-style="{ width: '100px' }">
                  <a-input v-model="form.table_name" disabled />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="表描述" field="table_comment" label-col-flex="auto"
                  :label-col-style="{ width: '100px' }" :rules="[{ required: true, message: '表描述必填' }]">
                  <a-input v-model="form.table_comment" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="24" :xl="24">
                <a-form-item label="备注信息" field="remark" label-col-flex="auto" :label-col-style="{ width: '94px' }">
                  <a-textarea v-model="form.remark" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-divider orientation="left">生成信息</a-divider>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="所属模块" field="module_name" label-col-flex="auto"
                  :label-col-style="{ width: '100px' }" :rules="[{ required: true, message: '所属模块必选' }]"
                  extra="所属模块请对应表模块前缀，否则会生成失败，且在安装模块时，数据迁移文件会被忽略">
                  <a-select style="width: 100%" v-model="form.module_name" allow-clear allow-search
                    placeholder="请选择所属模块">
                    <a-option class="w-full" v-for="(item, index) in modules" :label="item.name" :value="item.name"
                      :key="index">
                      <div class="flex justify-between w-full">
                        <span>{{ item.name }}</span>
                        <span>{{ item.label }}</span>
                      </div>
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="所属菜单" field="belong_menu_id" label-col-flex="auto"
                  :label-col-style="{ width: '100px' }" extra="分配业务功能在哪个菜单，例如：权限管理。不选择则为顶级菜单">
                  <a-cascader v-model="form.belong_menu_id" :options="menus" expand-trigger="hover"
                    :style="{ width: '100%' }" placeholder="生成功能所属菜单" allow-search allow-clear check-strictly />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="生成类型" field="type" label-col-flex="auto" :label-col-style="{ width: '100px' }"
                  extra="单表须有主键，树表须指定id、parent_id、name等字段">
                  <a-select style="width: 100%" v-model="form.type"
                    :options="[{ label: '单表增删改查', value: 'single' }, { label: '树表增删改查', value: 'tree' }]" allow-clear
                    allow-search placeholder="请选择所属模块" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="菜单名称" field="menu_name" label-col-flex="auto" :label-col-style="{ width: '100px' }"
                  :rules="[{ required: true, message: '菜单名称必选' }]" extra="显示在左侧菜单上的名称、以及以及代码中的业务名称">
                  <a-input allow-clear v-model="form.menu_name" placeholder="请输入菜单名称" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="24">
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="包名" field="package_name" label-col-flex="auto" :label-col-style="{ width: '100px' }"
                  extra="指定控制器文件所在控制器目录的二级目录名，如：Premission">
                  <a-input allow-clear v-model="form.package_name" placeholder="请输入包名" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12" :xl="12">
                <a-form-item label="组件样式" field="component_type" label-col-flex="auto"
                  :label-col-style="{ width: '100px' }" extra="设置新增和修改组件显示方式，Tag页表示新打开的一个标签来显示新增和编辑">
                  <a-radio-group v-model:model-value="form.component_type" type="button">
                    <a-radio :value="1">模态框</a-radio>
                    <a-radio :value="2">抽屉</a-radio>
                    <a-radio :value="3">Tag页</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            <div v-if="form.type === 'tree'">
              <a-divider orientation="left">树表配置</a-divider>
              <a-row :gutter="24">
                <a-col :xs="24" :md="8" :xl="8">
                  <a-form-item label="树主ID" field="tree_id" label-col-flex="auto" :label-col-style="{ width: '100px' }"
                    extra="指定树表的主要ID，一般为主键">
                    <a-select style="width: 100%" v-model="formOptions.tree_id" allow-clear allow-search
                      placeholder="请选择树表的主ID">
                      <a-option class="w-full" v-for="(item, index) in form.columns"
                        :label="item.column_name + ' - ' + item.column_comment" :value="item.column_name" :key="index">
                        <div class="flex justify-between w-full">
                          <span>{{ item.column_name }}</span>
                          <span>{{ item.column_comment }}</span>
                        </div>
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="8">
                  <a-form-item label="树父ID" field="tree_parent_id" label-col-flex="auto"
                    :label-col-style="{ width: '100px' }" extra="指定树表的父ID，比如：parent_id">
                    <a-select style="width: 100%" v-model="formOptions.tree_parent_id" allow-clear allow-search
                      placeholder="请选择树表的父ID">
                      <a-option class="w-full" v-for="(item, index) in form.columns"
                        :label="item.column_name + ' - ' + item.column_comment" :value="item.column_name" :key="index">
                        <div class="flex justify-between w-full">
                          <span>{{ item.column_name }}</span>
                          <span>{{ item.column_comment }}</span>
                        </div>
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="8">
                  <a-form-item label="树名称" field="tree_name" label-col-flex="auto" :label-col-style="{ width: '100px' }"
                    extra="指定树显示的名称字段，比如：name">
                    <a-select style="width: 100%" v-model="formOptions.tree_name" allow-clear allow-search
                      placeholder="请选择树表的主ID">
                      <a-option class="w-full" v-for="(item, index) in form.columns"
                        :label="item.column_name + ' - ' + item.column_comment" :value="item.column_name" :key="index">
                        <div class="flex justify-between w-full">
                          <span>{{ item.column_name }}</span>
                          <span>{{ item.column_comment }}</span>
                        </div>
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
            <div v-if="form.component_type === 3">
              <a-divider orientation="left">Tag页配置</a-divider>
              <a-row :gutter="24">
                <a-col :xs="24" :md="8" :xl="8">
                  <a-form-item label="标签页ID" field="tag_id" label-col-flex="auto" :label-col-style="{ width: '100px' }"
                    extra="指定标签页的ID，要保证全局唯一性">
                    <a-input v-model="formOptions.tag_id" placeholder="请输入标签页ID"></a-input>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="8">
                  <a-form-item label="标签页名称" field="tag_name" label-col-flex="auto"
                    :label-col-style="{ width: '100px' }" extra="指定标签的显示内容，注意：在打开标签后，会在标签前面加上新增或编辑">
                    <a-input v-model="formOptions.tag_name" placeholder="请输入标签页名称"></a-input>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :md="8" :xl="8">
                  <a-form-item label="标签显示字段" field="tag_view_name" label-col-flex="auto"
                    :label-col-style="{ width: '120px' }" extra="在标签后面显示某个字段的值，一般指定 title 或者 name 等字段">
                    <a-select style="width: 100%" v-model="formOptions.tag_view_name" allow-clear allow-search
                      placeholder="请选择标签显示字段">
                      <a-option class="w-full" v-for="(item, index) in form.columns"
                        :label="item.column_name + ' - ' + item.column_comment" :value="item.column_name" :key="index">
                        <div class="flex justify-between w-full">
                          <span>{{ item.column_name }}</span>
                          <span>{{ item.column_comment }}</span>
                        </div>
                      </a-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

          </a-tab-pane>
          <a-tab-pane title="字段配置" key="field_config">
            <a-alert title="提示">
              <p>数据字典在页面控件为下拉框、单选框、复选框和数据穿梭框才可选择</p>
            </a-alert>
            <a-table :data="form.columns" :pagination="false" class="mt-3">
              <template #columns>
                <a-table-column dataIndex="sort" title="排序" :width="100">
                  <template #cell="{ rowIndex }"><a-input-number v-model="form.columns[rowIndex].sort" /></template>
                </a-table-column>
                <a-table-column dataIndex="column_name" title="字段名称" :width="150" tooltip></a-table-column>
                <a-table-column dataIndex="column_comment" title="字段描述" :width="180">
                  <template #cell="{ rowIndex }"><a-input v-model="form.columns[rowIndex].column_comment"
                      allow-clear /></template>
                </a-table-column>
                <a-table-column dataIndex="column_type" title="物理类型" :width="120"></a-table-column>
                <a-table-column dataIndex="is_required" title="必填" :width="80">
                  <template #title>必填
                    <a-tooltip content="全选 / 全不选" position="bottom"><a-checkbox
                        @change="handlerAll($event, 'required')" /></a-tooltip>
                  </template>
                  <template #cell="{ rowIndex }"><a-checkbox v-model="form.columns[rowIndex].is_required" /></template>
                </a-table-column>
                <a-table-column dataIndex="is_insert" title="插入" :width="80">
                  <template #title>插入
                    <a-tooltip content="全选 / 全不选" position="bottom"><a-checkbox
                        @change="handlerAll($event, 'insert')" /></a-tooltip>
                  </template>
                  <template #cell="{ rowIndex }"><a-checkbox v-model="form.columns[rowIndex].is_insert" /></template>
                </a-table-column>
                <a-table-column dataIndex="is_edit" title="编辑" :width="80">
                  <template #title>编辑
                    <a-tooltip content="全选 / 全不选" position="bottom"><a-checkbox
                        @change="handlerAll($event, 'edit')" /></a-tooltip>
                  </template>
                  <template #cell="{ rowIndex }"><a-checkbox v-model="form.columns[rowIndex].is_edit" /></template>
                </a-table-column>
                <a-table-column dataIndex="is_list" title="列表" :width="80">
                  <template #title>列表
                    <a-tooltip content="全选 / 全不选" position="bottom"><a-checkbox
                        @change="handlerAll($event, 'list')" /></a-tooltip>
                  </template>
                  <template #cell="{ rowIndex }"><a-checkbox v-model="form.columns[rowIndex].is_list" /></template>
                </a-table-column>
                <a-table-column dataIndex="is_query" title="查询" :width="80">
                  <template #title>查询
                    <a-tooltip content="全选 / 全不选" position="bottom"><a-checkbox
                        @change="handlerAll($event, 'query')" /></a-tooltip>
                  </template>
                  <template #cell="{ rowIndex }"><a-checkbox v-model="form.columns[rowIndex].is_query" /></template>
                </a-table-column>
                <a-table-column dataIndex="is_sort" title="排序" :width="80">
                  <template #title>排序
                    <a-tooltip content="全选 / 全不选" position="bottom"><a-checkbox
                        @change="handlerAll($event, 'sort')" /></a-tooltip>
                  </template>
                  <template #cell="{ rowIndex }"><a-checkbox v-model="form.columns[rowIndex].is_sort" /></template>
                </a-table-column>
                <a-table-column dataIndex="query_type" title="查询方式" :width="180">
                  <template #cell="{ rowIndex }"><a-select v-model="form.columns[rowIndex].query_type"
                      :options="vars.queryType" allow-clear></a-select></template>
                </a-table-column>
                <a-table-column dataIndex="view_type" title="页面控件" :width="240">
                  <template #cell="{ record, rowIndex }">
                    <a-space>
                      <a-select v-model="form.columns[rowIndex].view_type" :style="{ width: '160px' }"
                        :options="vars.viewComponent" allow-clear></a-select>
                      <a-link v-if="!notNeedSettingComponents.includes(record.view_type)"
                        @click="settingComponentRef.open(record)">设置</a-link>
                    </a-space>
                  </template>
                </a-table-column>
                <a-table-column dataIndex="dict_type" title="数据字典" :width="180">
                  <template #cell="{ record, rowIndex }">
                    <a-select v-model="form.columns[rowIndex].dict_type" :options="dicts" allow-clear
                      :field-names="{ label: 'name', value: 'code' }" placeholder="选择数据字典"
                      :disabled="!['select', 'radio', 'checkbox', 'transfer'].includes(record.view_type)"></a-select>
                  </template>
                </a-table-column>
                <a-table-column dataIndex="allow_roles" title="允许角色" :width="200">
                  <template #cell="{ record, rowIndex }">
                    <a-select v-model="form.columns[rowIndex].allow_roles" multiple :options="roles" :max-tag-count="1"
                      allow-clear :field-names="{ label: 'name', value: 'code' }" placeholder="选择允许查看字段的角色"></a-select>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane title="菜单配置" key="menu_config">
            <a-alert title="提示">未选择的菜单，后端也对应不生成方法。注意：列表按钮菜单是默认的</a-alert>
            <a-checkbox-group direction="vertical" v-model="form.generate_menus" class="mt-3"
              :default-value="form.generate_menus">
              <a-checkbox :value="menu.value" v-for="(menu, index) in vars.menuList" :key="index">
                {{ menu.name + '　-　' + menu.comment }}
              </a-checkbox>
            </a-checkbox-group>
          </a-tab-pane>
        </a-tabs>
      </a-form>
    </a-spin>
    <setting-component ref="settingComponentRef" @confrim="confrimSetting" />
  </a-modal>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'

// 接口导入
import generate from '@/api/system/generate'
import dataMaintain from '@/api/system/dataMaintain'
import commonApi from '@/api/common'
import menuApi from '@/api/system/menu'
import roleApi from '@/api/system/role'
import { dictType } from '@/api/system/dict'

import SettingComponent from './settingComponent.vue'

// 导入变量
import * as vars from '../js/vars.js'

const record = ref({})
const loading = ref(true)
const visible = ref(false)
const activeTab = ref('base_config')
const settingComponentRef = ref()

const notNeedSettingComponents = ref([
  'text', 'password', 'textarea', 'formGroup', 'inputTag', 'mention', 'rate',
  'userInfo',
])

const form = ref({
  generate_menus: ['save', 'update' , 'read', 'delete' , 'recycle', 'changeStatus', 'numberOperation', 'import', 'export'],
  columns: [],
})

const formRef = ref()

const emit = defineEmits(['success'])

// form扩展组
const formOptions = ref({})
// 菜单列表
const menus = ref([])
// 角色列表
const roles = ref([])
// 字典列表
const dicts = ref([])
// 表列表
const tables = ref([])
// 模块信息
const modules = ref([])

const open = async (id) => {
  visible.value = true
  const response = await generate.readTable({ id })
  record.value = response.data
  init()
  loading.value = false
}

const confrimSetting = (name, value) => {
  form.value.columns.find((item, idx) => {
    if (item.column_name == name) {
      form.value.columns[idx].options = value
    }
  })
  Message.success('组件设置成功')
}

const save = async (done) => {
  const validResult = await formRef.value.validate()
  if (validResult) {
    for (let i in validResult) {
      Message.error(validResult[i].message)
    }
    return false
  }
  form.value.options = formOptions.value
  const response = await generate.update(form.value)
  response && response.success && Message.success(response.message)
  if (response && response.success) {
    emit('success', true)
    done(true)
  }else{
    done(false)
  }
}

// 全选 / 全不选
const handlerAll = (value, type) => form.value.columns.map(item => { item['is_' + type] = value })

const init = () => {
  // 设置form数据
  for (let name in record.value) {
    if (name === 'generate_menus') {
      form.value[name] = record.value[name] ? record.value[name].split(',') : []
    } else {
      form.value[name] = record.value[name]
    }
  }


  if (record.value.component_type === 3) {
    formOptions.value.tag_id = record.value?.options?.tag_id ?? undefined
    formOptions.value.tag_name = record.value?.options?.tag_name ?? undefined
    formOptions.value.tag_view_name = record.value?.options?.tag_view_name ?? undefined
  }

  // 请求表字段
  generate.getTableColumns({ table_id: record.value.id }).then( res => {
    form.value.columns = []
    res.data.map(item => {
      item.is_required = item.is_required === 2
      item.is_insert = item.is_insert === 2
      item.is_edit = item.is_edit === 2
      item.is_list = item.is_list === 2
      item.is_query = item.is_query === 2
      item.is_sort = item.is_sort === 2
      form.value.columns.push(item)
    })
  })
  // 模块列表
  commonApi.getModuleList().then( res => modules.value = res.data )
  // 请求菜单列表
  menuApi.tree({ onlyMenu: true }).then( res => { 
    menus.value = res.data
    menus.value.unshift({ id: 0, value: 0, label: '顶级菜单' })
  })
  // 请求角色列表
  roleApi.getList().then( res => roles.value = res.data )
  // 请求所有数据表
  dataMaintain.getPageList({ pageSize: 999 }).then( res => tables.value = res.data.items )
  // 请求所有字典类型
  dictType.getTypeList({ pageSize: 999 }).then( res => dicts.value = res.data.items )
}

defineExpose({ open })
</script>

<script>
export default { name: 'system:code:update' }
</script>
<style scoped>
:deep(.arco-select-option-content) {
  width: 100%;
}
</style>