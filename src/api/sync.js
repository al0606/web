import request from '@/utils/request'

const api = {
  sync: '/sync',
  collect: '/collect'
}

export default api

/**
 * 查询所有盒子
 * @param parameter
 * @returns {*}
 */
export function queryBox (parameter) {
  return request({
    url: `${api.sync}/box`,
    method: 'get',
    params: parameter
  })
}

/**
 * 一键同步
 * @returns {*}
 */
export function syncAll () {
  return request({
    url: `${api.sync}/all`,
    method: 'get'
  })
}

/**
 * 同步单个盒子
 * @param id
 * @returns {*}
 */
export function syncBox (id) {
  return request({
    url: `${api.sync}/${id}`,
    method: 'get'
  })
}

/**
 * 汇总所有盒子数据
 * @returns {*}
 */
export function collect () {
  return request({
    url: `${api.collect}/collect`,
    method: 'get'
  })
}

/**
 * 查询所有盒子汇总数据
 * @param parameter
 * @returns {*}
 */
export function collectList (parameter) {
  return request({
    url: `${api.collect}/pageList`,
    method: 'get',
    params: parameter
  })
}

/**
 * 查询商品
 * @param collectId
 * @returns {*}
 */
export function getGoodsList (parameter) {
  return request({
    url: `${api.collect}/goods`,
    method: 'get',
    params: parameter
  })
}
