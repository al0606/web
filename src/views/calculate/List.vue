<template>
  <page-header-wrapper title="计算规则">
    <template slot="tags">
      <a-tag color="green">
        材料数量： {{ rule.combinationSize }}
      </a-tag>
    </template>
    <template slot="extra">
      <a-tag color="#1890ff" @click="$refs.ruleList.open()">
        切换 <a-icon type="swap" />
      </a-tag>
      <a-popconfirm
          title="是否确认运算"
          @confirm="handleCalculate"
      >
        <a-tag color="#1890ff">
          运算 <a-icon type="caret-right" />
        </a-tag>
      </a-popconfirm>
    </template>
    <template slot="content">
      <a-row type="flex">
        <a-statistic title="商品类型" :value="rule.goodsTypeName" />
        <a-statistic title="商品等级" :style="{ margin: '0 32px' }">
          <template slot="formatter">
            <span :style="{ color: levelColors[rule.goodsLevel] || '#e4ae39' }">{{ rule.goodsLevelName }}</span>
          </template>
        </a-statistic>
        <a-statistic title="默认磨损" suffix="%" :value="rule.defaultWear * 100" />
        <a-statistic title="成本价" prefix="￥" :value="rule.costPrice" :style="{ margin: '0 32px' }" />
        <a-statistic title="期望价值" prefix="￥" :value="rule.desiredValue" />
        <a-statistic title="成功概率" suffix="%" :value="rule.successRate * 100" :style="{ margin: '0 32px' }">
          <template slot="formatter">
            <span :style="{ color: rule.successRate > 0.5 ? 'green' : 'red' }">{{ rule.successRate * 100 }}</span>
          </template>
        </a-statistic>
        <a-statistic title="材料格式" :value="rule.repeatedNum"/>
      </a-row>
    </template>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keydown.native.enter="() => $refs.table.refresh(true)">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="是否收藏">
                <a-select v-model="queryParam.mark" placeholder="请选择" allowClear>
                  <a-select-option value="0">未收藏</a-select-option>
                  <a-select-option value="1">已收藏</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <a-alert :showIcon="true" style="margin: 10px 0">
          <template slot="message">
            <span style="margin-right: 12px">共 <a style="font-weight: 600">{{ this.totalCount || 0 }}</a> 条数据</span>
          </template>
        </a-alert>
        <div class="table-operator">
          <a-popconfirm
              title="是否确认删除"
              @confirm="handleDelete()"
          >
            <a-button v-if="selectedRowKeys.length > 0" type="primary" icon="plus">批量删除</a-button>
          </a-popconfirm>
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
          :showAlertInfo="true"
          :expandRowByClick="true"
          :scroll="{  x: true }"
      >
        <span slot="costPrice" slot-scope="text">
          ￥{{ text }}
        </span>
        <span slot="simPrice" slot-scope="text, record">
          <span :style="{ color: text > record.costPrice ? '#87d068' : '#f50', fontWeight: 'bold' }">￥{{ text }}</span>
        </span>
        <span slot="desiredValue" slot-scope="text">
          <span :style="{ color: text > 0 ? '#87d068' : '#f50', fontWeight: 'bold' }">￥{{ text }}</span>
        </span>
        <span slot="rate" slot-scope="text">
          <span :style="{ color: text > 0.8 ? '#87d068' : '#f50', fontWeight: 'bold' }">{{ text * 100 }}%</span>
        </span>
        <span slot="maximumLoss" slot-scope="text">
          ￥{{ text }}
        </span>
        <span slot="maximumProfit" slot-scope="text">
          ￥{{ text }}
        </span>
        <a-descriptions
            slot="expandedRowRender"
            slot-scope="pText"
            :bordered="true"
            :column="2"
        >
          <a-descriptions-item label="总成本">
            ￥{{ pText.costPrice }}
            <a-tag
                v-if="pText.changeCostPrice && pText.changeCostPrice !== pText.costPrice"
                :color="pText.changeCostPrice > pText.costPrice ? 'red' : 'green'"
            >￥{{ pText.changeCostPrice }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="总磨损">
            {{ pText.totalWear}}
          </a-descriptions-item>
          <a-descriptions-item span="2" label="材料">
            <span>
              磨损区间：<a-tag :color="item.color" v-for="item in wearType" :key="item.code">{{ item.minWear }} - {{ item.maxWear }}</a-tag>
            </span>
            <a-collapse :activeKey="activeKey" :bordered="false" :destroyInactivePanel="true">
              <a-collapse-panel v-for="item in pText.materialsVos" :key="item.id" :showArrow="false" style="margin-top: 5px;">
                <template slot="header">
                  <a-row>
                    <a-col :span="12">
                      <a-tag color="blue">{{ item.boxName }}</a-tag>
                      <a-tag :color="wearTagColors[item.wearType]">{{ item.wearTypeName }} | {{ item.defaultWear }}</a-tag>
                      <a-tag>X{{ item.count }} </a-tag>
                      <a-tag color="#108ee9">X{{ item.price }}</a-tag>
                    </a-col>
                    <a-col :span="5">
                      <a-slider
                          :value="item.defaultWear"
                          :min="0"
                          :max="1"
                          :step="0.0001"
                          @change="changeDefaultWear(pText, item, $event)"
                      />
                    </a-col>
                    <a-col :span="2">
                      <a-input-number
                          @change="changeDefaultWear(pText, item, $event)"
                          :value="item.defaultWear"
                          :min="0"
                          :max="1"
                          :step="0.0001"
                      />
                    </a-col>
                    <a-col :span="5">
                      <a-input-number
                          @change="changePrice(pText, item, $event)"
                          :value="item.price"
                          :step="0.01"
                          style="margin-left: 30px;"
                      />
                    </a-col>
                  </a-row>
                </template>
                <p v-for="goods in item.collectGoodsVos" :key="goods.id" style="margin-bottom: 5px;">
                  <a-row>
                    <a-col :span="12">
                    <a-tag color="purple">{{ goods.goodsName }} 【{{ goods.minWear }} - {{ goods.maxWear }}】</a-tag>
                    <a-tag :color="wearTagColors[goods.wearType]">{{ goods.wearTypeName }} | {{ goods.defaultWear }}</a-tag>
                    <a-tag :color="goods.minPrice > item.price ? '#f50' : '#87d068'">{{ goods.minPrice }} </a-tag>
                    </a-col>
                    <a-col :span="12">
                      <template v-if="goods.changeDefaultWear && goods.defaultWear !== goods.changeDefaultWear">
                        ====>
                        <a-tag :color="wearTagColors[goods.changeWearType]">{{ goods.changeWearTypeName }} | {{ goods.changeDefaultWear }}</a-tag>
                      </template>
                      <template v-if="goods.changeWearType && goods.wearType !== goods.changeWearType">
                        <a-tag
                            v-if="goods.changeMinPrice && goods.changeMinPrice !== goods.minPrice"
                            :color="goods.changeMinPrice > goods.minPrice ? '#f50' : '#87d068'"
                        >{{ goods.changeMinPrice }} </a-tag>
                      </template>
                    </a-col>
                  </a-row>
                </p>
              </a-collapse-panel>
            </a-collapse>
          </a-descriptions-item>
          <a-descriptions-item label="模拟结果">
            ￥{{ pText.simPrice }}
            <a-tag
                v-if="pText.changeSimPrice && pText.changeSimPrice !== pText.simPrice"
                :color="pText.changeSimPrice < pText.simPrice ? 'red' : 'green'"
            >￥{{ pText.changeSimPrice }}</a-tag>
            <a-tag>{{ pText.desiredValue }}</a-tag>
          </a-descriptions-item>

          <a-descriptions-item label="平均磨损">
            {{ pText.totalWear / 10 }} (实际运算磨损)
          </a-descriptions-item>

          <a-descriptions-item label="结果">
            <span>
              磨损区间：<a-tag :color="item.color" v-for="item in wearType" :key="item.code">{{ item.minWear }} - {{ item.maxWear }}</a-tag>
            </span>
            <template v-for="item in pText.resultVos">
              <div :key="item.id" style="margin-top: 5px;">
                <a-row>
                  <a-col :span="16">
                    <template>
                      <a-tag color="blue">{{ item.boxName }}</a-tag>
                      <a-tag color="purple">{{ item.goodsName }} 【{{ item.minWear }} - {{ item.maxWear }}】</a-tag>
                      <a-tag :color="wearTagColors[item.wearType]">{{ item.wearTypeName }} | {{ item.wear }}</a-tag>
                      <a-tag :color="item.price > pText.costPrice ? '#87d068' : '#f50'">{{ item.price }} </a-tag>
                      <a-tag color="#2db7f5">{{ item.rate * 100 }}%</a-tag>
                      <br/>
                    </template>
                  </a-col>
                  <a-col :span="8">
                    <template v-if="item.changeWear && item.wear !== item.changeWear">
                        ====>
                        <a-tag :color="wearTagColors[item.changeWearType]">{{ item.changeWearTypeName }} | {{ item.changeWear }}</a-tag>
                    </template>
                    <template v-if="item.changeWearType && item.wearType !== item.changeWearType">
                      <a-tag
                          v-if="item.changePrice && item.changePrice !== item.price"
                          :color="item.changePrice < item.price ? '#f50' : '#87d068'"
                      >{{ item.changePrice }} </a-tag>
                    </template>
                  </a-col>
                </a-row>
              </div>
            </template>
          </a-descriptions-item>
        </a-descriptions>
        <span slot="action" slot-scope="text, record">
          <a-tooltip placement="top">
            <template slot="title">
              <span>{{ record.mark ? '取消收藏' : '收藏' }}</span>
            </template>
            <a-icon
                type="star"
                :theme="record.mark ? 'filled' : 'outlined'"
                :style="{ color: '#108ee9' }"
                @click="handleCollect(record)"
            />
          </a-tooltip>
        </span>
      </s-table>
    </a-card>
    <rule-list ref="ruleList" @close="changeRule"></rule-list>
  </page-header-wrapper>
</template>

<script>
import { STable } from '@/components'
import { getEnable, contractList, calculate, getPrice, collect, delBatchContract } from '@/api/calculate'
import RuleList from '@/views/calculate/modules/RuleList.vue'
import { WEAR_TYPES, LEVEL_COLORS, WEAR_TAG_COLORS } from '@/utils/csgo'

export default {
  name: 'CalculateList',
  components: { STable, RuleList },
  data () {
    return {
      wearType: WEAR_TYPES,
      levelColors: LEVEL_COLORS,
      wearTagColors: WEAR_TAG_COLORS,
      pageSize: 20,
      totalCount: 0,
      loading: false,
      activeKey: [],
      rule: {},
      columns: [
        { title: '成本价', dataIndex: 'costPrice', scopedSlots: { customRender: 'costPrice' }, sorter: (a, b) => a.costPrice - b.costPrice },
        { title: '模拟价格', dataIndex: 'simPrice', scopedSlots: { customRender: 'simPrice' }, sorter: (a, b) => a.simPrice - b.simPrice },
        { title: '期望值', dataIndex: 'desiredValue', scopedSlots: { customRender: 'desiredValue' }, sorter: (a, b) => a.desiredValue - b.desiredValue },
        { title: '盈利概率', dataIndex: 'rate', scopedSlots: { customRender: 'rate' }, sorter: (a, b) => a.rate - b.rate },
        { title: '最大亏损', dataIndex: 'maximumLoss', scopedSlots: { customRender: 'maximumLoss' }, sorter: (a, b) => a.maximumLoss - b.maximumLoss },
        { title: '最大盈利', dataIndex: 'maximumProfit', scopedSlots: { customRender: 'maximumProfit' }, sorter: (a, b) => a.maximumProfit - b.maximumProfit },
        { title: '偏度', dataIndex: 'skewness', sorter: (a, b) => a.skewness - b.skewness },
        { title: '夏普比率', dataIndex: 'sharpeRatio', sorter: (a, b) => a.sharpeRatio - b.sharpeRatio },
        { title: '上行倍数', dataIndex: 'upward', sorter: (a, b) => a.upward - b.upward },
        { title: '平均磨损', dataIndex: 'avgWear', scopedSlots: { customRender: 'avgWear' }, sorter: (a, b) => a.avgWear - b.avgWear },
        {
          title: '操作',
          dataIndex: 'action',
          width: '100px',
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ],
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        this.loading = true
        const requestParameters = Object.assign({ }, parameter, this.queryParam)
        return contractList(requestParameters)
            .then(res => {
              this.totalCount = res.total
              return res
            }).finally(() => {
              this.loading = false
            })
      },
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
  created () {
    this.load()
  },
  methods: {
    load () {
      return getEnable().then(res => {
        this.rule = res
      })
    },
    changeRule () {
      this.load().finally(() => {
        this.$refs.table.refresh(true)
      })
    },
    /**
     * 计算合约
     */
    handleCalculate () {
      calculate().then(res => {
        this.$message.success('启动运算')
      })
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    changePrice (pText, record, e) {
      record.price = e
      pText.costPrice = pText.materialsVos.reduce((acc, cur) => acc + cur.price * cur.count, 0)
    },
    changeDefaultWear (pText, record, e) {
      this.activeKey.push(record.id)
      record.defaultWear = e
      pText.totalWear = pText.materialsVos.reduce((acc, cur) => acc + cur.defaultWear * cur.count, 0)
      record.collectGoodsVos.forEach(goodsVo => {
        // 相对默认磨损值 = 合约商品默认磨损值 * (最大磨损值 - 最小磨损值) + 最小磨损值
        goodsVo.changeDefaultWear = record.defaultWear * (goodsVo.maxWear - goodsVo.minWear) + goodsVo.minWear
        goodsVo.changeWearType = this.wearType.findIndex(item => item.minWear < goodsVo.changeDefaultWear && goodsVo.changeDefaultWear <= item.maxWear) + 1
        goodsVo.changeWearTypeName = this.wearType[goodsVo.changeWearType - 1].name
        if (goodsVo.changeWearType !== goodsVo.wearType) {
          this.handleGetPrice(goodsVo, 'changeMinPrice')
          this.$forceUpdate()
        } else {
          goodsVo.changeMinPrice = goodsVo.minPrice
        }
      })
      pText.changeCostPrice = pText.materialsVos.reduce((acc, cur) => acc + cur.changeMinPrice * cur.count, 0)
      pText.resultVos.forEach(resultVo => {
        resultVo.changeWear = pText.totalWear / 10 * (resultVo.maxWear - resultVo.minWear) + resultVo.minWear
        resultVo.changeWearType = this.wearType.findIndex(item => item.minWear < resultVo.changeWear && resultVo.changeWear <= item.maxWear) + 1
        resultVo.changeWearTypeName = this.wearType[resultVo.changeWearType - 1].name
        if (resultVo.changeWearType !== resultVo.wearType) {
          this.handleGetPrice(resultVo, 'changePrice')
          this.$forceUpdate()
        } else {
          resultVo.changePrice = resultVo.price
        }
      })
      pText.changeSimPrice = pText.resultVos.reduce((acc, cur) => acc + cur.changePrice * cur.rate, 0)
    },
    /**
     * 查询商品价格
     * @param goodsId
     * @param wearType
     * @returns {*}
     */
    handleGetPrice (record, priceField) {
      getPrice(record.goodsId, record.changeWearType).then(res => {
       record[priceField] = res.price
      })
    },
    handleDelete () {
      delBatchContract({ ids: this.selectedRowKeys }).then(res => {
        if (res) {
          this.$message.success('删除成功')
        }
      }).finally(() => {
        this.$refs.table.refresh(true)
      })
    },
    handleCollect (record) {
      if (record.mark) return
      const materials = record.materialsVos.map(item => ({
        collectBoxId: item.collectBoxId,
        wear: item.changeDefaultWear || item.defaultWear,
        price: item.price
      }))
      collect({ contractId: record.id, materials }).then(res => {
        if (res) {
          this.$message.success('收藏成功')
        }
      }).finally(() => {
        this.$refs.table.refresh(true)
      })
    }
  }
}
</script>
