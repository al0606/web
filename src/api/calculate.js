import request from '@/utils/request'

const api = {
  rule: '/rule',
  contract: '/contract'
}

export default api

/**
 * 查询所有规则
 * @param parameter
 * @returns {*}
 */
export function query (parameter) {
  return request({
    url: `${api.rule}/list`,
    method: 'get',
    params: parameter
  })
}

/**
 * 查询规则详情
 * @param id
 * @returns {*}
 */
export function detail (id) {
  return request({
    url: `${api.rule}/get/${id}`,
    method: 'get'
  })
}

/**
 * 查询启用的合约规则
 * @returns {*}
 */
export function getEnable () {
  return request({
    url: `${api.rule}/enable`,
    method: 'get'
  })
}

/**
 * 保存规则
 * @param id
 * @returns {*}
 */
export function saveRule (parameter) {
  return request({
    url: `${api.rule}/save`,
    method: 'post',
    data: parameter
  })
}

/**
 * 更新规则状态
 * @param id
 * @returns {*}
 */
export function updateEnable (id) {
  return request({
    url: `${api.rule}/update/enable/${id}`,
    method: 'get'
  })
}

/**
 * 删除规则
 * @param collectId
 * @returns {*}
 */
export function del (id) {
  return request({
    url: `${api.rule}/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 查询所有合约数据
 * @param parameter
 * @returns {*}
 */
export function contractList (parameter) {
  return request({
    url: `${api.contract}/pageList`,
    method: 'get',
    params: parameter
  })
}

/**
 * 计算合约
 * @returns {*}
 */
export function calculate () {
  return request({
    url: `${api.contract}/calculate`,
    method: 'get'
  })
}

/**
 * 查询商品价格
 * @param goodsId
 * @param wearType
 * @returns {*}
 */
export function getPrice (goodsId, wearType) {
  return request({
    url: `${api.contract}/price/${goodsId}/${wearType}`,
    method: 'get'
  })
}

/**
 * 收藏和约
 * @param contractId
 * @returns {*}
 */
export function collect (parameter) {
  return request({
    url: `${api.contract}/collect`,
    method: 'post',
    data: parameter
  })
}

/**
 * 删除合约
 * @param collectId
 * @returns {*}
 */
export function delBatchContract (parameter) {
  return request({
    url: `${api.contract}/delete/batch`,
    method: 'delete',
    params: parameter
  })
}
