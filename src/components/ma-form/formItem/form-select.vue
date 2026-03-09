<template>
  <ma-form-item v-if="(typeof props.component.display == 'undefined' || props.component.display === true)"
    :component="props.component" :custom-field="props.customField">
    <slot :name="`form-${props.component.dataIndex}`" v-bind="props.component">
      <a-select v-model:model-value="value" :options="props.component.data ?? dictList[dictIndex] ?? []"
        :multiple="props.component.multiple" :size="props.component.size"
        :allow-clear="props.component.allowClear ?? true" :disabled="props.component.disabled"
        :readonly="props.component.readonly" :error="props.component.error"
        :placeholder="props.component.placeholder ?? `请选择${props.component.title}`" :loading="props.component.loading"
        :allow-search="props.component.allowSearch ?? true" :allow-create="props.component.allowCreate"
        :max-tag-count="props.component.maxTagCount" :bordered="props.component.bordered"
        :unmount-on-close="props.component.unmountOnClose" :popup-container="props.component.popupContainer"
        :filter-option="props.component.filterOption" :virtual-list-props="props.component.virtualListProps"
        :trigger-props="props.component.triggerProps" :format-label="props.component.formatLabel"
        :fallback-option="props.component.fallbackOption" :show-extra-options="props.component.showExtraOptions"
        :value-key="props.component.valueKey" :search-delay="props.component.searchDelay" :limit="props.component.limit"
        :field-names="props.component.fieldNames" :scrollbar="props.component.scrollbar"
        @input-value-change="handleInputValueChange" @change="handleCascaderChangeEvent($event)"
        @remove="rv('onRemove', $event)" @popup-visible-change="rv('onPopupVisibleChange', $event)"
        @dropdown-scroll="rv('onDropdownScroll')" @dropdown-reach-bottom="rv('onDropdownReachBottom')"
        @exceed-limit="rv('onExceedLimit', $event)" @search="handleRemoteSearch">
        <template #header v-if="props.component.multiple && props.component.selectAll === true">
          <div style="padding: 6px 12px;">
            <a-space>
              <a-checkbox :value="false" @change="handleSelectAll">全选/清除</a-checkbox>
              <a-button size="mini" type="outline" @click="handleInverse">反选</a-button>
            </a-space>
          </div>
        </template>
        <template #footer v-if="props.component?.dict?.openPage ?? false">
          <div class="flex justify-center">
            <a-pagination class="p-2" size="mini" :total="dataTotal"
              :page-size="props.component.dict.pageOption.pageSize" simple @change="handlePage">
              <template #page-item-step="{ type }">
                <div>{{ type === 'previous' ? '上一页' : '下一页' }}</div>
              </template>
            </a-pagination>
          </div>
        </template>
      </a-select>
    </slot>
  </ma-form-item>
</template>

<script setup>
import { ref, inject, onMounted, nextTick, watch } from 'vue'
import MaFormItem from './form-item.vue'
import { get, isUndefined, set, xor, isObject, indexOf } from 'lodash'
import { runEvent } from '../js/event.js'
import { handlerCascader, loadDict } from '../js/networkRequest.js'
import { remoteTranslate } from '@/utils/remoteTranslate.js'

const props = defineProps({
  component: Object,
  customField: { type: String, default: undefined }
})

if (isObject(props.component.dict)) {
  props.component.dict.pageOption = {
    page: 1,
    pageSize: props.component?.dict?.pageOption?.pageSize ?? props.component?.dict?.pageSize ?? 15
  }
}

const formModel = inject('formModel')
const dictList  = inject('dictList')
const formLoading = inject('formLoading')
const columns = inject('columns')
const getColumnService= inject('getColumnService')
const rv = async (ev, value = undefined) => await runEvent(props.component, ev, { formModel, getColumnService, columns }, value)

const index = props.customField ?? props.component.dataIndex
const dictIndex = index.match(/^(\w+\.)\d+\./) ? index.match(/^(\w+\.)\d+\./)[1] + props.component.dataIndex : props.component.dataIndex
const value = ref(get(formModel.value, index, ''))
const dataTotal = ref(0)

