<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keydown.native.enter="() => $refs.table.refresh(true)">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="商品名称">
                <a-input v-model="queryParam.goodsName" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="备注">
                <a-input v-model="queryParam.remark" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="已备注">
                <a-select v-model="queryParam.isRemark" placeholder="请选择" allowClear>
                  <a-select-option value="1">是</a-select-option>
                  <a-select-option value="0">否</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col :md="6" :sm="24">
                <a-form-item label="箱子名称">
                  <a-input v-model="queryParam.boxName" placeholder=""/>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="等级">
                  <a-select v-model="queryParam.level" placeholder="请选择" allowClear>
                    <a-select-option value="1">消费级</a-select-option>
                    <a-select-option value="2">工业级</a-select-option>
                    <a-select-option value="3">军规级</a-select-option>
                    <a-select-option value="4">受限级</a-select-option>
                    <a-select-option value="5">保密级</a-select-option>
                    <a-select-option value="6">隐秘级</a-select-option>
                    <a-select-option value="7">违禁级</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="磨损类型">
                  <a-select v-model="queryParam.wearType" placeholder="请选择" allowClear>
                    <a-select-option value="1">崭新出厂</a-select-option>
                    <a-select-option value="2">略有磨损</a-select-option>
                    <a-select-option value="3">久经沙场</a-select-option>
                    <a-select-option value="4">破损不堪</a-select-option>
                    <a-select-option value="5">战痕累累</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="类型">
                  <a-select v-model="queryParam.type" placeholder="请选择" default-value="1" allowClear>
                    <a-select-option value="1">普通</a-select-option>
                    <a-select-option value="2">StartTrak</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 6 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <div class="table-operator">
          <a-button type="primary" icon="plus" @click="$refs.warehouseForm.open()">新建</a-button>
          <a-popconfirm
              title="是否确认删除"
              @confirm="handleDelete()"
          >
            <a-button v-if="selectedRowKeys.length > 0" type="danger" icon="minus">批量删除</a-button>
          </a-popconfirm>
          <a-button v-if="selectedRowKeys.length > 0" type="primary" icon="clock-circle" @click="handleConsume">批量消耗</a-button>
          <a-input-search style="width: 300px;" v-if="selectedRowKeys.length > 0" placeholder="请输入备注" @search="handleRemark">
            <a-button slot="enterButton" type="primary" icon="form">批量备注</a-button>
          </a-input-search>
        </div>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :pageSize="pageSize"
        :rowSelection="rowSelection"
        showPagination="auto"
        :loading="loading"
        :alert="true"
        :scroll="{  x: true }"
      >
        <span slot="goodsName" slot-scope="text, record">
          <a-tag color="purple">{{ record.goodsName }} 【{{ record.minWear }} - {{ record.maxWear }}】</a-tag>
        </span>
        <span slot="levelName" slot-scope="text, record">
          <a-badge
              :color="record.level === 1 ? '#b0c3d9' :
                record.level === 2 ? '#5e98d9' :
                record.level === 3 ? '#4b69ff' :
                record.level === 4 ? '#8847ff' :
                record.level === 5 ? '#d32ce6' :
                record.level === 6 ? '#eb4b4b' : '#e4ae39'"
          ></a-badge>{{ text }}
        </span>
        <span slot="typeName" slot-scope="text, record">
          <template v-if="record.type === 2">⭐️</template>
          <span style="color: #2db7f5;" v-else>|===</span>
          {{ text }}
          <template v-if="record.type === 2">⭐️</template>
          <span style="color: #2db7f5;" v-else>===|</span>
        </span>
        <span slot="wearTypeName" slot-scope="text, record">
          <a-tag
              :color="record.wearType === 1 ? 'cyan' :
                          record.wearType === 2 ? 'green' :
                          record.wearType === 3 ? 'orange' :
                          record.wearType === 4 ? 'pink' : 'red'"
          >{{ text }}</a-tag>
        </span>
        <span slot="price" slot-scope="text, record">
          <span style="color: #87d068; font-weight: bold; margin-right: 8px;">
            <a-input-number
              v-if="record.priceInput"
              style="width: 100px"
              :formatter="value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value.replace(/￥\s?|(,*)/g, '')"
              v-model="record.price"
              @pressEnter="handleEdit(record)"
              @blur="handleEdit(record)"
            />
            <span v-else>￥{{ text }}</span>
          </span>
          <a-icon type="edit" style="color: #2db7f5; cursor: pointer;" @click="$set(record, 'priceInput', true)"/>
        </span>
        <span slot="wear" slot-scope="text, record">
          <a-input-number
              v-if="record.wearInput"
              style="width: 100px"
              :max="record.maxWear"
              :min="record.minWear"
              :step="0.0001"
              v-model="record.wear"
              @pressEnter="handleEdit(record)"
              @blur="handleEdit(record)"
          />
          <span v-else>
            <span style="font-weight: bold;">{{ text }}</span>
          </span>
          <a-icon type="edit" style="color: #2db7f5; cursor: pointer;" @click="$set(record, 'wearInput', true)"/>
        </span>
        <span slot="remark" slot-scope="text, record">
          <span style="margin-right: 8px;">
            <a-input
                v-if="record.remarkInput"
                style="width: 100px"
                v-model="record.remark"
                @pressEnter="handleEdit(record)"
                @blur="handleEdit(record)"
            />
            <span v-else>{{ text }}</span>
          </span>
          <a-icon type="edit" style="color: #2db7f5; cursor: pointer;" @click="$set(record, 'remarkInput', true)"/>
        </span>
      </s-table>
    </a-card>
    <warehouse-form ref="warehouseForm" @ok="handleOk" />
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import WarehouseForm from '@/views/warehouse/modules/WarehouseForm.vue'
import { warehouseList, delBatchWarehouse, saveWarehouse, updateBatchRemark, updateBatchHandlingTime } from '@/api/warehouse'

