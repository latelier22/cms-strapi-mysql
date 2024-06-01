module.exports = ({ env }) => ({
    //...
    upload: {
      config: {
        sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
      }
    },
    'import-export-entries': {
      enabled: true,
      config: {
        // See `Config` section.
      },
    },
    //...
  });

