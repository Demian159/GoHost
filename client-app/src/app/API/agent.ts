import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { history } from "../..";
import { Activity, ActivityFormValues } from "../models/activity";
import { Photo, Profile } from "../models/profile";
import { ServerError } from "../models/serverError";
import { User, UserFormValues } from "../models/user";
import { store } from "../stores/store";

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

interface dataResponseType{
    errors: any[]
}

axios.defaults.baseURL = 'http://localhost:5000/api';

axios.interceptors.request.use((config: any) => {
    const token = store.commonStore.token;
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config;
})

axios.interceptors.response.use(async response => {
    await sleep(2000);
    return response;
}, (error: AxiosError) => {
    const { data, status, config } = error.response!;
    const dataR = data as dataResponseType;
    switch (status) {
        case 400:
            if (typeof dataR === 'string') {
                toast.error(dataR);
            }
            if (config.method === 'get' && dataR.errors.hasOwnProperty('id')) {
                history.push('/not-found');
            }
            if (dataR.errors) {
                const modalStateErrors = [];
                for (const key in dataR.errors){
                    if(dataR.errors[key]){
                        modalStateErrors.push(dataR.errors[key])
                    }
                }
                throw modalStateErrors.flat();
            } 
            break;
        case 401:
            toast.error('unauthorised');
            break;
        case 404:
            history.push('/not-found');
            break;
        case 500:
            const dataS = data as ServerError;
            store.commonStore.setServerError(dataS);
            history.push('/server-error')
            break;

        default:
            break;
    }
})

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const request = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody)
}

const Activities = {
    list: () => request.get<Activity[]>('/activities'),
    details: (id: string) => request.get<Activity>(`/activities/${id}`),
    create: (activity: ActivityFormValues) => request.post<void>('/activities', activity),
    update: (activity: ActivityFormValues) => request.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => request.del<void>(`/activities/${id}`),
    attend: (id: string) => request.post<void>(`/activities/${id}/attend`, {})
}

const Account = {
    current:  () => request.get<User>('/account'),
    login: (user: UserFormValues) => request.post<User>('/account/login', user),
    register: (user: UserFormValues) => request.post<User>('/account/register', user)
}

const Profiles = {
    get: (username: string) => request.get<Profile>(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {
        let formData = new FormData();
        formData.append('File', file);
        return axios.post<Photo>('photos', formData, {
            headers: {'Content-type': 'multipart/form-data'}
        })
    },
    setMainPhoto: (id: string) => request.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => request.del(`/photos/${id}`)
}

const agent = {
    Activities,
    Account,
    Profiles
}

export default agent;