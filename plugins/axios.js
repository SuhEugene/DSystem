import axios from 'axios'


export default axios.create({
  baseURL: process.env.axiosBase,
  // withCredentials: true,
  // headers: {
  //   withCredentials: true
  // }
})
