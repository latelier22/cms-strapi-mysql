// ./src/api/video/routes/video.js

module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/videos',
        handler: 'api::video.video.list',
        config: {
          auth: false,
        },
        
      },
      {
        method: 'GET',
        path: '/video/convert/:id',
        handler: 'api::video.video.convert',
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/video/:id',
        handler: 'api::video.video.one',
        config: {
          auth: false,
        },
      },


    ],
    
  };
  