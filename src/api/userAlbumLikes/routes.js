const routes = (handler) => [
    {
      method: 'POST',
      path: '/albums/{id}/likes',
      handler: handler.postLikeHandler,
      options: {
        auth: 'openmusicapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/albums/{id}/likes',
      handler: handler.getLikeHandler,
    },
  ];
  
  module.exports = routes;
  