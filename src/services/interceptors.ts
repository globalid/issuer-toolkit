import axios from 'axios';

import { version } from '../version';

axios.interceptors.request.use((config) => {
  config.headers.setUserAgent(`GlobaliD-Issuer-Toolkit/${version}`);
  return config;
});
