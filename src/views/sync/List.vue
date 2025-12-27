<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
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
              <a-col :md="6" :sm="24">
                <a-form-item label="最低价格">
                  <a-input v-model="queryParam.minPrice" placeholder="请输入最低价格"/>
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
        <a-button-group>
          <a-button type="primary" icon="sync" @click="handleSyncAll" :loading="syncLoading">一键同步</a-button>
          <a-popover :title="false" @visibleChange="(flag) => flag ? queryBox(null) : null" trigger="click">
            <a-tooltip placement="top">
              <template slot="title">
                <span>同步箱子</span>
              </template>
              <a-button type="primary" icon="down" />
            </a-tooltip>
            <template slot="content">
              <a-form layout="inline">
                <a-form-item>
                  <a-input-search placeholder="输入箱子名称" style="width: 200px" @search="queryBox">
                    <a-button slot="enterButton" type="primary">
                      <a-icon type="reload" />
                    </a-button>
                  </a-input-search>
                </a-form-item>
                <a-badge status="success" text="最近8小时内同步"  style="margin: 10px;"/>
                <a-badge status="error" text="未同步" />
              </a-form>
              <a-table
                  ref="boxTable"
                  :columns="boxColumns"
                  :data-source="boxList"
                  :scroll="{  x: 450, y: 240 }"
                  :pagination="false"
                  :loading="boxLoading"
                  rowKey="id"
              >
                <span slot="name" slot-scope="text, record">
                  <span :style="{ 'color': record.type === 1 ? 'blue' : 'orange', 'font-weight': 'bold' }">|</span> {{ text }}
                </span>
                <span slot="syncTime" slot-scope="text">
                  <a-badge :status="isWithinLast8Hours(text) ? 'success' : 'error'" :text="text" />
                </span>
                <span slot="action" slot-scope="text, record">
                  <template>
                    <a @click="handleSyncBox(record.id)">同步</a>
                  </template>
                </span>
              </a-table>
            </template>
          </a-popover>
        </a-button-group>
        <a-tooltip placement="top">
          <template slot="title">
            <span>汇总</span>
          </template>
          <a-button type="primary" icon="bar-chart" @click="handleCollect" :loading="collectLoading"></a-button>
        </a-tooltip>
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
        @expand="handleExpand"
      >
        <span slot="boxName" slot-scope="text, record">
          {{ text }}
          <a-badge
            :count="record.count"
            :number-style="{
              backgroundColor: '#e6fffb',
              color: '#13c2c2',
              boxShadow: '0 0 0 1px #87e8de inset',
            }"
          />
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
        <span slot="minPrice" slot-scope="text">
          <span style="color: #87d068; font-weight: bold;">￥{{ text }}</span>
        </span>
        <span slot="action" slot-scope="text, record">
          <a-tooltip placement="top">
            <template slot="title">
              <span>同步数据</span>
            </template>
            <a-icon type="sync" :style="{ color: '#108ee9' }" @click="handleSyncBox(record.boxId)" />
          </a-tooltip>
        </span>
        <a-table
            slot="expandedRowRender"
            slot-scope="pText"
            rowKey="id"
            :columns="innerColumns"
            :data-source="pText.innerData"
            :pagination="false"
            :loading="innerLoading"
            @change="handleSorter"
        >
          <span slot="goodsName" slot-scope="text, record">
            {{ text }} <span style="color: red">{{ record.maxWear }} - {{ record.minWear }}</span>
          </span>
          <span slot="wtName" slot-scope="text, record">
            <a-tag
                :color="record.wearType === 1 ? 'cyan' :
                            record.wearType === 2 ? 'green' :
                            record.wearType === 3 ? 'orange' :
                            record.wearType === 4 ? 'pink' : 'red'"
            >{{ text }}</a-tag>
          </span>
          <span slot="minWear" slot-scope="text, record">
            <span style="font-weight: bold;">{{ text }}</span>
            <span
                style="font-size: 12px;"
                v-if="text !== record.realMinimumWear"
            > | {{ record.realMinimumWear }}</span>
          </span>
          <span slot="maxWear" slot-scope="text, record">
            <span style="font-weight: bold;">{{ text }}</span>
            <span
                style="font-size: 12px;"
                v-if="text !== record.realMaximumWear"
            > | {{ record.realMaximumWear }}</span>
          </span>
          <span slot="mPrice" slot-scope="text">
            <span :style="{ color: pText.minPrice === text ? '#87d068' : '', fontWeight: 'bold'}">￥{{ text }}</span>
          </span>
          <span slot="buffPrice" slot-scope="text">
            <span style="font-weight: bold;">￥{{ text }} </span>
          </span>
          <span slot="steamPrice" slot-scope="text, record">
            <span style="font-weight: bold;">￥{{ record.stprice }} </span>
            <span style="font-size: 12px; text-decoration: line-through;">￥{{ text }} </span>
          </span>
        </a-table>
      </s-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import { queryBox, syncBox, syncAll, collect, collectList, getGoodsList } from '@/api/sync'

