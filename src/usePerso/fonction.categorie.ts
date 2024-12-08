import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CategorieFormType, SousCategorieFormType } from "../typescript/FormType";
import { useNavigate } from "react-router-dom";
import { CateBouType, DataType, InfoSousType, RecupType, SlugType } from "../typescript/DataType";
import { categorieService, souscategorieService } from "../_services";
import { foncError } from "./fonctionPerso";
import { CategorieType } from "../typescript/CategorieType";

export function useFetchCategorie(slug: string) {
    const [unCategorie, setUnCategorie] = useState<CategorieType>({
      uuid: '',
      libelle: '',
      slug: '',
      sous_categorie_count: 0,
      });
  
    const { data: us, isLoading, isError } = useQuery({
      queryKey: ["entreRecup", slug],
      queryFn: () =>
        categorieService.getCategorie(slug).then((res) => {
          if (res.data.etat === true) {
            return res.data.donnee;
          } else {
            // throw new Error("Les identifiants sont incorrects");
            toast.error(res.data.message);
          }
        }),
    });
  
    useEffect(() => {
      if (us) {
        setUnCategorie(us);
      }
    }, [us]);
  
    return { unCategorie, setUnCategorie, isLoading, isError };
}
  
export function useCategoriesEntreprise(slug: string, uuid: string) {
    const [cateEntreprises, setCateEntreprise] = useState<CateBouType[]>([]);
  
    const { data: us, isLoading, isError } = useQuery({
      queryKey: ["enRecup", slug],
      queryFn: async () => {
        const res = await categorieService.categoriesEntreprise(slug, uuid);
          if (res.data.etat === true) {
            const donnees = res.data.donnee as unknown as CateBouType[]; // Si c'est un tableau
            return donnees || [];
          } else {
            // throw new Error("Les identifiants sont incorrects");
            toast.error(res.data.message);
            return [];
          }
        }
        });
  
    useEffect(() => {
      if (us) {
        setCateEntreprise(us);
      }
    }, [us]);
  
    return { cateEntreprises, isLoading, isError };
}
  
export function useFetchAllCategorie(slug: SlugType) {
    const [categories, setCategorie] = useState<CategorieType[]>([]);

    const {data: us, isLoading, isError} = useQuery({
      queryKey: ["entre", slug],
      queryFn: async () =>{
        const res = await categorieService.allCategorie(slug);
          if (res.data.etat === true) {
            const donnees = res.data.donnee as unknown as CategorieType[]; // Si c'est un tableau
            return donnees || [];
          } else {
            // toast.error("Les identifiants sont incorrects");
            toast.error(res.data.message);
            return [];
          }
        }
        });
    

    useEffect(() => {
        if (us) {
            setCategorie(us);
        }
      }, [us]);

    return { categories, setCategorie, isLoading, isError };
}

export function useCreateCategorie() {
  
    const useQ = useQueryClient();
    
    const ajout = useMutation({
      mutationFn: (data: CategorieFormType) => {
        return categorieService.addCategorie(data)
        .then((res) => {
          if (res.data.etat===false) {
            if(res.data.message !== "requette invalide"){
              toast.error(res.data.message);
            }
          } else {
            useQ.invalidateQueries({ queryKey: ["enRecup"] });
            toast.success("C'est ajouter avec succès");
            // navigate('/')
          }
      })
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
      },
    });
  
    const ajoutCategorie = (post: CategorieFormType) => {
      ajout.mutate(post);
    };

    return { ajoutCategorie }
}

export function useUpdateCategorie() {
    const navigate = useNavigate();
    const useQ = useQueryClient();

    const modif = useMutation({
      mutationFn: (data: CategorieType) => {
        return categorieService
          .updateCategorie(data)
          .then((res) => {
            if (res.data.etat === true) {
              toast.success("Modification reuissi");
              useQ.invalidateQueries({ queryKey: ["entre"] });
              // navigate("/admin/formation/index")
              navigate(-1);
            } else {
              toast.error(res.data.message);
            }
          })
          .catch((err) => console.log(err));
      },
      onError: (error) => {
        foncError(error);
      },
    });

    const updateCategorie = (chap: CategorieType) => {
      modif.mutate(chap);
    };

    return {updateCategorie}
}

export function useDeleteCategorie() {
    const navigate = useNavigate();
    const useQ = useQueryClient();
    
    const del = useMutation({
      mutationFn: (post: CategorieType) => {
        return categorieService.deleteCategorie(post).then((res) => {
          if (res.data.etat !== true) {
            toast.error(res.data.message);
          } else {
            useQ.invalidateQueries({ queryKey: ["entre"] });
            navigate(-1);
            toast.success("Supprimée avec succès");
          }
        });
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
        toast.error(message);
      }
    });

    const deleteCategorie = (post: CategorieType) => {
      del.mutate(post);
    };

    return {deleteCategorie}
}

