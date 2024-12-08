import { FormType } from "./FormType";
export type TypeSlug = {
    all?: string | undefined;
    user_id?: string;
    client_id?: string;
  }
export type DataType = {
    user_id: string;
    libelle?: string;
}
export type DataSlugType = {
    user_id: string;
    all?: string;
    slug?: string;
}

export type InfoSortieType = {

}

export type InfoSousType = {
    libelle: string;
    client?: string;
    pu: number;
    qte: number;
    prix_total: number;
    sortie: InfoSousType;
    // stock: InfoSousType;
}

export type EntreRecupType = {
    user_id: number;
    libelle: string;
    qte: number;
    pu: number;
    categorie_slug: string;
}

export type SortieType = {
    user_id: string;
    client_id?: string;
    entreprise_id?: string;
    categorie_libelle?: string;
    qte: number;
    pu: number;
    entre_id: string;
}

export type SousType = {
    categorie_slug: string;
} & DataType

export type EntreType = {
    qte: number;
    pu: number;
    facture?: File | undefined | null ;
    date?: string;
    ref?: string;
    entreprise_id?: string;
    entre_id?: number;
} & SousType

export type DepenseType = {
    id?: number;
    libelle: string;
    uuid?: string;
    date: string;
    slug?: string;
    somme: number;
    facture?: File | undefined | null ;
    boutique_id?: number;
    user_id?: string;
    entreprise_id?: string;
}

export type TypeAll = {
    all: string;
}
export type SlugType = {
    slug?: string | undefined;
    all?: string;
    user_id?: string;
}

export type CateBouType = {
    id:number;
    libelle:string;
    uuid:string;
    sous_categorie_count:number;
    length: number;
    image?: File | undefined | null ;
} & SlugType


export type TypeEntreprise = {
    adresse: string;
    coordonne:string;
    email:string;
    uuid?:string;
    id:string;
    image:File | unknown;
    licence_active?:boolean;
    licence_code:string;
    licence_date_expiration:string;
    licence_type:string;
    nom:string;
    numero:number;
    user_id?: string;
    pays?: string;
}
type StokcWeekType = {
    month: string;
    count: number;
}
type Detail = {
    id: number;
    qte: number;
    pu: number;
    prix_total: number;
    created_at: string; // ou Date si converti avant utilisation
  };
  
  // Type pour les détails organisés par mois
  type DetailsParMois = {
    [mois: string]: Detail[]; // Une clé dynamique représentant un mois (e.g., "December 2024")
  };
  
export type StockType = {
    somme_entrer_pu: number;
    somme_entrer_qte: number;
    somme_sortie_pu: number;
    somme_sortie_qte: number;
    nombre_entrer: number;
    nombre_sortie: number;
    count_sortie_par_mois?: StokcWeekType[]
    count_entrer_par_mois?: StokcWeekType[]
    details_sortie_par_mois?: DetailsParMois
    details_entrer_par_mois?: DetailsParMois
}


export type RecupType = {
    all?: string;
    uuid?: string;
    client?: string;
    id?: string;
    user_id?: number;
    slug?: string;
    libelle?: string;
    categorie_libelle?: string;
    prix_total?: number;
    pu?: number;
    qte?: number;
    categorie_slug?: string;
    clientName?: string,
    clientAddress?: string,
    clientCoordonne?: string,
    invoiceDate?: string,
    dueDate?: string,
    date?: string,
    username?: string,
    last_name?: string,
    first_name?: string,
    notes?: string,
    image?: File | undefined | null ;
    invoiceNumber?: number,
    all_inventaire?: number,
    post?: TypeEntreprise;

} 

export type CategoriesProps = {
    categories: RecupType[];
  }

export type DonneType = {
    onClick?: ({username, password}: FormType) => void;
}

export interface RouteParams extends Record<string, string>  {
    slug: string;
  }