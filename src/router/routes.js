const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue') },

      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') },

      { path: 'pets', component: () => import('pages/PetsPage.vue') },
      { path: 'pets/:id', component: () => import('pages/PetDetailsPage.vue') },

      { path: 'upcoming', component: () => import('pages/UpcomingPage.vue') },
    ],
  },

  // uvijek zadnje:
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
