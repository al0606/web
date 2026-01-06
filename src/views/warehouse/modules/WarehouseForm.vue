<template>
  <a-modal
    title="新建"
    :width="480"
    :visible="visible"
    :confirmLoading="loading"
    @ok="handleSave"
    @cancel="() => { visible = false }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form">
        <a-row>
          <a-form-item label="商品名称">
            <a-select
                v-decorator="['goodsId', { rules: [{ required: true, message: '请选择商品名称'}] }]"
                style="width: 100%"
                show-search
                :default-active-first-option="false"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                @search="handleSearch"
                allowClear
                @select="selected"
            >
              <a-select-option v-for="item in goodsList" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-row>
        <a-row>
          <a-form-item label="磨损度">
            <a-input-number
                style="width: 100%"
                :max="goods.maximumWear"
                :min="goods.minimumWear"
                :step="0.0001"
                v-decorator="['wear', { rules: [{ required: true, message: '请输入磨损度'}] }]"
            />
          </a-form-item>
        </a-row>
        <a-row>
          <a-form-item label="价格">
            <a-input-number
                style="width: 100%"
                :formatter="value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="value => value.replace(/￥\s?|(,*)/g, '')"
                v-decorator="['price', { rules: [{ required: true, message: '请输入价格'}] }]" />
          </a-form-item>
        </a-row>
        <a-row>
          <a-form-item label="入库数量">
            <a-input-number
                style="width: 100%"
                v-decorator="['count', { rules: [{ required: true, message: '请输入入库数量'}] }]"
            />
          </a-form-item>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { saveWarehouse, findAllGoods } from '@/api/warehouse'

export default {
  data () {
    return {
      visible: false,
      loading: false,
      goodsList: [],
      goods: {
        maximumWear: 1,
        minimumWear: 0
      },
      form: this.$form.createForm(this)
    }
  },
  methods: {
    open (record) {
      this.visible = true
      if (!record) {
        this.form.resetFields()
      }
    },
    selected (value) {
      this.goods = this.goodsList.find(item => item.id === value)
    },
    handleSearch (keyword) {
      if (!keyword) return
      findAllGoods(keyword).then(res => {
        this.goodsList = res
      })
    },
    handleSave () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          this.loading = true
          saveWarehouse(values).then(res => {
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
