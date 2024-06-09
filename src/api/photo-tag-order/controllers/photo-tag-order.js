'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::photo-tag-order.photo-tag-order', ({ strapi }) => ({
  async list(ctx) {
    try {
      console.log("controller");
      const orderedPhotos = await strapi.entityService.findMany('api::photo-tag-order.photo-tag-order');
      ctx.send(orderedPhotos);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async updateOrder(ctx) {
    const orders = ctx.request.body;

    console.log("strapi : orders", orders);

    if (!Array.isArray(orders)) {
      ctx.throw(400, 'Orders should be an array');
    }

    for (const order of orders) {
      const { photoId, tagId, order: orderIndex } = order;

      const existingOrder = await strapi.db.query('api::photo-tag-order.photo-tag-order').findOne({
        where: { photoId, tagId },
      });

      if (existingOrder) {
        const updatedItem = await strapi.db.query('api::photo-tag-order.photo-tag-order').update({
          where: { id: existingOrder.id },
          data: { order: orderIndex },
        });
        ctx.send(updatedItem);
      } else {
        const createdItem = await strapi.db.query('api::photo-tag-order.photo-tag-order').create({
          data: { photoId, tagId, order: orderIndex },
        });
        ctx.send(createdItem);
      }
    }

    ctx.send({ message: 'Order updated successfully' });
  },
}));
