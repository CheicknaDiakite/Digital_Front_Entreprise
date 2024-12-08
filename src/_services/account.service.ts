import { FormClienType, ReponseClient } from "../typescript/ClienType"
import { TypeSlug } from "../typescript/DataType"
import { FormType, FormValueType } from "../typescript/FormType"
import { ClienType, LoginType, RegisterResponse, ReponseUser, UserType, UtilisateurType } from "../typescript/UserType"
import Axios from "./caller.service"

const userRegister = async (post: FormValueType): Promise<RegisterResponse> => {
    try {
        const response = await Axios.post('/utilisateur/inscription', post)
        return response;
    } catch (error) {
        console.error("Error fetching boutiques:", error);
        throw error;
    }
}

const userClient = async (post: ClienType): Promise<RegisterResponse> => {
    try {
        const response = await Axios.post('/entreprise/client/add', post)
        return response;
    } catch (error) {
        console.error("Error fetching boutiques:", error);
        throw error;
    }
}

const userAdminRegister = (data: FormValueType) => {
    return Axios.post('utilisateur/admin/inscription',
        data,{                         
            headers: {
                'Authorization': `${token_1}`
            },
            withCredentials: true
        });
}

const userLogin = async (post: LoginType): Promise<RegisterResponse> => {
    try {
        const response = await Axios.post('/utilisateur/connexion', post, { withCredentials: true })
        return response;
    } catch (error) {
        console.error("Error fetching boutiques:", error);
        throw error;
    }
}

const userUnGet = async (id: string) => {
    
    try {
        const response = await Axios.get(`/utilisateur/profile/get/${id}`, 
            {
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

const userUnClient = async (id: string) => {
    
    try {
        const response = await Axios.get(`/entreprise/client/get_un/${id}`, {
            headers: {
                'Authorization': `${token_1}`
            },
            withCredentials: true
        });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};


const userGet = async (post: string) => {
    try {
        const response = await Axios.post(`utilisateur/profile/get`,
            post,{                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}

const userAll = async (data?: TypeSlug): Promise<ReponseUser> => {
    try {
        const response = await Axios.post(`utilisateur/get`,
            data,{                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}
const allUsers = async (data: string) => {
    try {
        const response = await Axios.get(`utilisateur/get/${data}`,
            {                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}

const allClients = async (data: string) => {
    try {
        const response = await Axios.get(`entreprise/client/get/${data}`,
            {                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}

const userUpdate = async (post: UserType): Promise<ReponseUser> => {
    try {
        const response = await Axios.post('utilisateur/profile/set',
            post,{                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}

const clientUpdate = async (post: FormClienType): Promise<ReponseClient> => {
    
    try {
        const response = await Axios.post('entreprise/client/set',
            post,{                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}

const userDelete = async (post: UtilisateurType): Promise<ReponseUser> => {
    try{
        const response = await Axios.post('utilisateur/profile/del',
            post,{                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}

const clientDelete = async (post: FormClienType): Promise<ReponseUser> => {
    try{
        const response = await Axios.post('entreprise/client/del',
            post,{                         
                headers: {
                    'Authorization': `${token_1}`
                },
                withCredentials: true
            });
        return response;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
    
}

const userForgot = (post: FormType) => {
    return Axios.post('utilisateur/forgot-password',
        post,{                         
            headers: {
                'Authorization': `${token_1}`
            },
            withCredentials: true
        });
}
// const userForgot = async (post: FormType): Promise<UserType> => {
    
//     try{
//         const response = await Axios.post('utilisateur/forgot-password',
//             post,{                         
//                 headers: {
//                     'Authorization': `${token_1}`
//                 },
//                 withCredentials: true
//             });
//         return response;
//     } catch (error) {
//         console.error("Error fetching user profile:", error);
//         throw error;
//     }
    
// }

const userLogout = () => {
    return Axios.get('utilisateur/deconnxion')
}


export const userService = {
    userRegister, userLogin, userGet, userUpdate, userDelete,
    userAll, userLogout, userUnGet, userAdminRegister, allUsers,
    userForgot,
     allClients, userClient, userUnClient, clientUpdate, clientDelete
}

const saveToken = (token: string, tok?: string) => {
    localStorage.setItem('token',token)
    localStorage.setItem('token_1',tok|| '')
}

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('account')
    localStorage.removeItem('entreprise-uuid')
    localStorage.removeItem('token_1')
    localStorage.removeItem('errorCount'); // Réinitialiser le compteur après déconnexion
    // Force le rafraîchissement de la page
    window.location.reload();
}

const isLogged = () => {
    const token = localStorage.getItem('token')
    return !!token
}

const getToken = () => {
    return localStorage.getItem('token') || '0'
}

const getToken_1 = () => {
    return localStorage.getItem('token_1') || '0'
}

export const accountService = {
    saveToken, logout, isLogged, getToken, getToken_1
}

export const connect: string = accountService.getToken()
export const token_1: string = accountService.getToken_1()