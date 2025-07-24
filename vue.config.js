const { defineConfig } = require('@vue/cli-service')
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://vectrik-bank.onrender.com',
        changeOrigin: true,
      },
      '/internal/media': {
        target: 'https://vectrik-bank.onrender.com',
        changeOrigin: true,
      },
    },
  },
}
