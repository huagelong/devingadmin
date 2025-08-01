<template>
  <LockScreen :visible="isLocked" @update:visible="updateVisible" />
  <div class="mr-2 flex justify-end lg:justify-between w-full lg:w-auto">
    <a-space class="mr-0 lg:mr-5" size="medium">
      <a-tooltip :content="$t('sys.search')">
        <a-button :shape="'circle'" @click="() => appStore.searchOpen = true" class="hidden lg:inline">
          <template #icon>
            <icon-search />
          </template>
        </a-button>
      </a-tooltip>
      <a-tooltip content="锁屏">
        <a-button :shape="'circle'" @click="openLockScreen" class="hidden lg:inline">
          <template #icon>
            <icon-lock />
          </template>
        </a-button>
      </a-tooltip>

      <a-tooltip :content="isFullScreen ? $t('sys.closeFullScreen') : $t('sys.fullScreen')">
        <a-button :shape="'circle'" class="hidden lg:inline" @click="screen">
          <template #icon>
            <icon-fullscreen-exit v-if="isFullScreen" />
            <icon-fullscreen v-else />
          </template>
        </a-button>
      </a-tooltip>

      <a-trigger trigger="click">
        <a-button :shape="'circle'">
          <template #icon>
            <a-badge :count="5" dot :dotStyle="{ width: '5px', height: '5px' }"
              v-if="messageStore.messageList.length > 0">
              <icon-notification />
            </a-badge>
            <icon-notification v-else />
          </template>
        </a-button>

        <template #content>
          <message-notification />
        </template>
      </a-trigger>

      <a-tooltip :content="$t('sys.pageSetting')">
        <a-button :shape="'circle'" @click="() => appStore.settingOpen = true" class="hidden lg:inline">
          <template #icon>
            <icon-settings />
          </template>
        </a-button>
      </a-tooltip>

    </a-space>
    <a-dropdown @select="handleSelect" trigger="hover">

      <a-avatar class="bg-blue-500 text-3xl avatar" style="top: -1px;">
        <img
          :src="(userStore.user && userStore.user.avatar) ? $tool.showFile(userStore.user.avatar) : $url + 'avatar.png'" />
      </a-avatar>

      <template #content>
        <a-doption value="userCenter"><icon-user /> {{ $t('sys.userCenter') }}</a-doption>
        <a-doption value="clearCache"><icon-delete /> {{ $t('sys.clearCache') }}</a-doption>
        <a-doption value="clearAll" v-if="userStore.roles.includes('superAdmin')"><icon-lock /> {{ $t('sys.clearAll') }}</a-doption>
        <a-divider style="margin: 5px 0" />
        <a-doption value="logout"><icon-poweroff /> {{ $t('sys.logout') }}</a-doption>
      </template>
    </a-dropdown>

    <a-modal v-model:visible="showLogoutModal" @ok="handleLogout" @cancel="handleLogoutCancel">
      <template #title>{{ $t('sys.logoutAlert') }}</template>
      <div>{{ $t('sys.logoutMessage') }}</div>
    </a-modal>

  </div>
</template>


<script setup>
  import { ref,onMounted, onBeforeUnmount } from 'vue'
  import { useAppStore, useUserStore, useMessageStore } from '@/store'
  import tool from '@/utils/tool'
  import MessageNotification from './components/message-notification.vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { Message } from '@arco-design/web-vue'
  import Msg from '@/ws-serve/msg'
  import { info } from '@/utils/common'
  import commonApi from '@/api/common'
  import LockScreen from '@/components/LockScreen.vue';
  import monitor from '@/api/system/monitor'
  const { t } = useI18n()
  const messageStore = useMessageStore()
  const userStore = useUserStore()
  const appStore  = useAppStore()
  const setting = ref(null)
  const router = useRouter()
  const isFullScreen = ref(false)
  const showLogoutModal = ref(false)
  const isDev = ref(import.meta.env.DEV)
  const isLocked = ref(false);
  isLocked.value = appStore.getIsLocked();

  const updateVisible = (visible) => {
    isLocked.value = visible;
  }

  const openLockScreen = () => {
    appStore.setIsLocked(true);
    isLocked.value = true;
  }

  const handleSelect = async (name) => {
    if (name === 'userCenter') {
      router.push({ name: 'userCenter'})
    }
    if (name === 'clearCache') {
      const res = await commonApi.clearAllCache()
      tool.local.remove('dictData')
      res.success && Message.success(res.message)
    }
    if (name === 'clearAll') {
      const res = await monitor.clear()
      tool.local.remove('dictData')
      res.success && Message.success(res.message)
    }
    if (name === 'logout') {
      showLogoutModal.value = true
      document.querySelector('#app').style.filter = 'grayscale(1)'
    }
  }

  const handleLogout = async () => {
    await userStore.logout()
    document.querySelector('#app').style.filter = 'grayscale(0)'
    router.push({name:'login'})
  }

  const handleLogoutCancel = () => {
    document.querySelector('#app').style.filter = 'grayscale(0)'
  }

  const screen = () => {
    tool.screen(document.documentElement)
    isFullScreen.value = !isFullScreen.value
  }

  if (appStore.ws) {
    const Wsm = new Msg()
    Wsm.ws.on("ev_new_message", (data, ws) => {
      if (data.d.length > messageStore.messageList.length) {
        info('新消息提示', '您有新的消息，请注意查收！')
      }
      messageStore.messageList = data.d
    });
  }

</script>
<style scoped>
:deep(.arco-avatar-text) {
  top: 1px;
}

:deep(.arco-divider-horizontal) {
  margin: 5px 0;
}

.avatar {
  cursor: pointer;
  margin-top: 6px;
}
</style>
