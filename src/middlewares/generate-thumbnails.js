const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    if (ctx.request.files && ctx.request.files.files) {
      const files = Array.isArray(ctx.request.files.files)
        ? ctx.request.files.files
        : [ctx.request.files.files];

      files.forEach(file => {
        if (file.type.startsWith('video/')) {
          const videoPath = file.path;
          const thumbnailPath = path.join(strapi.dirs.static.public, 'thumbnails', `${file.hash}.png`);

          if (!fs.existsSync(path.dirname(thumbnailPath))) {
            fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
          }

          ffmpeg(videoPath)
            .on('end', () => {
              strapi.log.info(`Thumbnail generated for ${file.name}`);
            })
            .on('error', (err) => {
              strapi.log.error(`Error generating thumbnail for ${file.name}: ${err.message}`);
            })
            .screenshots({
              count: 1,
              folder: path.dirname(thumbnailPath),
              filename: path.basename(thumbnailPath),
              size: '320x240'
            });

          file.thumbnail = `/thumbnails/${file.hash}.png`;
        }
      });
    }
  };
};

