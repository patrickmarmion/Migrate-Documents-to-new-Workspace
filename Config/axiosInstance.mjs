import Agent from "agentkeepalive";
import { HttpsAgent } from "agentkeepalive";
import axios from "axios";

// Create a reusable connection instance that can be passed around to different controllers
const keepAliveAgent = new Agent({
  maxSockets: 128,
  maxFreeSockets: 128,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

// HTTPS agent
const httpsKeepAliveAgent = new HttpsAgent({
  maxSockets: 128,
  maxFreeSockets: 128,
  timeout: 60000, // active socket keepalive for 30 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

const axiosInstance = axios.create({
  httpAgent: keepAliveAgent,
  httpsAgent: httpsKeepAliveAgent,
});

export default axiosInstance;