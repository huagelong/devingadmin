<template>
  <ma-form-item v-if="(typeof props.component.display == 'undefined' || props.component.display === true)"
    :component="props.component" :custom-field="props.customField">
    <slot :name="`form-${props.component.dataIndex}`" v-bind="props.component">
      <a-cascader v-model="value" :path-mode="props.component.pathMode"
        :placeholder="props.component.placeholder || `请选择${props.component.title}`"
        :allow-clear="props.component.allowClear ?? true" :allow-search="props.component.allowSearch ?? true"
        :size="props.component.size" :disabled="props.component.disabled" :multiple="props.component.multiple"
        :options="props.component.options ?? dictList[dictIndex] ?? []" :input-value="props.component.inputValue"
        :default-input-value="props.component.defaultInputValue" :popup-visible="props.component.popupVisible"
        :default-popup-visible="props.component.defaultPopupVisible" :expand-trigger="props.component.expandTrigger"
        :filter-option="props.component.filterOption" :popup-container="props.component.popupContainer"
        :max-tag-count="props.component.maxTagCount" :format-label="props.component.formatLabel"
        :trigger-props="props.component.triggerProps" :check-strictly="props.component.checkStrictly"
        :load-more="props.component.loadMore" :loading="props.component.loading"
        :search-option-only-label="props.component.searchOptionOnlyLabel" :search-delay="props.component.searchDelay"
        :field-names="props.component.fieldNames ?? props.component?.dict?.props ?? { key: 'value', title: 'label' }"
        :value-key="props.component.valueKey" :fallback="props.component.fallback"
        :expand-child="props.component.expandChild" @change="rv('onChange', $event)" @search="rv('onSearch', $event)"
        @input-value-change="rv('onInputValueChange', $event)"
        @popup-visible-change="rv('onPopupVisibleChange', $event)" @clear="rv('onClear')" @focus="rv('onFocus')"
        @blur="rv('onBlur')">
      </a-cascader>
    </slot>
  </ma-form-item>
</template>

<script setup>
import { ref, inject, onMounted, watch } from 'vue'
import { get, set } from 'lodash'
import MaFormItem from './form-item.vue'
import { runEvent } from '../js/event.js'

const props = defineProps({
  component: Object,
  customField: { type: String, default: undefined }
})

const formModel = inject('formModel')
const dictList = inject('dictList')
const getColumnService= inject('getColumnService')
const columns = inject('columns')
const rv = async (ev, value = undefined) => await runEvent(props.component, ev, { formModel, getColumnService, columns }, value)
const index = props.customField ?? props.component.dataIndex
const dictIndex = index.match(/^(\w+\.)\d+\./) ? index.match(/^(\w+\.)\d+\./)[1] + props.component.dataIndex : props.component.dataIndex
const value = ref(get(formModel.value, index))

watch( () => get(formModel.value, index), vl => value.value = vl )
watch( () => value.value, v => {
  set(formModel.value, index, v)
  index.indexOf('.') > -1 && delete formModel.value[index]
} )

if (props.component.dict && (props.component.dict.name || props.component.dict.data) && !value.value && !props.component.multiple && !props.component.pathMode) {
  value.value = value.value + ''
}

rv('onCreated')
onMounted(() => rv('onMounted') )
</script>