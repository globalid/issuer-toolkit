import axios from 'axios';

import { version } from '../version';

axios.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    'User-Agent': `GlobaliD-Issuer-Agent-SDK/${version}`
  };
  return config;
});
