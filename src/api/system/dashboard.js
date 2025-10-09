import { request } from '@/utils/request.js';

/**
 * 仪表板 API JS
 */

export default {
  /**
   * 获取仪表板统计数据
   * @returns
   */
  getStatistics() {
    return request({
      url: 'system/dashboard/statistics',
      method: 'get',
    });
  },

  /**
   * 获取仪表板登录图表数据
   * @param {number} days 天数，默认10天
   * @returns
   */
  getLoginChart(days = 10) {
    return request({
      url: 'system/dashboard/loginChart',
      method: 'get',
      params: { days },
    });
  },
};