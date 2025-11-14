<!--vue.js template for generating resource-->
<!--@Link  https://github.com/huagelong/devinggo-->
<!--@Copyright  Copyright (c) 2024 devinggo-->
<!--@Author Kai <hpuwang@gmail.com>-->
<!--@License  https://github.com/huagelong/devinggo/blob/master/LICENSE-->

<template>
    <div class="ma-content-block lg:flex justify-between p-4">
        <!-- CRUD 组件 -->
        <ma-crud :options="options" :columns="columns" ref="crudRef">
            
                <template #sort="{ record }">
                    <a-input-number :default-value="record.sort" mode="button" @change="changeSort($event,record.id)" :min="0"
                                    :max="1000" />
                </template>
            
            <template #status="{ record }">
                <a-switch :checked-value="1" unchecked-value="2" @change="switchStatus($event, record)"
                          :default-checked="record.status == 1" />
            </template>
            
        </ma-crud>
    </div>
</template>
<script setup>
    import { ref, reactive } from 'vue'
    import qaCategory from '@/api/qa/qaCategory'
    import { Message } from '@arco-design/web-vue'
    import tool from '@/utils/tool'
    import * as common from '@/utils/common'
    const crudRef = ref()
    
    const changeSort = (newValue, id, numberName) => {
        qaCategory.numberOperation({ id, numberName: 'sort', numberValue: newValue }).then( res => {
            if (res.success) {
                Message.success(res.message)
                // 刷新列表数据
                // common.refreshTag()
                // crudRef.value.refresh()
            }
        }).catch( e => { console.log(e) } )
    }
    
    const switchStatus = (status, record) => {
        qaCategory.changeStatus({ id: record.id, status }).then( res => {
            if (res.success) {
                Message.success(res.message)
                // 刷新列表数据
                // common.refreshTag()
                // crudRef.value.refresh()
            }
        }).catch( e => { console.log(e) } )
    }
    
    const options = reactive({
	add: {
		api: qaCategory.save,
		auth: [
			"qa:qaCategory:save"
		],
		show: true
	},
	api: qaCategory.getPageList,
	delete: {
		api: qaCategory.deletes,
		auth: [
			"qa:qaCategory:delete"
		],
		realApi: qaCategory.realDeletes,
		realAuth: [
			"qa:qaCategory:realDelete"
		],
		show: true
	},
	edit: {
		api: qaCategory.update,
		auth: [
			"qa:qaCategory:update"
		],
		show: true
	},
	formOption: {
		viewType: 'modal',
		width: 600
	},
	id: 'qa_category',
	operationColumn: true,
	operationColumnWidth: 160,
	pk: 'id',
	recovery: {
		api: qaCategory.recoverys,
		auth: [
			"qa:qaCategory:recovery"
		],
		show: true
	},
	recycleApi: qaCategory.getPageRecycleList,
	rowSelection: {
		showCheckedAll: true
	}
})
    const columns = reactive([
	{
		addDisplay: true,
		commonRules: {
			message: "请输入上级分类",
			required: true
		},
		dataIndex: "parent_id",
		editDisplay: true,
		formType: "tree-select",
		hide: true,
		dict: { url: 'qa/qaCategory/tree' },
		addDefaultValue: 0,
		search: false,
		sortable: {},
		title: "上级分类"
	},
	{
		addDisplay: false,
		commonRules: {
			message: "请输入层级",
			required: false
		},
		dataIndex: "level",
		editDisplay: false,
		formType: "input",
		hide: true,
		search: false,
		sortable: {},
		title: "层级"
	},
	{
		addDisplay: true,
		commonRules: {
			message: "请输入分类名称",
			required: true
		},
		dataIndex: "name",
		editDisplay: true,
		formType: "input",
		hide: false,
		search: true,
		sortable: {},
		title: "分类名称"
	},
	{
		addDisplay: false,
		commonRules: {
			message: "请输入Id",
			required: false
		},
		dataIndex: "id",
		editDisplay: false,
		formType: "input",
		hide: false,
		roles: [
			"maxAdmin"
		],
		search: true,
		sortable: {
			sortDirections: [
				"ascend",
				"descend"
			],
			sorter: true
		},
		title: "Id"
	},
	{
		addDisplay: true,
		commonRules: {
			message: "请输入状态",
			required: true
		},
		dataIndex: "status",
		dict: {
			name: "data_status",
			props: {
				label: "title",
				value: "key"
			},
			translation: true
		},
		editDisplay: true,
		formType: "select",
		hide: false,
		search: true,
		sortable: {
			sortDirections: [
				"ascend",
				"descend"
			],
			sorter: true
		},
		title: "状态"
	},
	{
		addDisplay: true,
		commonRules: {
			message: "请输入排序",
			required: true
		},
		dataIndex: "sort",
		editDisplay: true,
		formType: "input",
		hide: false,
		search: false,
		sortable: {},
		title: "排序"
	},
	{
		addDisplay: false,
		commonRules: {
			message: "请输入创建人",
			required: false
		},
		dataIndex: "created_by_related.nickname",
		editDisplay: false,
		formType: "input",
		hide: false,
		search: false,
		sortable: {},
		title: "创建人"
	},
	{
		addDisplay: false,
		commonRules: {
			message: "请输入修改人",
			required: false
		},
		dataIndex: "updated_by",
		editDisplay: false,
		formType: "input",
		hide: true,
		search: false,
		sortable: {},
		title: "修改人"
	},
	{
		addDisplay: false,
		commonRules: {
			message: "请输入创建时间",
			required: false
		},
		dataIndex: "created_at",
		editDisplay: false,
		formType: "input",
		hide: false,
		search: false,
		sortable: {},
		title: "创建时间"
	},
	{
		addDisplay: false,
		commonRules: {
			message: "请输入",
			required: false
		},
		dataIndex: "updated_at",
		editDisplay: false,
		formType: "input",
		hide: true,
		search: false,
		sortable: {},
		title: ""
	},
	{
		addDisplay: false,
		commonRules: {
			message: "请输入",
			required: false
		},
		dataIndex: "deleted_at",
		editDisplay: false,
		formType: "input",
		hide: true,
		search: false,
		sortable: {},
		title: ""
	},
	{
		addDisplay: true,
		commonRules: {
			message: "请输入备注",
			required: false
		},
		dataIndex: "remark",
		editDisplay: true,
		formType: "input",
		hide: false,
		search: false,
		sortable: {},
		title: "备注"
	}
])
</script>
<script> export default { name: 'qa_qaCategory' } </script>