watch( () => get(formModel.value, index), vl => value.value = vl )
watch( () => value.value, v => {
  set(formModel.value, index, v)
  index.indexOf('.') > -1 && delete formModel.value[index]
} )
watch( () => dictList.value[index] , async v => {
  dataTotal.value = v?.pageInfo?.total || 0
})

if (value.value === '') {
  value.value = undefined
} else if (! isUndefined(value.value) && props.component.dict && (props.component.dict.name || props.component.dict.data) && !props.component.multiple) {
  value.value = value.value + ''
}

const handleSelectAll = (status) => {
  if (isUndefined(value.value)) {
    value.value = []
  }
  if (status) {
    dictList.value[dictIndex].map(item=>{
      if(indexOf(value.value, item.value) === -1) {
        value.value.push(item.value)
      }
    })
  } else {
    value.value = []
  }
}

const handleInverse = () => {
  if (isUndefined(value.value)) {
    value.value = []
  }
  const ids = []
  dictList.value[dictIndex].map( item => ids.push(item.value) )
  value.value = xor(ids, value.value)
}

const handlePage = async (page) => {
  props.component.dict.pageOption.page = page
  await loadDict(dictList.value, props.component)
}

const handleCascaderChangeEvent = async (value) => {
  formLoading.value = true
  const component = props.component
  // 执行自定义事件
  if (component.onChange) {
    rv('onChange', value)
  }

  // 处理联动
  if (! index.match(/^(\w+)\.\d+\./)) {
    await handlerCascader(value, component, columns.value, dictList.value, formModel.value)
  }
  nextTick(() => formLoading.value = false)
}

// 远程搜索处理
const handleRemoteSearch = async (searchValue) => {
  // 如果不是远程搜索模式，使用原有逻辑
  if (!props.component.dict?.remoteSearch) {
    rv('onSearch', searchValue)
    return
  }

  // 远程搜索模式
  if (!searchValue || searchValue.length < 2) {
    dictList.value[dictIndex] = []
    return
  }

  try {
    // 直接使用remoteSearch配置
    const remoteConfig = props.component.dict.remoteSearch
    const searchResult = await remoteTranslate.search(searchValue, remoteConfig)
    
    // 获取字段映射配置
    const labelField = remoteConfig.searchProps?.labelField || 'name'
    const valueField = remoteConfig.searchProps?.valueField || 'id'
    
    dictList.value[dictIndex] = searchResult.map(item => ({
      label: item[labelField],
      value: item[valueField],
      disabled: false
    }))
  } catch (error) {
    console.error('远程搜索失败:', error)
    dictList.value[dictIndex] = []
  }
}

// 输入值变化处理
const handleInputValueChange = (value) => {
  if (props.component.dict?.remoteSearch) {
    // 远程搜索模式下，输入变化时触发搜索
    handleRemoteSearch(value)
  } else {
    rv('onInputValueChange', value)
  }
}

// 加载初始值的翻译
const loadInitialTranslation = async () => {
  if (!props.component.dict?.remoteSearch) return
  
  const currentValue = value.value
  if (!currentValue) return
  
  const remoteConfig = props.component.dict.translationQuery
  const translationUrl = remoteConfig.translationUrl
  
  if (!translationUrl) return
  
  try {
    // 确保是数组格式
    const ids = Array.isArray(currentValue) ? currentValue.filter(id => id) : [currentValue]
    
    if (ids.length === 0) return
    
    const translations = await remoteTranslate.translateIds(ids, remoteConfig)
    
    // 将翻译结果转换为选项格式
    const options = ids.map(id => ({
      label: translations[id] || id,
      value: id,
      disabled: false
    }))
    
    dictList.value[dictIndex] = options
  } catch (error) {
    console.error('加载初始翻译失败:', error)
  }
}

rv('onCreated')
onMounted(async () => {
  // 如果是远程搜索模式且有初始值，加载翻译
  await loadInitialTranslation()
})
</script>
