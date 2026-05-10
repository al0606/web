import router, { resetRouter } from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'

NProgress.configure({ showSpinner: false })

router.beforeEach((to, from, next) => {
  NProgress.start()
  to.meta && typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`)

  if (store.getters.roles.length === 0) {
    store.dispatch('GetInfo').then(res => {
      store.dispatch('GenerateRoutes', { ...res }).then(() => {
        resetRouter()
        store.getters.addRouters.forEach(r => {
          router.addRoute(r)
        })
        next({ ...to, replace: true })
      })
    })
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})
