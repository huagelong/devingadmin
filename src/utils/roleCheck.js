import { useUserStore } from '@/store';

/**
 * 检查用户是否拥有指定角色权限
 * @param {string|Array} roles - 角色名称或角色数组
 * @returns {boolean} - 是否拥有权限
 */
export const hasRole = (roles) => {
  try {
    const userStore = useUserStore();
    
    // 如果用户角色列表为空，返回 false
    if (!userStore.roles || !Array.isArray(userStore.roles)) {
      return false;
    }
    
    // 超级管理员拥有所有权限
    if (userStore.roles.includes('superAdmin')) {
      return true;
    }
    
    // 如果 roles 为空或未定义，默认允许访问
    if (!roles || (Array.isArray(roles) && roles.length === 0)) {
      return true;
    }
    
    // 转换为数组处理
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    // 检查是否拥有任一指定角色
    return roleArray.some(role => userStore.roles.includes(role));
  } catch (error) {
    return false;
  }
};

/**
 * 获取当前用户角色列表
 * @returns {Array} - 用户角色数组
 */
export const getUserRoles = () => {
  try {
    const userStore = useUserStore();
    return userStore.roles || [];
  } catch (error) {
    return [];
  }
};
