export default {
  // type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/push',
      handler: 'push.createFromArticle',
      config: {
        auth: false,
        middlewares: [],
        // policies: ['admin::isAuthenticatedAdmin'], // optional but recommended
      },
    },
  ],
};
