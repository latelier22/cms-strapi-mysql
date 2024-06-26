const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

module.exports = {
  async list(ctx) {
    try {
      const files = await strapi.entityService.findMany('plugin::upload.file', {
        filters: { mime: { $contains: 'video' } },
      });
      ctx.send(files);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async one(ctx) {
    const { id } = ctx.params;
    try {
      const file = await strapi.entityService.findOne('plugin::upload.file', id);

      if (!file) {
        return ctx.notFound('File not found');
      }
      ctx.send(file);
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async convert(ctx) {
    const { id } = ctx.params;
    strapi.log.debug(`Starting conversion for file ID: ${id}`);
    try {
      const file = await strapi.entityService.findOne('plugin::upload.file', id);
      strapi.log.debug(`Fetched file: ${file ? file.name : 'not found'}`);
      
      if (!file) {
        return ctx.notFound('File not found');
      }

      const inputPath = path.join(strapi.dirs.static.public, file.url);
      const outputDir = path.join(strapi.dirs.static.public, 'converted');
      const outputFileName = `${file.hash}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);
      const thumbnailPath = path.join(strapi.dirs.static.public, 'thumbnails', `${file.hash}.png`);

      strapi.log.debug(`Paths set: inputPath=${inputPath}, outputPath=${outputPath}, thumbnailPath=${thumbnailPath}`);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      if (!fs.existsSync(path.dirname(thumbnailPath))) {
        fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
      }

      ffmpeg(inputPath)
        .output(outputPath)
        .outputOptions('-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2')
        .on('end', async () => {
          strapi.log.debug(`Conversion completed for file: ${file.name}`);
          
          ffmpeg(outputPath)
            .screenshots({
              timestamps: ['00:00:01.000'],
              filename: `${file.hash}.png`,
              folder: path.dirname(thumbnailPath),
              size: '320x240'
            })
            .on('end', async () => {
              strapi.log.debug(`Thumbnail generated for file: ${file.name}`);
              
              const stats = fs.statSync(outputPath);
              const dimensions = await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(outputPath, (err, metadata) => {
                  if (err) reject(err);
                  resolve(metadata.streams[0]);
                });
              });

              const updatedFile = await strapi.entityService.update('plugin::upload.file', id, {
                data: {
                  url: `/converted/${outputFileName}`,
                  caption: `/thumbnails/${file.hash}.png`,
                  size: stats.size / 1024,
                  width: dimensions.width,
                  height: dimensions.height,
                  formats: {
                    ...((file.formats && typeof file.formats === 'object') ? file.formats : {}),
                    thumbnail: {
                      name: `${file.hash}.png`,
                      hash: file.hash,
                      ext: '.png',
                      mime: 'image/png',
                      path: null,
                      width: 320,
                      height: 240,
                      size: fs.statSync(thumbnailPath).size / 1024,
                      url: `/thumbnails/${file.hash}.png`,
                    }
                  },
                }
              });

              strapi.log.debug(`File updated: ${JSON.stringify(updatedFile)}`);
              
              ctx.send({
                message: 'File converted and thumbnail generated',
                file: updatedFile
              });
            })
            .on('error', (err) => {
              strapi.log.error(`Error generating thumbnail for file ${file.name}: ${err.message}`);
              ctx.throw(500, `Error generating thumbnail: ${err.message}`);
            });
        })
        .on('error', (err) => {
          strapi.log.error(`Error converting file ${file.name}: ${err.message}`);
          ctx.throw(500, `Error converting file: ${err.message}`);
        })
        .run();
    } catch (error) {
      strapi.log.error(`Unexpected error: ${error.message}`);
      ctx.throw(500, error);
    }
  }
};


// // ./src/api/video/controllers/video.js

// const ffmpeg = require('fluent-ffmpeg');
// const path = require('path');
// const fs = require('fs');

// module.exports = {
//   async list(ctx) {
//     try {
//       const files = await strapi.entityService.findMany('plugin::upload.file', {
//         filters: { mime: { $contains: 'video' } },
//       });
//       ctx.send(files);
//     } catch (error) {
//       ctx.throw(500, error);
//     }
//   },

//   async convert(ctx) {
//     const { id } = ctx.params;
//     try {
//       const file = await strapi.entityService.findOne('plugin::upload.file', id);

//       if (!file) {
//         return ctx.notFound('File not found');
//       }

//       const inputPath = path.join(strapi.dirs.static.public, file.url);
//       const outputDir = path.join(strapi.dirs.static.public, 'converted');
//       const outputFileName = `${file.hash}.mp4`;
//       const outputPath = path.join(outputDir, outputFileName);
//       const thumbnailPath = path.join(strapi.dirs.static.public, 'thumbnails', `${file.hash}.png`);

//       if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//       }
//       if (!fs.existsSync(path.dirname(thumbnailPath))) {
//         fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
//       }

//       ffmpeg(inputPath)
//         .output(outputPath)
//         .on('end', async () => {
//           ffmpeg(outputPath)
//             .screenshots({
//               count: 1,
//               folder: path.dirname(thumbnailPath),
//               filename: path.basename(thumbnailPath),
//               size: '320x240'
//             });

//           const updatedFile = await strapi.entityService.update('plugin::upload.file', id, {
//             data: {
//               url: `/converted/${outputFileName}`,
//               caption: `/thumbnails/${file.hash}.png`
//             }
//           });

//           ctx.send({
//             message: 'File converted and thumbnail generated',
//             file: updatedFile
//           });
//         })
//         .on('error', (err) => {
//           strapi.log.error(`Error converting file ${file.name}: ${err.message}`);
//           ctx.throw(500, 'Error converting file');
//         })
//         .run();
//     } catch (error) {
//       ctx.throw(500, error);
//     }
//   }
// };
