const { defineConfig } = require('@vue/cli-service')
module.exports = {
  // Убираем прокси - теперь это делает Nginx
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://vectrik-bank.onrender.com',
  //       changeOrigin: true,
  //     },
  //     '/internal/media': {
  //       target: 'https://vectrik-bank.onrender.com',
  //       changeOrigin: true,
  //     },
  //   },
  // },
}
