import axios from 'axios';
import FormData from 'form-data';

export async function uploadFile(uploadUrl: string, formData: FormData): Promise<void> {
  await axios.post('/', formData, {
    baseURL: uploadUrl,
    headers: formData.getHeaders()
  });
}
