import axios from 'axios';

export default async function download(url: string): Promise<Buffer> {
  const response = await axios.get<Buffer>(url, { responseType: 'arraybuffer' });
  return response.data;
}
