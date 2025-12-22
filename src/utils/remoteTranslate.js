// 远程翻译工具模块
import { request } from '@/utils/request.js'

class RemoteTranslate {
    constructor() {
        this.translations = {} // 临时存储翻译结果
    }

    /**
     * 批量翻译ID为名称
     * @param {Array} ids - ID数组
     * @param {Object} remoteConfig - 远程配置
     * @returns {Promise<Object>} - 返回{id: name}格式的对象
     */
    async translateIds(ids, remoteConfig) {
        if (!ids || !ids.length) return {}
        
        const { translationProps = {}, translationUrl } = remoteConfig
        
        // 定义默认的字段名
        const labelField = translationProps.labelField || 'name'
        const valueField = translationProps.valueField || 'id'
        
        try {
            let response
            
            // 使用translationUrl进行批量查询，支持自定义ids参数字段名称
            if (translationUrl) {
              const requestData = {}
             if (translationProps && typeof translationProps === 'object') {
                if(translationProps.idsField){
                    requestData[translationProps.idsField] = ids
                }
                                // 添加其他过滤条件
                Object.keys(translationProps).forEach(key => {
                  if (key !== 'idsField' && key !== 'labelField' && key !== 'valueField') {
                    requestData[key] = translationProps[key]
                  }
                })
             }else{
                requestData["ids"] = ids
             }

              response = await request({
                  url: translationUrl,
                  method: 'post',
                  data: requestData
              })
            }
            
            if (response && response.success && response.data) {
                const translations = {}
                // 处理返回的数据格式
                if (Array.isArray(response.data)) {
                    response.data.forEach(item => {
                        translations[item[valueField]] = item[labelField]
                    })
                } else if (typeof response.data === 'object') {
                    // 假设返回格式是 {id: {id, name}}
                    Object.values(response.data).forEach(item => {
                        translations[item[valueField]] = item[labelField]
                    })
                }
                
                return translations
            }
        } catch (error) {
            console.error('Remote translation failed:', error)
        }
        
        return {}
    }

    /**
     * 搜索功能
     * @param {String} keyword - 搜索关键词
     * @param {Object} remoteConfig - 远程配置
     * @returns {Promise<Array>} - 返回搜索结果数组
     */
    async search(keyword, remoteConfig) {
        const { searchProps = {}, searchUrl } = remoteConfig
        
        try {
            let response
            
            // 使用list_url进行搜索，支持自定义props配置
            if (searchUrl) {
              const params = {}
              
              // 处理props配置
              if (searchProps && typeof searchProps === 'object') {
                if (searchProps.searchField) {
                  // 如果指定了searchField字段
                  params[searchProps.searchField] = keyword
                } else {
                  // 默认使用keyword作为搜索字段
                  params.keyword = keyword
                }
                
                // 添加其他过滤条件
                Object.keys(searchProps).forEach(key => {
                  if (key !== 'searchField' && key !== 'labelField' && key !== 'valueField') {
                    params[key] = searchProps[key]
                  }
                })
              } else {
                // 默认使用keyword作为搜索字段
                params.keyword = keyword
              }
              
              response = await request({
                  url: searchUrl,
                  method: 'get',
                  params
              })
            }
            
            if (response && response.success && response.data) {
                return response.data
            }
        } catch (error) {
            console.error('Remote search failed:', error)
        }
        
        return []
    }

    /**
     * 处理表格数据翻译
     * @param {Array} data - 表格数据
     * @param {Array} columns - 列配置
     * @returns {Promise<Array>} - 返回翻译后的数据
     */
    async translateTableData(data, columns) {
        if (!data || !data.length) return data
        
        // 找到需要远程翻译的列（支持translationUrl配置）
        const remoteColumns = columns.filter(col => col.translationQueryConfig && col.translationQueryConfig.translationUrl)
        if (!remoteColumns.length) return data
        
        // 收集所有需要翻译的ID
        const translationPromises = []
        
        remoteColumns.forEach(column => {
            const ids = []
            const { dataIndex, translationQueryConfig } = column
            
            data.forEach(row => {
                const value = row[dataIndex]
                if (Array.isArray(value)) {
                    ids.push(...value)
                } else if (value) {
                    ids.push(value)
                }
            })
            
            if (ids.length) {
                const uniqueIds = [...new Set(ids)]
                translationPromises.push(
                    this.translateIds(uniqueIds, translationQueryConfig).then(translations => ({
                        dataIndex,
                        translations
                    }))
                )
            }
        })
        
        // 等待所有翻译完成
        const translationResults = await Promise.all(translationPromises)
        
        // 应用翻译结果到数据
        data.forEach(row => {
            translationResults.forEach(({ dataIndex, translations }) => {
                const value = row[dataIndex]
                if (Array.isArray(value) && value.length > 0) {
                    row[`${dataIndex}_labels`] = value.map(id => translations[id] || id)
                } else if (value && translations[value]) {
                    row[`${dataIndex}_label`] = translations[value]
                }
            })
        })
        
        return data
    }
}

// 创建单例实例
const remoteTranslate = new RemoteTranslate()

export { remoteTranslate }