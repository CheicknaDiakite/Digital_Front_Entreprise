import { CategorieType, ReponseCategorie } from '../typescript/CategorieType';
import { DataSlugType, DataType, DepenseType, EntreType, SlugType, SortieType, TypeSlug } from '../typescript/DataType';
import { CategorieFormType, EntreFormType, SousCategorieFormType } from '../typescript/FormType';
import Axios from './caller.service';

const MULTIPART_HEADER = {
    headers: { "Content-Type": "multipart/form-data" }
};

/* ── Service Catégorie ── */
const categoriesEntreprise = (uuid: string): Promise<ReponseCategorie> =>
    Axios.get(`entreprise/categorie/get_categories_utilisateur/${uuid}`).then(r => r.data);

const getCategorie = (slug: string): Promise<ReponseCategorie> =>
    Axios.get(`entreprise/categorie/${slug}`).then(r => r.data);

const addCategorie = (data: CategorieFormType): Promise<ReponseCategorie> =>
    Axios.post('entreprise/categorie/add', data, MULTIPART_HEADER).then(r => r.data);

const updateCategorie = (nom: CategorieType): Promise<ReponseCategorie> =>
    Axios.post('entreprise/categorie/set', nom, MULTIPART_HEADER).then(r => r.data);

const deleteCategorie = (categorie: CategorieType): Promise<ReponseCategorie> =>
    Axios.post('entreprise/categorie/del', categorie).then(r => r.data);

export const categorieService = {
    getCategorie, addCategorie, updateCategorie, deleteCategorie, categoriesEntreprise
};

/* ── Service Sous-Catégorie ── */
const allSousCategorie = (post: SlugType) =>
    Axios.post('entreprise/sous_categorie/get', post);

const getAllSousCategorie = (slug: string) =>
    Axios.get(`entreprise/sous_categorie/get_sous_categories_par_categorie/${slug}`);

const getSousCategorie = (slug: string) =>
    Axios.get(`entreprise/sous_categorie/get/${slug}`);

const getSousCategoriesUser = (uuid: string) =>
    Axios.get(`entreprise/sous_categorie/get_sous_categories_utilisateur/${uuid}`);

const getInfo = (slug: SlugType) =>
    Axios.post('entreprise/info_sous_cat/get', slug);

const addSousCategorie = (data: SousCategorieFormType) =>
    Axios.post('entreprise/sous_categorie/add', data, MULTIPART_HEADER);

const updateSousCategorie = (nom: SousCategorieFormType) =>
    Axios.post('entreprise/sous_categorie/set', nom, MULTIPART_HEADER);

const deleteSousCategorie = (categorie: DataType) =>
    Axios.post('entreprise/sous_categorie/del', categorie);

export const souscategorieService = {
    allSousCategorie, getSousCategorie, getInfo,
    addSousCategorie, updateSousCategorie, deleteSousCategorie,
    getAllSousCategorie, getSousCategoriesUser
};

/* ── Service Entrées ── */
const allEntre = (slug: TypeSlug) => Axios.post('entreprise/entre/get', slug);
const getEntre = (slug: string) => Axios.get(`entreprise/entre/get/${slug}`);
const getAllEntre = (uuid: string) => Axios.get(`entreprise/entre/get_entrers_entreprise/${uuid}`);
const addEntre = (data: EntreFormType) => Axios.post('entreprise/entre/add', data);
const updateEntre = (nom: EntreType) => Axios.post('entreprise/entre/set', nom);
const deleteEntre = (categorie: DataType) => Axios.post('entreprise/entre/del', categorie);

export const entrerService = {
    allEntre, getEntre, addEntre, updateEntre, deleteEntre, getAllEntre
};

/* ── Service Dépenses ── */
const allDepense = (slug: string) => Axios.post('entreprise/depense/get', slug);
const getDepense = (slug: string) => Axios.get(`entreprise/depense/get/${slug}`);
const getAllDepense = (uuid: string) => Axios.get(`entreprise/depense/get_depenses_entreprise/${uuid}`);
const getSumDepense = (uuid: string) => Axios.get(`entreprise/depense/get_depenses_somme/${uuid}`);
const addDepense = (data: DepenseType) => Axios.post('entreprise/depense/add', data, MULTIPART_HEADER);
const updateDepense = (nom: DepenseType) => Axios.post('entreprise/depense/set', nom, MULTIPART_HEADER);
const deleteDepense = (categorie: DepenseType) => Axios.post('entreprise/depense/del', categorie);

export const depenseService = {
    allDepense, getDepense, addDepense, updateDepense, deleteDepense, getAllDepense, getSumDepense
};

/* ── Service Sorties ── */
const allSortie = (post: DataSlugType) => Axios.post('entreprise/sortie/get', post);

const getAllSortie = (slug: string, params?: any) =>
    Axios.get(`entreprise/sortie/get_sorties_entreprise/${slug}`, { params });

const getSortie = (slug: string) => Axios.get(`entreprise/sortie/get/${slug}`);
const addSortie = (data: SortieType | SortieType[]) => Axios.post('entreprise/sortie/add', data);
const updateSortie = (nom: any) => Axios.post('entreprise/sortie/set', nom);
const updateFacSortie = (nom: SortieType) => Axios.post('entreprise/sortie/setFac', nom);
const deleteSortie = (categorie: DataType) => Axios.post('entreprise/sortie/del', categorie);

export const sortieService = {
    allSortie, getSortie, addSortie, updateSortie, deleteSortie, getAllSortie, updateFacSortie
};

/* ── Service Factures Générales ── */
const getFactures = (entreprise_uuid: string, params?: any) =>
    Axios.get(`entreprise/facture/list/${entreprise_uuid}`, { params });

const getFacture = (uuid: string) => Axios.get(`entreprise/facture/detail/${uuid}`);
const payerFacture = (uuid: string, montant: number) => Axios.post(`entreprise/facture/payer/${uuid}`, { montant });
const deleteFacture = (uuid: string) => Axios.post(`entreprise/facture/delete/${uuid}`, {});

export const factureService = {
    getFactures, getFacture, payerFacture, deleteFacture
};
