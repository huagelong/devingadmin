<template>
  <div class="markdown-editor">
    <div ref="editorEl" :style="{ height: props.height + 'px' }"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '@/store'
import tool from '@/utils/tool'
import uploadConfig from '@/config/upload'

// 引入 Vditor
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const env = import.meta.env
const appStore = useAppStore()

const props = defineProps({
  modelValue: { type: String },
  height: { type: Number, default: 400 },
  placeholder: { type: String, default: '请输入内容...' }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 编辑器实例
const editorInstance = ref(null)
const editorEl = ref(null)
const isUpdating = ref(false) // 更新锁，防止并发调用
const isInitialized = ref(false) // 编辑器初始化完成标志

// 获取上传 URL（根据环境配置）
const getUploadUrl = () => {
  // 使用相对路径或代理路径，避免跨域问题
  return `${env.VITE_APP_PROXY_PREFIX}/system/uploadImage`
}

// 文件名校验和处理函数
const processFileName = (name) => {
  return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '')
    .replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '')
    .replace(/\s/g, '')
}

// 初始化编辑器
onMounted(() => {
  console.log(getUploadUrl());
  if (editorEl.value) {
    editorInstance.value = new Vditor(editorEl.value, {
      height: props.height,
      placeholder: props.placeholder,
      lang: 'zh_CN',
      toolbarConfig: {
        pin: true,
      },
      cache: {
        enable: false,
      },
      preview: {
        delay: 500,
      },
      input: (value) => {
        if (isUpdating.value) {
          return // 如果正在更新中，忽略 input 事件
        }
        emit('update:modelValue', value)
        emit('change', value)
      },
      // 参考 https://b3log.org/vditor/demo/advanced-upload.html
      upload: {
        accept: 'image/*,.mp3,.wav,.rar',
        url: getUploadUrl(),
        fieldName: 'image',
        // 请求头：携带认证 token
        headers: {
          Authorization: 'Bearer ' + tool.getToken(),
         'Content-Type': 'multipart/form-data'
        },
        // 额外参数
        extraData: {
          type:'file',
          isChunk: false
        },
        // 文件名处理
        filename: processFileName,
        // 格式化服务器响应为 Vditor 期望的格式
        format: (files, responseText) => {
          try {
            console.log('上传响应:', responseText)
            const res = JSON.parse(responseText)

            // 服务器返回格式: { code, message, data: { url, storage_mode, ... } }
            if (res.code === 200 && res.data) {
              const url = tool.attachUrl(res.data.url, uploadConfig.storageMode[res.data.storage_mode])
              const fileName = files[0]?.name || 'image.png'
              return JSON.stringify({
                msg: '',
                code: 0,
                data: {
                  errFiles: [],
                  succMap: {
                    [processFileName(fileName)]: url
                  }
                }
              })
            } else {
              return JSON.stringify({
                msg: res.message || '上传失败',
                code: 1,
                data: {
                  errFiles: [files[0]?.name || 'unknown'],
                  succMap: {}
                }
              })
            }
          } catch (e) {
            console.error('解析上传响应失败:', e)
            return JSON.stringify({
              msg: '解析响应失败',
              code: 1,
              data: {
                errFiles: [files[0]?.name || 'unknown'],
                succMap: {}
              }
            })
          }
        },
        // 上传失败回调
        error: (msg) => {
          console.error('上传失败:', msg)
          // 获取更详细的错误信息
          if (msg) {
            try {
              const errObj = JSON.parse(msg)
              console.error('错误详情:', errObj)
            } catch (e) {
              console.error('错误信息:', msg)
            }
          }
        }
      },
      after: () => {
        // 编辑器初始化完成后的回调
        // 设置初始值
        if (props.modelValue && editorInstance.value) {
          try {
            editorInstance.value.setValue(props.modelValue)
          } catch (error) {
            console.warn('Failed to set initial markdown value:', error)
          }
        }
        // 标记编辑器初始化完成
        isInitialized.value = true
      }
    })
  }
})

// 销毁编辑器
onUnmounted(() => {
  if (editorInstance.value) {
    try {
      editorInstance.value.destroy()
    } catch (error) {
      console.warn('Error destroying editor:', error)
    }
    editorInstance.value = null
  }
  isInitialized.value = false
})

// 监听传入值的变化
watch(
  () => props.modelValue,
  newValue => {
    // 如果编辑器未初始化，则跳过
    if (!isInitialized.value || !editorInstance.value || isUpdating.value) {
      return
    }

    const currentContent = editorInstance.value.getValue()
    const stringValue = newValue != null ? String(newValue) : ''

    if (stringValue === currentContent) {
      return
    }

    // 使用更新锁
    isUpdating.value = true

    // 延迟执行，确保DOM更新完成
    nextTick(() => {
      try {
        // 检查编辑器实例是否仍然存在且有效
        if (editorInstance.value && typeof editorInstance.value.setValue === 'function') {
          editorInstance.value.setValue(stringValue)
        }
      } catch (error) {
        console.warn('Failed to set markdown:', error)
      } finally {
        // 延迟释放锁，确保编辑器内部状态稳定
        setTimeout(() => {
          isUpdating.value = false
        }, 100)
      }
    })
  },
  { flush: 'post' }
)
</script>
