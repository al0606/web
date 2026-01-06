import request from '@/utils/request'

const api = {
  purchase: '/purchase'
}

export default api

/**
 * 查询所有采购数据
 * @param parameter
 * @returns {*}
 */
export function purchaseList (parameter) {
  return request({
    url: `${api.purchase}/pageList`,
    method: 'get',
    params: parameter
  })
}

/**
 * 查询商品磨损
 * @param id
 * @returns {*}
 */
export function findGoodsWear (id) {
  return request({
    url: `${api.purchase}/findGoodsWear/${id}`,
    method: 'get'
  })
}

/**
 * 删除采购
 * @param collectId
 * @returns {*}
 */
export function del (id) {
  return request({
    url: `${api.purchase}/delete/${id}`,
    method: 'delete'
  })
}
