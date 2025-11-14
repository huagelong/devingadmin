// js api
// @Link  https://github.com/huagelong/devinggo
// @Copyright  Copyright (c) 2024 devinggo
// @Author  Kai <hpuwang@gmail.com>
// @License  https://github.com/huagelong/devinggo/blob/master/LICENSE

import { request } from '@/utils/request.js'

export default {

/**
* 获取qaCategory列表
* @returns
*/
getPageList (params = {}) {
    return request({
        url: 'qa/qaCategory/index',
        method: 'get',
        params
    })
},

/**
* 获取qaCategory选择树
* @returns
*/
tree () {
    return request({
        url: 'qa/qaCategory/tree',
        method: 'get'
    })
},

/**
* 从回收站获取qaCategory数据列表
* @returns
*/
getPageRecycleList (params = {}) {
    return request({
        url: 'qa/qaCategory/recycle',
        method: 'get',
        params
    })
},

getRecycleList (params = {}) {
    return request({
        url: 'qa/qaCategory/recycleList',
        method: 'get',
        params
    })
},

/**
* 恢复qaCategory数据
* @returns
*/
recoverys (data) {
    return request({
        url: 'qa/qaCategory/recovery',
        method: 'put',
        data
    })
},

/**
* 真实删除qaCategory
* @returns
*/
realDeletes (data) {
    return request({
        url: 'qa/qaCategory/realDelete',
        method: 'delete',
        data
    })
},

/**
* 添加qaCategory
* @returns
*/
save (data = {}) {
    return request({
        url: 'qa/qaCategory/save',
        method: 'post',
        data
    })
},

/**
* 更新qaCategory数据
* @returns
*/
update (id, data = {}) {
    return request({
        url: 'qa/qaCategory/update/' + id,
        method: 'put',
        data
    })
},

/**
* 读取qaCategory
* @returns
*/
read (id) {
    return request({
        url: 'qa/qaCategory/read/' + id,
        method: 'get'
    })
},

/**
* 将qaCategory删除，有软删除则移动到回收站
* @returns
*/
deletes (data) {
    return request({
        url: 'qa/qaCategory/delete',
        method: 'delete',
        data
    })
},

/**
* 更改qaCategory数据
* @returns
*/
changeStatus (data = {}) {
    return request({
        url: 'qa/qaCategory/changeStatus',
        method: 'put',
        data
    })
},

/**
* 修改qaCategory数值数据，自增自减
* @returns
*/
numberOperation (data = {}) {
    return request({
        url: 'qa/qaCategory/numberOperation',
        method: 'put',
        data
    })
},

}