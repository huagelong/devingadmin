<template>
  <ma-user-select 
    v-model="internalValue" 
    :text="props.component.text" 
    :multiple="props.component.multiple ?? false"
    :onlyId="props.component.onlyId ?? true" 
    :isEcho="props.component.isEcho ?? true"
    :placeholder="props.component.searchPlaceholder ?? `请选择${props.component.title}`"
  />
</template>

<script setup>
import { ref, inject, watch } from 'vue'
import { get, set, isArray } from 'lodash'
import MaUserSelect from '@/components/ma-user/index.vue'

const props = defineProps({
  component: Object,
})

const searchForm = inject('searchForm')
const multiple = props.component.multiple ?? false

// 内部使用数组格式，ma-user-select 组件需要数组
const internalValue = ref([])
const value = ref(get(searchForm.value, props.component.dataIndex, props.component.searchDefaultValue ?? (multiple ? [] : undefined)))

// 初始化：将表单值转换为内部数组格式
if (value.value !== undefined && value.value !== null && value.value !== '') {
  internalValue.value = isArray(value.value) ? value.value : [value.value]
}

set(searchForm.value, props.component.dataIndex, value.value)

watch(() => get(searchForm.value, props.component.dataIndex), vl => {
  value.value = vl
  // 同步到内部值
  if (vl !== undefined && vl !== null && vl !== '') {
    internalValue.value = isArray(vl) ? vl : [vl]
  } else {
    internalValue.value = []
  }
})

// 监听内部值变化，转换后同步到表单
watch(() => internalValue.value, v => {
  if (!isArray(v) || v.length === 0) {
    // 空值处理
    value.value = multiple ? [] : undefined
  } else if (multiple) {
    // 多选：保持数组格式
    value.value = v
  } else {
    // 单选：只取第一个值
    value.value = v[0]
  }
  set(searchForm.value, props.component.dataIndex, value.value)
}, { deep: true })
</script>
