import { EntrepriseType } from "../typescript/Account";
import { DataType, TypeEntreprise } from "../typescript/DataType";
import Axios from "./caller.service";

const MULTIPART_HEADER = {
    headers: { "Content-Type": "multipart/form-data" }
};

/* ── Service Entreprise ── */
const allEntreprise = (post: string) => Axios.post('entreprise/get', post);
const getEntrepriseUsers = (post: string) => Axios.get(`entreprise/get_entreprise_utilisateurs/${post}`);
const getUserEntreprises = () => Axios.get('entreprise/user_entreprises');
const allUserEntreprise = (post: string) => Axios.post('entreprise/get/user', post);
const getEntreprise = (slug: string) => Axios.get(`entreprise/get/${slug}`);
const historiqueEntreprise = () => Axios.get('entreprise/get_utilisateur_entreprise_historique');
const historySuppEntreprise = (uuid: string) => Axios.get(`entreprise/get_utilisateur_entreprise_historique_supp/${uuid}`);
const historyClientEntreprise = (uuid: string) => Axios.get(`entreprise/get_utilisateur_entreprise_historique_client/${uuid}`);
const stockEntreprise = (entreprise_id: string) => Axios.get(`entreprise/statistiques/${entreprise_id}`);

const sortieUserEntreprise = (entreprise_id: string, user_uuid?: string, start_date?: string, end_date?: string) => {
    const params = new URLSearchParams();
    if (user_uuid) params.append('user_uuid', user_uuid);
    if (start_date) params.append('start_date', start_date);
    if (end_date) params.append('end_date', end_date);
    const queryString = params.toString();
    return Axios.get(`entreprise/count_sortie_par_utilisateur/${entreprise_id}${queryString ? `?${queryString}` : ''}`);
};

const stockCateSemaine = (entreprise_id: string, annee?: number) =>
    Axios.get(`entreprise/sous-categories-sorties/${entreprise_id}${annee ? `?annee=${annee}` : ''}`);

const addEntreprise = (data: EntrepriseType) => Axios.post('entreprise/add', data);
const updateEntreprise = (nom: TypeEntreprise) => Axios.post('entreprise/set', nom, MULTIPART_HEADER);
const removeUserEntreprise = (nom: DataType) => Axios.post('entreprise/remove_user_from_entreprise', nom);
const deleteEntreprise = (Entreprise: TypeEntreprise) => Axios.post('entreprise/del', Entreprise);

export const entrepriseService = {
    allEntreprise, getEntreprise, addEntreprise,
    updateEntreprise, deleteEntreprise, allUserEntreprise,
    getEntrepriseUsers, getUserEntreprises, removeUserEntreprise,
    stockEntreprise, stockCateSemaine, historiqueEntreprise, historySuppEntreprise,
    sortieUserEntreprise, historyClientEntreprise
};