const wearType = [
  { code: 1, name: '崭新出厂', minWear: 0, maxWear: 0.07, color: 'cyan' },
  { code: 2, name: '略有磨损', minWear: 0.07, maxWear: 0.15, color: 'green' },
  { code: 3, name: '久经沙场', minWear: 0.15, maxWear: 0.38, color: 'orange' },
  { code: 4, name: '破损不堪', minWear: 0.38, maxWear: 0.45, color: 'pink' },
  { code: 5, name: '战痕累累', minWear: 0.45, maxWear: 1, color: 'red' }
]

export default {
  name: 'WarehouseList',
  components: {
    WarehouseForm,
    STable,
    Ellipsis
  },
  data () {
    return {
      wearType,
      pageSize: 100,
      totalCount: 0,
      columns: [
        { title: '箱子名称', dataIndex: 'boxName' },
        { title: '商品名称', dataIndex: 'goodsName', scopedSlots: { customRender: 'goodsName' } },
        { title: '等级', dataIndex: 'levelName', scopedSlots: { customRender: 'levelName' } },
        { title: '类型', dataIndex: 'typeName', scopedSlots: { customRender: 'typeName' } },
        { title: '磨损类型', dataIndex: 'wearTypeName', scopedSlots: { customRender: 'wearTypeName' } },
        { title: '磨损度', dataIndex: 'wear', needTotal: true, scopedSlots: { customRender: 'wear' }, sorter: (a, b) => a.wear - b.wear },
        { title: '真实磨损度', dataIndex: 'realWear', needTotal: true, scopedSlots: { customRender: 'realWear' }, sorter: (a, b) => a.realWear - b.realWear },
        { title: '价格', dataIndex: 'price', needTotal: true, scopedSlots: { customRender: 'price' }, sorter: (a, b) => a.price - b.price },
        { title: '消耗时间', dataIndex: 'handlingTime' },
        { title: '备注', dataIndex: 'remark', scopedSlots: { customRender: 'remark' }, width: 200, fixed: 'right' }
      ],
      loading: false,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => this.doLoadData(parameter),
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    doLoadData (parameter) {
      this.loading = true
      const requestParameters = Object.assign({}, parameter, this.queryParam)
      return warehouseList(requestParameters)
          .then(res => {
            this.totalCount = res.total
            return res
          }).finally(() => {
            this.$refs.table.clearSelected()
            this.loading = false
          })
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleOk () {
      this.$refs.table.refresh(true)
    },
    changeWear (record, e) {
      record.wear = e
      record.realWear = 1 / (record.maxWear - record.minWear) * (record.wear - record.minWear)
      const wt = this.wearType.find(item => item.minWear <= record.wear && record.wear < item.maxWear)
      record.wearType = wt.code
      record.wearTypeName = wt.name
    },
    handleEdit (record) {
      saveWarehouse({ ...record }).then(res => {
        if (res) {
          this.$message.success('保存成功')
        } else {
          this.$message.error('保存失败')
        }
      }).finally(() => {
        this.$refs.table.refresh(true)
      })
    },
    handleDelete () {
      delBatchWarehouse({ ids: this.selectedRowKeys }).then(res => {
        if (res) {
          this.$message.success('删除成功')
        }
      }).finally(() => {
        this.$refs.table.refresh(true)
      })
    },
    handleConsume () {
      updateBatchHandlingTime({ ids: this.selectedRowKeys }).then(res => {
        if (res) {
          this.$message.success('更新成功')
        }
      }).finally(() => {
        this.$refs.table.refresh(true)
      })
    },
    handleRemark (value) {
      updateBatchRemark({ ids: this.selectedRowKeys, data: value }).then(res => {
        if (res) {
          this.$message.success('更新成功')
        }
      }).finally(() => {
        this.$refs.table.clearSelected()
        this.$refs.table.refresh(true)
      })
    }
  }
}
</script>

<style scoped>
</style>
