import request from '@/utils/request'

const api = {
  warehouse: '/warehouse'
}

export default api

/**
 * 查询所有仓库数据
 * @param parameter
 * @returns {*}
 */
export function warehouseList (parameter) {
  return request({
    url: `${api.warehouse}/pageList`,
    method: 'get',
    params: parameter
  })
}

/**
 * 保存仓库
 * @param id
 * @returns {*}
 */
export function saveWarehouse (parameter) {
  return request({
    url: `${api.warehouse}/save`,
    method: 'post',
    data: parameter
  })
}

/**
 * 查询所有商品
 * @param keyword
 * @returns {*}
 */
export function findAllGoods (keyword) {
  return request({
    url: `${api.warehouse}/goods/all/${keyword}`,
    method: 'get'
  })
}

/**
 * 删除仓库
 * @param collectId
 * @returns {*}
 */
export function delBatchWarehouse (parameter) {
  return request({
    url: `${api.warehouse}/delete/batch`,
    method: 'delete',
    params: parameter
  })
}

/**
 * 更新仓库备注
 * @param collectId
 * @returns {*}
 */
export function updateBatchRemark (parameter) {
  return request({
    url: `${api.warehouse}/remark/batch`,
    method: 'post',
    params: parameter
  })
}

/**
 * 更新仓库处理时间
 * @param collectId
 * @returns {*}
 */
export function updateBatchHandlingTime (parameter) {
  return request({
    url: `${api.warehouse}/handlingTime/batch`,
    method: 'post',
    params: parameter
  })
}
