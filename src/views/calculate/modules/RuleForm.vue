<template>
  <a-modal
    title="新建/修改规则"
    :width="680"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleSave"
    @cancel="() => { visible = false }"
  >
    <a-spin :spinning="loading">
      <a-form layout="inline" :form="form">
        <a-form-item v-show="model && model.id > 0" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-row :gutter="48">
          <a-col :md="12" :sm="24">
            <a-form-item label="规则名称">
              <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入规则名称'}] }]" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="材料数量">
              <a-input-number v-decorator="['combinationSize', { rules: [{ required: true, message: '请输入商品数量'}] }]" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :md="12" :sm="24">
            <a-form-item label="生成数量">
              <a-input-number v-decorator="['resultsNum', { rules: [{ required: true, message: '请输入生成数量'}] }]" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="成本价">
              <a-input-number
                  :formatter="value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/￥\s?|(,*)/g, '')"
                  v-decorator="['costPrice', { rules: [{ required: true, message: '请输入成本价'}] }]" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :md="12" :sm="24">
            <a-form-item label="商品类型">
              <a-select
                  v-decorator="['goodsType', { rules: [{ required: true, message: '请选择商品类型'}] }]"
                  style="width: 100%"
                  allowClear
              >
                <a-select-option :value="1">普通</a-select-option>
                <a-select-option :value="2">StartTrak</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="商品等级">
              <a-select style="width: 100%" v-decorator="['goodsLevel', { rules: [{ required: true, message: '请选择商品等级'}] }]" allowClear>
                <a-select-option :value="1">消费级</a-select-option>
                <a-select-option :value="2">工业级</a-select-option>
                <a-select-option :value="3">军规级</a-select-option>
                <a-select-option :value="4">受限级</a-select-option>
                <a-select-option :value="5">保密级</a-select-option>
                <a-select-option :value="6">隐秘级</a-select-option>
                <a-select-option :value="7">违禁级</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :md="12" :sm="24">
            <a-form-item label="默认磨损">
              <a-input-number
                  :min="0"
                  :max="100"
                  :formatter="value => `${value}%`"
                  :parser="value => value.replace('%', '')"
                  v-decorator="['defaultWear', { rules: [{ required: true, message: '请输入默认磨损'}] }]" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="期望价值">
              <a-input-number
                  :formatter="value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/￥\s?|(,*)/g, '')"
                  v-decorator="['desiredValue', { rules: [{ required: true, message: '请输入合约期望价值'}] }]" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="48">
          <a-col :md="12" :sm="24">
            <a-form-item label="成功概率">
              <a-input-number
                  :min="0"
                  :max="100"
                  :formatter="value => `${value}%`"
                  :parser="value => value.replace('%', '')"
                  v-decorator="['successRate', { rules: [{ required: true, message: '请输入成功概率'}] }]" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="材料格式">
              <a-input v-decorator="['repeatedNum', { rules: [{ required: true, message: '请输入材料格式'}] }]" />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item label="是否自定义">
              <a-radio-group v-decorator="['isCustom', { rules: [{ required: true, message: '请选择是否自定义'}] }]">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { saveRule, detail } from '@/api/calculate'

// 表单字段
const fields = [
  'id', 'name', 'combinationSize', 'resultsNum', 'costPrice',
  'goodsType', 'goodsLevel', 'defaultWear', 'desiredValue',
  'successRate', 'repeatedNum', 'isCustom'
]

export default {
  data () {
    return {
      visible: false,
      loading: false,
      model: {},
      form: this.$form.createForm(this)
    }
  },
  methods: {
    open (record) {
      this.visible = true
      if (!record) {
        this.form.resetFields()
        return
      }
      this.loading = true
      detail(record.id).then(res => {
        this.model = res
        this.model.defaultWear = this.model.defaultWear * 100
        this.model.successRate = this.model.successRate * 100
        this.form.setFieldsValue(pick(this.model, fields))
      }).finally(() => {
        this.loading = false
      })
    },
    handleSave () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          values.defaultWear = values.defaultWear / 100
          values.successRate = values.successRate / 100
          saveRule(values).then(res => {
            if (res) {
              this.$message.success('保存成功')
              this.visible = false
              this.$emit('ok')
            } else {
              this.$message.error('保存失败')
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}

</script>
