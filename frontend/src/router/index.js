import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/library',
    name: 'library',
    component: () => import(/* webpackChunkName: "library" */ '../views/LibraryView.vue')
  },
  {
    path: '/upload',
    name: 'upload',
    component: () => import(/* webpackChunkName: "upload" */ '../views/UploadView.vue')
  },
  {
    path: '/memes/:id',
    name: 'meme-detail',
    component: () => import(/* webpackChunkName: "meme-detail" */ '../views/MemeDetailView.vue')
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import(/* webpackChunkName: "tags" */ '../views/TagsView.vue')
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import(/* webpackChunkName: "categories" */ '../views/CategoriesView.vue')
  },
  {
    path: '/share/:token',
    name: 'shared-meme',
    component: () => import(/* webpackChunkName: "shared-meme" */ '../views/SharedMemeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router