// SOUS_CATEGORIE

export function useFetchSousCate(slug: string) {
  const [unSousCate, setUnSousCate] = useState<SousCategorieFormType>({
      libelle: '',
      user_id: '',
      categorie_slug: '',
    });

  const { data: us, isLoading, isError } = useQuery({
    queryKey: ["sortieRecup", slug],
    queryFn: () =>
        souscategorieService.getSousCategorie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // throw new Error("Les identifiants sont incorrects");
          // toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
    if (us) {
      setUnSousCate(us);
    }
  }, [us]);

  return { unSousCate, setUnSousCate,  isLoading, isError };
}

export function useAllGetSousCate(slug: string) {
  const [getSousCates, setSousCate] = useState<RecupType[]>([]);
  
  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["SouCategorie", slug],
    queryFn: () =>
        souscategorieService.getAllSousCategorie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          // toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
        setSousCate(us);
      }
    }, [us]);

  return { getSousCates, setSousCate, isLoading, isError };
}

export function useFetchAllSousCate(slug: string, uuid: string) {
  const [souscategories, setSousCate] = useState<RecupType[]>([]);
  
  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["SouCategorie", slug],
    queryFn: () =>
        souscategorieService.getSousCategoriesUser(slug, uuid).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          // toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
          setSousCate(us);
      }
    }, [us]);

  return { souscategories, setSousCate, isLoading, isError };
}

export function useInfoSousCate(slug: SlugType) {
  const [infos, setInfo] = useState<InfoSousType[]>([]);

  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["info", slug],
    queryFn: () =>
        souscategorieService.getInfo(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
        setInfo(us);
      }
    }, [us]);

  return { infos, isLoading, isError };
}

export function useCateSousCate(slug: SlugType) {
  const [sousCate, setSousCate] = useState<InfoSousType[]>([]);
  
  const {data: us, isLoading, isError} = useQuery({
    queryKey: ["info", slug],
    queryFn: () =>
        souscategorieService.allSousCategorie(slug).then((res) => {
        if (res.data.etat === true) {
          return res.data.donnee;
        } else {
          // toast.error("Les identifiants sont incorrects");
          toast.error(res.data.message);
        }
      }),
  });

  useEffect(() => {
      if (us) {
        setSousCate(us);
      }
    }, [us]);

  return { sousCate, isLoading, isError };
}

export function useCreateSousCate() {
  const useQ = useQueryClient();
  
  const ajout = useMutation({
    mutationFn: (data: SousCategorieFormType) => {
      return souscategorieService.addSousCategorie(data)
      .then((res) => {
        if (res.data.etat===false) {
          if(res.data.message !== "requette invalide"){
            toast.error(res.data.message);
          }
        } else {
          useQ.invalidateQueries({ queryKey: ["SouCategorie"] });
          toast.success("C'est ajouter avec succès");
          // navigate('/')
        }
    })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
      toast.error(message);
    },
  });

  const ajoutSousCate = (post: SousCategorieFormType) => {
    ajout.mutate(post);
  };

  return { ajoutSousCate }
}

export function useUpdateSousCate() {
  const navigate = useNavigate();
  const useQ = useQueryClient();

  const modif = useMutation({
    mutationFn: (data: SousCategorieFormType) => {
      return souscategorieService
      .updateSousCategorie(data)
        .then((res) => {
          if (res.data.etat === true) {
            toast.success("Modification reuissi");
            useQ.invalidateQueries({ queryKey: ["SouCategorie"] });
            // navigate("/admin/formation/index")
            navigate(-1);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
      toast.error(message);
    },
  });

  const updateSousCate = (chap: SousCategorieFormType) => {
    modif.mutate(chap);
  };

  return {updateSousCate}
}

export function useDeleteSousCate() {
  const navigate = useNavigate();
  const useQ = useQueryClient();
  
  const del = useMutation({
    mutationFn: (post: DataType) => {
      return souscategorieService.deleteSousCategorie(post).then((res) => {
        if (res.data.etat !== true) {
          toast.error(res.data.message);
        } else {
          useQ.invalidateQueries({ queryKey: ["SouCategorie"] });
          navigate(-1);
          toast.success("Supprimée avec succès");
        }
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Une erreur est survenue";
      toast.error(message);
    },
    
  });

  const deleteSousCate = (post: DataType) => {
    del.mutate(post);
  };

  return {deleteSousCate}
}