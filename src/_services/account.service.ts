import { FormClienType, ReponseClient } from "../typescript/ClienType";
import { TypeSlug } from "../typescript/DataType";
import { FormType, FormValueType } from "../typescript/FormType";
import { AvisType, ClienType, LoginType, RegisterResponse, ReponseUser, UserType, UtilisateurType } from "../typescript/UserType";
import Axios from "./caller.service";

/* ── Service Utilisateur ── */
const userRegister = (post: FormValueType): Promise<RegisterResponse> =>
    Axios.post('/utilisateur/register', post).then(r => r.data);

const userClient = (post: ClienType): Promise<RegisterResponse> =>
    Axios.post('/entreprise/client/add', post).then(r => r.data);

const userAdminRegister = (data: FormValueType) =>
    Axios.post('utilisateur/admin/inscription', data);

const userCabinetRegister = (data: FormValueType) =>
    Axios.post('utilisateur/admin/cabinet', data);

const avisCreate = (data: AvisType) =>
    Axios.post('entreprise/avis/add', data);

const userLogin = (post: LoginType): Promise<RegisterResponse> =>
    Axios.post('/utilisateur/login', post).then(r => r.data);

const googleLogin = (token: string): Promise<RegisterResponse> =>
    Axios.post('/utilisateur/google-login', { token }).then(r => r.data);

const userUnGet = () => Axios.get('/utilisateur/user/profil');

const userUnClient = (id: string) => Axios.get(`/entreprise/client/get_un/${id}`);

const userGet = (post: string) => Axios.post('utilisateur/profile/get', post);

const avisGet = (post: string) => Axios.post('entreprise/avis/get', post);

const userAll = (data?: TypeSlug): Promise<ReponseUser> =>
    Axios.post('utilisateur/get', data).then(r => r.data);

const allUsers = (data: string) => Axios.get(`utilisateur/get/${data}`);

const unUser = (data: string) => Axios.get(`utilisateur/user/${data}`);

const userRestrictionDetail = (uuid: string, data?: any) =>
    data
        ? Axios.post(`utilisateur/api/user/restriction/${uuid}/`, data)
        : Axios.get(`utilisateur/api/user/restriction/${uuid}/`);

const userRestriction = () => Axios.get('utilisateur/api/user/restriction/');

const allMesUsers = (data: string) => Axios.get(`utilisateur/get/mes_user/${data}`);

const allClients = (data: string) => Axios.get(`entreprise/clients/${data}`);

const userUpdate = (post: UserType): Promise<ReponseUser> =>
    Axios.post('utilisateur/profile/set', post).then(r => r.data);

const clientUpdate = (post: FormClienType): Promise<ReponseClient> =>
    Axios.post('entreprise/client/set', post).then(r => r.data);

const userDelete = (post: UtilisateurType): Promise<ReponseUser> =>
    Axios.post('utilisateur/profile/del', post).then(r => r.data);

const clientDelete = (post: FormClienType): Promise<ReponseUser> =>
    Axios.post('entreprise/client/del', post).then(r => r.data);

const avisDelete = (post: FormClienType): Promise<ReponseUser> =>
    Axios.post('entreprise/avis/del', post).then(r => r.data);

const userForgot = (post: FormType) => Axios.post('utilisateur/forgot-password', post);

const userUpdatePassword = (post: any) => Axios.post('utilisateur/update-password', post);

const userLogout = () => Axios.get('utilisateur/deconnxion');

export const userService = {
    userRegister, userLogin, userGet, userUpdate, userDelete,
    userAll, userLogout, userUnGet, userAdminRegister, allUsers,
    userForgot, userUpdatePassword, avisDelete, avisGet, avisCreate, allMesUsers,
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
    window.location.reload();
};

const isLogged = () => !!localStorage.getItem('token');
const getToken = () => localStorage.getItem('token') || '0';
const getToken_1 = () => localStorage.getItem('token_1') || '0';

export const accountService = {
    saveToken, logout, isLogged, getToken, getToken_1
};

export const connect: string = accountService.getToken();
export const token_1: string = accountService.getToken_1();