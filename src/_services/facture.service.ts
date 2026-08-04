import { EntreType } from "../typescript/DataType";
import { FacSorType } from "../typescript/fac";
import Axios from "./caller.service";

const MULTIPART_HEADER = {
    headers: { "Content-Type": "multipart/form-data" }
};

/* ── Service Factures Entrées ── */
const allFacEntre = (slug: string) => Axios.post('entreprise/facture/entre/get', slug);
const getFacEntre = (slug: string) => Axios.get(`entreprise/facture/entre/get/${slug}`);
const getAllFacEntre = (slug: string, uuid: string) => Axios.get(`entreprise/facture/entre/get_facEntersEntreprise_entreprise/${uuid}`);
const addFacEntre = (data: FacSorType) => Axios.post('entreprise/facture/entre/add', data, MULTIPART_HEADER);
const updateFacEntre = (nom: FacSorType) => Axios.post('entreprise/facture/entre/set', nom, MULTIPART_HEADER);
const deleteFacEntre = (categorie: FacSorType) => Axios.post('entreprise/facture/entre/del', categorie);

export const facEntrerService = {
    allFacEntre, getFacEntre, addFacEntre, updateFacEntre, deleteFacEntre, getAllFacEntre
};

/* ── Service Factures Sorties ── */
const allFacSortie = (slug: string) => Axios.post('entreprise/facture/sortie/get', slug);
const getFacSortie = (slug: string) => Axios.get(`entreprise/facture/sortie/get/${slug}`);
const getAllFacSortie = (slug: string, uuid: string) => Axios.get(`entreprise/facture/sortie/get_facSortiesEntreprise_entreprise/${uuid}`);
const addFacSortie = (data: FacSorType) => Axios.post('entreprise/facture/sortie/add', data, MULTIPART_HEADER);
const updateFacSortie = (nom: EntreType) => Axios.post('entreprise/facture/sortie/set', nom, MULTIPART_HEADER);
const deleteFacSortie = (categorie: EntreType) => Axios.post('entreprise/facture/sortie/del', categorie);

export const facSortieService = {
    allFacSortie, getFacSortie, addFacSortie, updateFacSortie, deleteFacSortie, getAllFacSortie
};
