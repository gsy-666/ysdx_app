const request = require('../../utils/request.js').request;
Page({
  data: {
    article: {}
  },
  onLoad: function (options) {
    const id = options.id;
    if (id) {
      this.fetchDetail(id);
    }
  },
  fetchDetail: function (id) {
    // Assuming there is a detail API or I get it from list? 
    // The router in Vue said: path: 'article/detail/:id', component: detail.vue
    // Usually there is a getById API. Let's guess '/article/getById' or just use the list item if content is there.
    // But commonly it's a detail call.
    // Looking at `ysdx_front` code might reveal the API.
    // `menu/patient.vue` didn't show the API for detail.
    // Let's assume /article/getById or similar. Or /article/{id}.
    // I'll try /article/detail?id=... or similar.
    // A safe bet is getting it from the previous page reference if the content was in the list.
    // But seeing `login.vue` used `post`, maybe I should check `ysdx_front/src/views/sys/article/detail.vue`.

    // For now, placeholder implementation
  }
})
