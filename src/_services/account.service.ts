import { FormClienType, ReponseClient } from "../typescript/ClienType";
import { TypeSlug } from "../typescript/DataType";
import { FormType, FormValueType } from "../typescript/FormType";
import { AvisType, ClienType, LoginType, RegisterResponse, ReponseUser, UserType, UtilisateurType } from "../typescript/UserType";
import Axios from "./caller.service";

/* ── Service Utilisateur ── */
const userRegister = (post: FormValueType): Promise<RegisterResponse> =>
    Axios.post('/utilisateur/register', post);

const userClient = (post: ClienType): Promise<RegisterResponse> =>
    Axios.post('/entreprise/client/add', post);

const userAdminRegister = (data: FormValueType) =>
    Axios.post('utilisateur/admin/inscription', data);

const userCabinetRegister = (data: FormValueType) =>
    Axios.post('utilisateur/admin/cabinet', data);

const avisCreate = (data: AvisType) =>
    Axios.post('entreprise/avis/add', data);

const userLogin = (post: LoginType): Promise<RegisterResponse> =>
    Axios.post('/utilisateur/login', post);

const googleLogin = (token: string): Promise<RegisterResponse> =>
    Axios.post('/utilisateur/google-login', { token });

const userUnGet = () => Axios.get('/utilisateur/user/profil');

const userUnClient = (id: string) => Axios.get(`/entreprise/client/get_un/${id}`);

const userGet = (post: string) => Axios.post('utilisateur/profile/get', post);

const avisGet = (post: string) => Axios.post('entreprise/avis/get', post);

const avisReply = (data: { avis_uuid: string; reponse: string }) =>
    Axios.post('entreprise/avis/repondre', data);

const userAll = (data?: TypeSlug): Promise<ReponseUser> =>
    Axios.post('utilisateur/get', data);

const allUsers = () => Axios.get(`utilisateur/user/all`);

const unUser = (data: string) => Axios.get(`utilisateur/user/${data}`);

const userRestrictionDetail = (uuid: string, data?: any) =>
    data
        ? Axios.post(`utilisateur/api/user/restriction/${uuid}/`, data)
        : Axios.get(`utilisateur/api/user/restriction/${uuid}/`);

const userRestriction = () => Axios.get('utilisateur/api/user/restriction/');

const allMesUsers = (data: string) => Axios.get(`utilisateur/get/mes_user/${data}`);

const allClients = (data: string) => Axios.get(`entreprise/clients/${data}`);

const userUpdate = (post: UserType): Promise<ReponseUser> =>
    Axios.post('utilisateur/profile/set', post);

const clientUpdate = (post: FormClienType): Promise<ReponseClient> =>
    Axios.post('entreprise/client/set', post);

const userDelete = (post: UtilisateurType): Promise<ReponseUser> =>
    Axios.post('utilisateur/profile/del', post);

const clientDelete = (post: FormClienType): Promise<ReponseUser> =>
    Axios.post('entreprise/client/del', post);

const avisDelete = (post: FormClienType): Promise<ReponseUser> =>
    Axios.post('entreprise/avis/del', post);

const userForgot = (post: FormType) => Axios.post('utilisateur/forgot-password', post);

const userUpdatePassword = (post: any) => Axios.post('utilisateur/update-password', post);

const userLogout = () => Axios.get('utilisateur/deconnxion');

export const userService = {
    userRegister, userLogin, userGet, userUpdate, userDelete,
    userAll, userLogout, userUnGet, userAdminRegister, allUsers,
    userForgot, userUpdatePassword, avisDelete, avisGet, avisReply, avisCreate, allMesUsers,
    allClients, userClient, userUnClient, clientUpdate, clientDelete,
    userCabinetRegister, unUser, userRestrictionDetail, userRestriction,
    googleLogin
};

/* ── Service Gestion de Compte ── */
const saveToken = (token: string, tok?: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('token_1', tok || '');
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    localStorage.removeItem('entreprise-uuid');
    localStorage.removeItem('token_1');
    localStorage.removeItem('errorCount');
    window.location.href = '/auth/login';
};

const isLogged = () => !!localStorage.getItem('token');
const getToken = () => localStorage.getItem('token') || '0';
const getToken_1 = () => localStorage.getItem('token_1') || '0';

export const accountService = {
    saveToken, logout, isLogged, getToken, getToken_1
};

export const connect: string = accountService.getToken();
export const token_1: string = accountService.getToken_1();
