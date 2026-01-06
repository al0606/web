<template>
  <div :class="wrpCls">
    磨损转换：
    <a-select
        placeholder="请输入名称查询商品"
        style="width: 200px"
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
    <a-input-number
        placeholder="请输入磨损值"
        style="width: 150px;"
        @change="changeWear(goods, $event)"
        :value="wear"
        :min="goods.minWear"
        :max="goods.maxWear"
        :step="0.0001"
    />
    结果：{{ realWear }}
    <avatar-dropdown :menu="showMenu" :current-user="currentUser" :class="prefixCls" />
    <select-lang :class="prefixCls" />
  </div>
</template>

<script>
import AvatarDropdown from './AvatarDropdown'
import SelectLang from '@/components/SelectLang'
import { findAllGoods } from '@/api/warehouse'

export default {
  name: 'RightContent',
  components: {
    AvatarDropdown,
    SelectLang
  },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-global-header-index-action'
    },
    isMobile: {
      type: Boolean,
      default: () => false
    },
    topMenu: {
      type: Boolean,
      required: true
    },
    theme: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      showMenu: true,
      currentUser: {},
      wear: 0,
      realWear: 0,
      goods: {},
      goodsList: []
    }
  },
  computed: {
    wrpCls () {
      return {
        'ant-pro-global-header-index-right': true,
        [`ant-pro-global-header-index-${(this.isMobile || !this.topMenu) ? 'light' : this.theme}`]: true
      }
    }
  },
  mounted () {
    setTimeout(() => {
      this.currentUser = {
        name: 'Serati Ma'
      }
    }, 1500)
  },
  methods: {
    handleSearch (keyword) {
      if (!keyword) return
      findAllGoods(keyword).then(res => {
        this.goodsList = res
      })
    },
    changeWear (goods, value) {
      this.wear = value
      // 真实磨损值（用于计算）= 1 / (最大磨损值 - 最小磨损值) * (当前材料磨损值 - 最小磨损值)
      this.realWear = (1 / (goods.maximumWear - goods.minimumWear) * (value - goods.minimumWear)) || 0
    },
    selected (value) {
      this.goods = this.goodsList.find(item => item.id === value)
    }
  }
}
</script>
