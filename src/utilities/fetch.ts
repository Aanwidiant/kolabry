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

const Fetch = { GET, POST, PUT, PATCH, DELETE };

export default Fetch;