const columns = [
  { title: '箱子名称', dataIndex: 'boxName', scopedSlots: { customRender: 'boxName' } },
  { title: '等级', dataIndex: 'levelName', scopedSlots: { customRender: 'levelName' } },
  { title: '类型', dataIndex: 'typeName', scopedSlots: { customRender: 'typeName' } },
  { title: '磨损类型', dataIndex: 'wearTypeName', scopedSlots: { customRender: 'wearTypeName' } },
  { title: '最小磨损', dataIndex: 'minimumWear' },
  { title: '最大磨损', dataIndex: 'maximumWear' },
  { title: '最低价格', dataIndex: 'minPrice', scopedSlots: { customRender: 'minPrice' }, sorter: (a, b) => a.minPrice - b.minPrice },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'SyncList',
  components: {
    STable,
    Ellipsis
  },
  data () {
    this.columns = columns
    return {
      visible: false,
      pageSize: 20,
      totalCount: 0,
      loading: false,
      // 高级搜索 展开/关闭
      advanced: false,
      boxColumns: [
        { title: '箱子名称', dataIndex: 'name', scopedSlots: { customRender: 'name' } },
        { title: '同步时间', dataIndex: 'syncTime', scopedSlots: { customRender: 'syncTime' }, sorter: (a, b) => moment(a.syncTime) - moment(b.syncTime) },
        { title: '操作', dataIndex: 'action', width: '80px', scopedSlots: { customRender: 'action' } }
      ],
      boxList: [],
      queryBoxParam: {},
      boxLoading: false,
      syncLoading: false,
      collectLoading: false,
      innerColumns: [
        { title: '名称',
          dataIndex: 'goodsName',
          width: '200px',
          customRender: (() => {
            let prevName = null
            return (value, row) => {
              if (!row.rowSpan) {
                return { children: value }
              }
              if (value !== prevName) {
                prevName = value
                return { children: <a-tooltip placement="top">
                                    <template slot="title">
                                      <span>磨损区间：{row.minWear} - {row.maxWear}</span>
                                    </template>
                                    {value}
                                  </a-tooltip>,
                  attrs: { rowSpan: row.rowSpan } }
              } else {
                return { children: value, attrs: { rowSpan: 0 } } // 合并行
              }
            }
          })()
        },
        { title: '磨损类型', dataIndex: 'wearTypeName', scopedSlots: { customRender: 'wtName' } },
        { title: '最小磨损', dataIndex: 'minimumWear', scopedSlots: { customRender: 'minWear' } },
        { title: '最大磨损', dataIndex: 'maximumWear', scopedSlots: { customRender: 'maxWear' } },
        { title: 'BUFF价格', dataIndex: 'buffPrice', scopedSlots: { customRender: 'buffPrice' }, sorter: (a, b) => a.buffPrice - b.buffPrice },
        { title: 'STEAM价格', dataIndex: 'steamPrice', scopedSlots: { customRender: 'steamPrice' }, sorter: (a, b) => a.stprice - b.stprice },
        { title: '最低价格', dataIndex: 'minPrice', scopedSlots: { customRender: 'mPrice' }, sorter: (a, b) => a.minPrice - b.minPrice }
      ],
      innerLoading: false,
      // 查询参数
      queryParam: {
        type: '1'
      },
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => this.doLoadData(parameter)
    }
  },
  methods: {
    doLoadData (parameter) {
      this.loading = true
      const requestParameters = Object.assign({}, parameter, this.queryParam)
      return collectList(requestParameters)
          .then(res => {
            this.totalCount = res.total
            return res
          }).finally(() => {
            this.loading = false
          })
    },
    // 检查时间是否在最近8小时内
    isWithinLast8Hours (timeString) {
      if (!timeString) return false
      const eightHoursAgo = moment().subtract(8, 'hours')
      return moment(timeString).isAfter(eightHoursAgo)
    },
    // 搜索
    queryBox (value) {
      this.boxLoading = true
      this.queryBoxParam.name = value
      queryBox(this.queryBoxParam).then(res => {
        this.boxList = res
      }).finally(() => {
        this.boxLoading = false
      })
    },
    // 同步单个箱子
    handleSyncBox (boxId) {
      this.boxLoading = true
      syncBox(boxId).then(res => {
        this.$message.info('已发送同步请求')
      }).finally(() => {
        this.boxLoading = false
      })
    },
    // 一键同步所有箱子
    handleSyncAll () {
      this.syncLoading = true
      syncAll().then(res => {
        this.$message.info('已发送同步请求')
      }).finally(() => {
        this.syncLoading = false
      })
    },
    // 汇总所有盒子数据
    handleCollect () {
      this.collectLoading = true
      collect().then(res => {
        this.$message.info('已发送汇总请求')
      }).finally(() => {
        this.collectLoading = false
      })
    },
    // 展开/收起商品详情
    handleExpand (e, record) {
      if (!e) return
      this.innerLoading = true
      getGoodsList({ collectId: record.id, minPrice: this.queryParam.minPrice }).then(res => {
        res.forEach(item => {
          item.rowSpan = res.filter(i => i.goodsName === item.goodsName).length
        })
        this.$set(record, 'innerData', res)
      }).finally(() => {
        this.innerLoading = false
      })
    },
    handleSorter (pagination, filters, sorter, { currentDataSource }) {
      currentDataSource.forEach(item => {
        const span = currentDataSource.filter(i => i.goodsName === item.goodsName).length
        item.rowSpan = !sorter.order ? span : null
      })
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    }
  }
}
</script>

<style scoped>
</style>
