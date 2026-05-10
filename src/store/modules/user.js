import { welcome } from '@/utils/util'

const user = {
  state: {
    token: 'local',
    name: '管理员',
    welcome: '',
    avatar: '/avatar2.jpg',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => { state.token = token },
    SET_NAME: (state, { name, welcome }) => { state.name = name; state.welcome = welcome },
    SET_AVATAR: (state, avatar) => { state.avatar = avatar },
    SET_ROLES: (state, roles) => { state.roles = roles },
    SET_INFO: (state, info) => { state.info = info }
  },

  actions: {
    GetInfo ({ commit }) {
      return new Promise((resolve) => {
        const role = {
          id: 'admin',
          name: '管理员',
          permissions: [{ permissionId: 'table', actionList: ['add', 'query', 'get', 'update', 'delete'] }],
          permissionList: ['table']
        }
        const result = {
          id: 1,
          name: '管理员',
          avatar: '/avatar2.jpg',
          role
        }
        commit('SET_ROLES', role)
        commit('SET_INFO', result)
        commit('SET_NAME', { name: result.name, welcome: welcome() })
        commit('SET_AVATAR', result.avatar)
        resolve(result)
      })
    },

    Logout ({ commit }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        resolve()
      })
    }
  }
}

export default user
