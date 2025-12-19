module.exports = {
  apps: [
    {
      name: "outlandish",
      script: "build/index.js",
      env: {
        NODE_ENV: "production",
        ORIGIN: "http://188.166.172.123",
        HOST_HEADER: "x-forwarded-host",
        PROTOCOL_HEADER: "x-forwarded-proto"
      }
    }
  ]
};
