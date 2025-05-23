import axios, { AxiosInstance, AxiosResponse } from 'axios';
import useAuthStore from '@/store/authStore';

const responseBody = (response: AxiosResponse) => {
    response.data.statusCode = response.status;
    return response.data;
};

const instance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_FETCH_URL,
    timeout: 30000,
    headers: {
        Accept: 'application/json',
    },
});

instance.interceptors.request.use(
    (config) => {
        const { token } = useAuthStore.getState();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else {
            config.headers['Content-Type'] = 'application/json;charset=UTF-8';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
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

const Fetch = { GET, POST, PUT, PATCH, DELETE};

export default Fetch;
