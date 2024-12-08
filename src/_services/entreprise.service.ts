import { EntrepriseType } from "../typescript/Account";
import { DataType, TypeEntreprise } from "../typescript/DataType";
import { token_1 } from "./account.service";
import Axios from "./caller.service";


/**
 * Récupératoin de la liste des utilisateurs
 */
const allEntreprise = async (post: string ) => {
    try {
        const response = await Axios.post('entreprise/get', 
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

// Pour tous les utilisateurs d'un Entreprise 
const getEntrepriseUsers = async (post: string ) => {
    try {
        const response = await Axios.get(`entreprise/get_entreprise_utilisateurs/${post}`, 
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

// Pour tous les entreprises d'un utilisateur 
const getUserEntreprises = async (post: string) => {
    try {
        const response = await Axios.get(`entreprise/get_utilisateur_entreprise/${post}`, 
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

const allUserEntreprise = async (post: string) => {
    try {
        const response = await Axios.post('entreprise/get/user', 
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

/**
 * Récupération d'un utilisateur
 */
const getEntreprise = async (slug: string) => {
    try {
        const response = await Axios.get(`entreprise/get/${slug}`,
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

const historiqueEntreprise = async (slug: string) => {
    try {
        const response = await Axios.get(`entreprise/get_utilisateur_entreprise_historique/${slug}`,
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

const historySuppEntreprise = async (slug: string, uuid: string) => {
    try {
        const response = await Axios.get(`entreprise/get_utilisateur_entreprise_historique_supp/${slug}/${uuid}`,
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

const stockEntreprise = async (entreprise_id: string, user_id: string) => {
    
    try {
        const response = await Axios.get(`entreprise/api_somme_sortie/${entreprise_id}/${user_id}`,
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
/**
 * Ajout d'un utilisateur
 */
const addEntreprise = async (data: EntrepriseType) => {
    try {
        const response = await Axios.post('entreprise/add',
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

/**
 * Mise à jour d'un utilisateur
 */
const updateEntreprise = async (nom: TypeEntreprise) => {
    try {
        const response = await Axios.post('entreprise/set',
            nom,{                         
                headers: {
                    "Content-Type": "multipart/form-data",
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
const removeUserEntreprise = async (nom: DataType) => {
    try {
        const response = await Axios.post('entreprise/remove_user_from_entreprise',
            nom,{                         
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

/**
 * Suppression d'un utilsateur
 */
const deleteEntreprise = async (Entreprise: TypeEntreprise) => {
    try {
        const response = await Axios.post(`entreprise/del`,
            Entreprise,{                         
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

// Décaraltion des esrvices pour import
export const entrepriseService = {
    allEntreprise, getEntreprise, addEntreprise,
    updateEntreprise, deleteEntreprise, allUserEntreprise, 
    getEntrepriseUsers, getUserEntreprises, removeUserEntreprise,
    stockEntreprise, historiqueEntreprise, historySuppEntreprise
}
