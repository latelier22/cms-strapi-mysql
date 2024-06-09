// ./src/api/video/routes/video.js

module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/photo-tag-orders/list',
        handler: 'api::photo-tag-order.photo-tag-order.list',
        config: {
          auth: false,
        },
        
      },
      {
        method: 'POST',
        path: '/photo-tag-orders/updateOrder',
        handler: 'api::photo-tag-order.photo-tag-order.updateOrder',
        config: {
          auth: false,
        },
        
      },
     


    ],
    
  };
  