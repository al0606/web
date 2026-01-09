<template>
  <a-drawer
    title="选择规则"
    :destroyOnClose = true
    :width="850"
    :visible="visible"
    :footer="null"
    :bodyStyle="{ margin: 0, padding: 0 }"
    @close="() => { visible = false; $emit('close') }"
  >
    <a-card :bordered="false">
      <a-button type="primary" icon="plus" @click="addRule">新增</a-button>
      <a-table
          ref="boxTable"
          :columns="columns"
          :data-source="dataList"
          :scroll="{  x: 450, y: 240 }"
          :pagination="false"
          :loading="loading"
          rowKey="id"
      >
        <span slot="goodsLevel" slot-scope="text, record">
            <a-badge
                :color="record.goodsLevel === 1 ? '#b0c3d9' :
                record.goodsLevel === 2 ? '#5e98d9' :
                record.goodsLevel === 3 ? '#4b69ff' :
                record.goodsLevel === 4 ? '#8847ff' :
                record.goodsLevel === 5 ? '#d32ce6' :
                record.goodsLevel === 6 ? '#eb4b4b' : '#e4ae39'"
            ></a-badge>{{ text }}
        </span>
        <span slot="costPrice" slot-scope="text, record">
            ￥ {{ record.costPrice }}
        </span>
        <span slot="defaultWear" slot-scope="text, record">
            {{ record.defaultWear * 100 }} %
        </span>
        <span slot="desiredValue" slot-scope="text, record">
            ￥ {{ record.desiredValue }}
        </span>
        <span slot="successRate" slot-scope="text, record">
            {{ record.successRate * 100 }} %
        </span>
        <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">
             <a-tooltip title="编辑">
               <a-icon type="edit" title="编辑"/>
             </a-tooltip>
          </a>
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
          <a-divider type="vertical"/>
          <a @click="handleCheck(record)">
            <a-tooltip title="选择">
              <a-icon type="check" title="选择"/>
            </a-tooltip>
          </a>
        </template>
      </span>
      </a-table>
    </a-card>
    <rule-form ref="ruleForm" @ok="open"></rule-form>
  </a-drawer>
</template>

<script>
import RuleForm from '@/views/calculate/modules/RuleForm.vue'
import { query, updateEnable, del } from '@/api/calculate'

export default {
  components: {
    RuleForm
  },
  props: {
  },
  data () {
    return {
      visible: false,
      loading: false,
      columns: [
        { title: '规则名称', dataIndex: 'name' },
        { title: '商品类型', dataIndex: 'goodsTypeName' },
        { title: '商品等级', dataIndex: 'goodsLevelName', scopedSlots: { customRender: 'goodsLevel' } },
        { title: '默认磨损', dataIndex: 'defaultWear', scopedSlots: { customRender: 'defaultWear' } },
        { title: '成本价', dataIndex: 'costPrice', scopedSlots: { customRender: 'costPrice' } },
        { title: '期望价值', dataIndex: 'desiredValue', scopedSlots: { customRender: 'desiredValue' } },
        { title: '成功概率', dataIndex: 'successRate', scopedSlots: { customRender: 'successRate' } },
        {
          title: '操作',
          dataIndex: 'action',
          width: '120px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataList: []
    }
  },
  methods: {
    open () {
      this.visible = true
      this.loading = true
      query().then(res => {
        this.dataList = res
      }).finally(() => {
        this.loading = false
      })
    },
    addRule () {
      this.$refs.ruleForm.open()
    },
    handleEdit (record) {
      this.$refs.ruleForm.open(record)
    },
    handleDelete (record) {
      del(record.id).then(res => {
        if (res) {
          this.$message.success('删除成功')
          this.open()
        } else {
          this.$message.error('已生成相应规则合约，无法删除规则')
        }
      })
    },
    handleCheck (record) {
      updateEnable(record.id).then(res => {
        if (res) {
          this.$message.success('切换成功')
          this.visible = false
          this.$emit('close')
        } else {
          this.$message.error('切换失败')
        }
      })
    }
  }
}
</script>
