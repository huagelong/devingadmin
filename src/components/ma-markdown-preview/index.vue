<template>
  <div ref="previewEl" class="markdown-preview vditor-reset"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const previewEl = ref(null)

const renderMarkdown = () => {
  if (previewEl.value) {
    if (!props.modelValue) {
        previewEl.value.innerHTML = ''
        return
    }
    Vditor.preview(previewEl.value, props.modelValue, {
      mode: 'light',
      theme: {
        current: 'light',
      },
      hljs: {
        style: 'github',
      },
    })
  }
}

onMounted(() => {
  renderMarkdown()
})

watch(() => props.modelValue, () => {
  renderMarkdown()
})
</script>

<style scoped>
.markdown-preview {
    width: 100%;
    overflow-x: auto;
}
</style>
