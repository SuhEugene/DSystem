import axios from 'axios'

export default function (ctx, inject) {
  const api = axios.create({ baseURL: process.env.axiosBase });
  if (process.server) { api.defaults.headers.common['cookie'] = ctx.req.headers.cookie; }
  inject('api', api);
}
