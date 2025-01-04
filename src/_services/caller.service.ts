import axios, { AxiosInstance } from "axios";

// URL de base pour l'API
// http://127.0.0.1:8000
// https://back.diakitedigital.com
// https://back.gest-stocks.com

const BaseDomaine = {
    URL: 'http://127.0.0.1:8000'
}

export const Base = {
    baseURL: `${BaseDomaine.URL}/api`
    // baseURL: 'http://127.0.0.1:8000/api'
}

// Créer une instance d'Axios
const Axios: AxiosInstance = axios.create({
    baseURL: `${Base.baseURL}`,
    // timeout: 5000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// Exposer Axios pour utilisation ailleurs
export default Axios;

export const BASE = (img: string | File | unknown) => {
    return `${BaseDomaine.URL}/${img}`;
};
