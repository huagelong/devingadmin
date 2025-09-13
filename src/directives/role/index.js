import role from './role';

const checkRole = (el, binding) => {
  const { value } = binding;
  
  if (Array.isArray(value)) {
    if (value.length > 0) {
      let isHas = false;
      value.forEach((item) => {
        if (!isHas) {
          isHas = role(item);
        }
      });
      
      // 控制元素的显示/隐藏
      if (!isHas) {
        el.style.display = 'none';
        el.setAttribute('data-role-hidden', 'true');
      } else {
        el.style.display = '';
        el.removeAttribute('data-role-hidden');
      }
    } else {
      // 如果角色数组为空，默认显示
      el.style.display = '';
      el.removeAttribute('data-role-hidden');
    }
  } else {
    throw new Error(`need role! Like v-role="['seo', 'cfo']"`);
  }
};

export default {
  mounted(el, binding) {
    checkRole(el, binding);
  },
  updated(el, binding) {
    checkRole(el, binding);
  },
};
