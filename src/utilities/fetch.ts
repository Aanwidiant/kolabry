import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import useAuthStore from '@/store/authStore';

const responseBody = (response: AxiosResponse) => response?.data;

if (!process.env.NEXT_PUBLIC_FETCH_URL) {
    throw new Error('NEXT_PUBLIC_FETCH_URL is not defined');
}

const instance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_FETCH_URL,
    timeout: 30000,
    headers: {
        Accept: 'application/json',
    },
    validateStatus: () => true,
});

instance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json;charset=UTF-8';
        } else {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        return Promise.reject({
            status: error.response?.status,
            data: error.response?.data || error.message,
            message: error.message,
        });
    }
);

const GET = async (url: string, config?: object) => {
    const response = await instance.get(url, config);
    return responseBody(response);
};

const POST = async (url: string, data: object, config?: object) => {
    const response = await instance.post(url, data, config);
    return responseBody(response);
};

const PUT = async (url: string, data: object, config?: object) => {
    const response = await instance.put(url, data, config);
    return responseBody(response);
};

const PATCH = async (url: string, data: object, config?: object) => {
    const response = await instance.patch(url, data, config);
    return responseBody(response);
};

const DELETE = async (url: string, config?: object) => {
    const response = await instance.delete(url, config);
    return responseBody(response);
};

const DOWNLOAD = async (url: string, filename: string) => {
    try {
        const response = await instance.get(url, { responseType: 'blob' });

        const contentType = response.headers['content-type'];
        const blob = new Blob([response.data], { type: contentType });

        if (contentType?.includes('application/json')) {
            const text = await blob.text();
            const json = JSON.parse(text);
            return { success: false, message: json.message || 'Failed to download file' };
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);

        return { success: true };
    } catch (err) {
        console.error('Failed to download file:', err);
        return { success: false, message: (err as Error).message || 'Unknown error occurred' };
    }
};

const Fetch = { GET, POST, PUT, PATCH, DELETE, DOWNLOAD };

export default Fetch;
