import axios from "axios";

const serverApiUrl = process.env.NEXT_PUBLIC_API_URL;

const serverApi = axios.create({
  baseURL: serverApiUrl,
  //   timeout: 10000,
});

export default serverApi;
