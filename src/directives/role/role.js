import { useUserStore } from '@/store';

const role = (name) => {
  try {
    const userStore = useUserStore();
    
    // 检查用户角色是否存在
    if (!userStore.roles) {
      return false;
    }
    
    // 检查是否为超级管理员
    if (userStore.roles.includes('superAdmin')) {
      return true;
    }
    
    // 检查是否拥有指定角色
    return userStore.roles.includes(name);
  } catch (error) {
    return false;
  }
};

// 添加获取用户角色的辅助方法
role.getUserRoles = () => {
  try {
    const userStore = useUserStore();
    return userStore.roles || [];
  } catch (error) {
    return [];
  }
};

export default role;
