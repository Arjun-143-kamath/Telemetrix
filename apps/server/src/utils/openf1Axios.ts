import axios from 'axios';

export const openf1Axios = axios.create({
  baseURL: 'https://api.openf1.org/v1',
  timeout: 10000,
});

// A simple queue to ensure we don't exceed 3 requests per second
let queue = Promise.resolve();

openf1Axios.interceptors.request.use((config) => {
  return new Promise((resolve) => {
    queue = queue.then(() => {
      return new Promise<void>((res) => {
        setTimeout(() => {
          resolve(config);
          res();
        }, 340); // ~3 requests per second (1000ms / 3 = 333.33ms)
      });
    });
  });
});

// Add retry logic for 429 errors
openf1Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 429) {
      const config = error.config;
      if (!config.retryCount) {
        config.retryCount = 0;
      }
      
      if (config.retryCount < 3) {
        config.retryCount += 1;
        const delay = 1000 * Math.pow(2, config.retryCount); // 2s, 4s, 8s
        console.warn(`[OpenF1] Rate limit hit. Retrying in ${delay}ms... (Attempt ${config.retryCount})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return openf1Axios(config);
      }
    }
    return Promise.reject(error);
  }
);
