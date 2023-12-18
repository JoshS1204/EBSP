import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/services/auth-service'
import callback from '@/components/auth/callback.vue'
import purchase from '@/components/embed/purchase.vue'
import SeatPlanBuilder from '@/components/Seat-plan-builder/SeatPlanBuilderComponent.vue'
import seatSelectionBuilder from '@/components/Seat-plan-builder/components/builders/seatSelectionBuilder.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      props: true,
      params: true,
      meta: { requiresAuth: true },
      component: SeatPlanBuilder
    },
    {
      path: '/authcallback',
      name: 'authcallback',
      props: true,
      params: true,
      component: callback
    },
    {
      path: '/purchase',
      name: 'Purchase',
      props: true,
      params: true,
      // meta: { requiresAuth: true },
      component: seatSelectionBuilder
    }
    // {
    //   path: "/authcallbacksignout",
    //   name: "authcallbacksignout",
    //   props: true,
    //   params: true,
    //   component: () => import("../components/auth/callback/signoutCallback.vue"),
    // },
  ]
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    auth.getUser().then((x) => {
      if (!x || x.expired) {
        auth
          .login()
          .then((x) => {
            // console.log('login info: ', x)
          })
          .catch((x) => {
            // console.log('login failed info: ', x)
          })
      }
    })
  }
  next()
  return
})

export default router
