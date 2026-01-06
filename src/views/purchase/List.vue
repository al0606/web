<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keydown.native.enter="() => $refs.table.refresh(true)">
          <a-row :gutter="48">
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
            <template v-if="advanced">
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
        <a-alert :showIcon="true" style="margin: 10px 0">
          <template slot="message">
            <span style="margin-right: 12px">共 <a style="font-weight: 600">{{ this.totalCount || 0 }}</a> 条数据</span>
          </template>
        </a-alert>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :pageSize="pageSize"
        showPagination="auto"
        :loading="loading"
        :showAlertInfo="true"
        :expandRowByClick="true"
      >
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
        <span slot="price" slot-scope="text">
          <span style="color: #87d068; font-weight: bold;">￥{{ text }}</span>
        </span>
        <span slot="action" slot-scope="text, record">
          <a-popover :title="false" @visibleChange="(flag) => flag ? checkWear(record) : null" trigger="click">
            <a-tooltip placement="top">
              <template slot="title">
                <span>查看磨损</span>
              </template>
              <a-icon type="control" :style="{ color: '#108ee9' }"/>
            </a-tooltip>
            <template slot="content">
              <p v-for="goods in record.goodsList" :key="goods.id">
                <a-row>
                  <a-col :span="12">
                    <a-tag color="purple">{{ goods.goodsName }} 【{{ goods.minWear }} - {{ goods.maxWear }}】</a-tag>
                    <a-tag
                        :color="goods.wearType === 1 ? 'cyan' :
                        goods.wearType === 2 ? 'green' :
                        goods.wearType === 3 ? 'orange' :
                        goods.wearType === 4 ? 'pink' : 'red'"
                    >{{ goods.wearTypeName }} | {{ goods.wear }} 【{{ goods.realWear }}】</a-tag>
                  </a-col>
                  <a-col :span="6">
                    <a-slider
                        :value="goods.wear"
                        :min="goods.minWear"
                        :max="goods.maxWear"
                        :step="0.0001"
                        @change="changeWear(goods, $event)"
                    />
                  </a-col>
                  <a-col :span="4">
                    <a-input-number
                        @change="changeWear(goods, $event)"
                        :value="goods.wear"
                        :min="goods.minWear"
                        :max="goods.maxWear"
                        :step="0.0001"
                    />
                  </a-col>
                </a-row>
              </p>
            </template>
          </a-popover>
          <a-divider type="vertical"/>
          <a-popconfirm
              title="是否确认删除"
              @confirm="handleDelete(record)"
          >
            <a>
              <a-tooltip title="删除">
                <a-icon type="delete" title="删除" style="color: #f00"/>
              </a-tooltip>
            </a>
          </a-popconfirm>
        </span>
      </s-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { purchaseList, findGoodsWear, del } from '@/api/purchase'

const wearType = [
  { code: 1, name: '崭新出厂', minWear: 0, maxWear: 0.07, color: 'cyan' },
  { code: 2, name: '略有磨损', minWear: 0.07, maxWear: 0.15, color: 'green' },
  { code: 3, name: '久经沙场', minWear: 0.15, maxWear: 0.38, color: 'orange' },
  { code: 4, name: '破损不堪', minWear: 0.38, maxWear: 0.45, color: 'pink' },
  { code: 5, name: '战痕累累', minWear: 0.45, maxWear: 1, color: 'red' }
]

export default {
  name: 'PurchaseList',
  components: {
    STable,
    Ellipsis
  },
  data () {
    return {
      wearType,
      pageSize: 20,
      totalCount: 0,
      columns: [
        { title: '箱子名称', dataIndex: 'boxName' },
        { title: '等级', dataIndex: 'levelName', scopedSlots: { customRender: 'levelName' } },
        { title: '类型', dataIndex: 'typeName', scopedSlots: { customRender: 'typeName' } },
        { title: '磨损类型', dataIndex: 'wearTypeName', scopedSlots: { customRender: 'wearTypeName' } },
        { title: '磨损度', dataIndex: 'wear' },
        { title: '价格', dataIndex: 'price', scopedSlots: { customRender: 'price' }, sorter: (a, b) => a.minPrice - b.minPrice },
        { title: '已采购数量', dataIndex: 'count' },
        {
          title: '操作',
          dataIndex: 'action',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      loading: false,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => this.doLoadData(parameter)
    }
  },
  methods: {
    doLoadData (parameter) {
      this.loading = true
      const requestParameters = Object.assign({}, parameter, this.queryParam)
      return purchaseList(requestParameters)
          .then(res => {
            this.totalCount = res.total
            return res
          }).finally(() => {
            this.expandedRowKeys = []
            this.loading = false
          })
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    checkWear (record) {
      findGoodsWear(record.id).then(res => {
        this.$set(record, 'goodsList', res)
      })
    },
    changeWear (record, e) {
      record.wear = e
      record.realWear = 1 / (record.maxWear - record.minWear) * (record.wear - record.minWear)
      const wt = this.wearType.find(item => item.minWear <= record.wear && record.wear < item.maxWear)
      record.wearType = wt.code
      record.wearTypeName = wt.name
    },
    handleDelete (record) {
      del(record.id).then(res => {
        this.$message.success('删除成功')
        this.$refs.table.refresh()
      })
    }
  }
}
</script>

<style scoped>
</style>
