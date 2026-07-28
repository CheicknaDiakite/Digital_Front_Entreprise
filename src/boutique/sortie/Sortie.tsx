import { Box, Button, Pagination, Paper, Skeleton, TextField, Typography } from "@mui/material";
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { RecupType, SortieType } from "../../typescript/DataType";
import { connect } from "../../_services/account.service";
import { useStoreCart } from "../../usePerso/cart_store";
import { useCreateSortie, useGetAllEntre, useGetAllSortie } from "../../usePerso/fonction.entre";
import Fact from "../factureCard/Fact";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TableSortie from "./TableSortie";
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { useFetchEntreprise, useFetchUser } from "../../usePerso/fonction.user";
import { useStoreUuid } from "../../usePerso/store";
import { formatNumberWithSpaces } from "../../usePerso/fonctionPerso";
import { SingleValue } from 'react-select';
import { format } from "date-fns";
import './mobile-sortie.css';


export type TypeText = {
  clientName: string,
  clientAddress: string,
  numeroFac: string,
  clientCoordonne: string,
  invoiceDate: string,
  dueDate: string,
  notes: string,
  invoiceNumber?: number,
}

export default function Sortie() {

  const entreprise_uuid = useStoreUuid((state) => state.selectedId)
  const { unUser } = useFetchUser()
  const [isMobile, setIsMobile] = useState(false);

  const [showInvoice, setShowInvoice] = useState(false); // État pour afficher ou masquer la section de facture

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOnClick = () => {
    setShowInvoice(true); // Affiche la section de facture lorsque le bouton est cliqué
  };
  const handleOpenClick = () => {
    setShowInvoice(false); // Affiche la section de facture lorsque le bouton est cliqué
  };

  const { unEntreprise: entreprise } = useFetchEntreprise(entreprise_uuid)

  const setSorties = useStoreCart(state => state.setSorties)

  const { sortiesEntreprise, isLoading, isError } = useGetAllSortie(entreprise_uuid!)

  const { ajoutSortie } = useCreateSortie()

  const [basket, setBasket] = useState<SortieType[]>([]);

  const itemsPerPage = isMobile ? 10 : 25; // Nombre d'éléments par page

  // État pour la page courante et les éléments par page
  const [currentPage, setCurrentPage] = useState(1);

  // États pour les dates de recherche
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  // Filtrage entre les deux dates sélectionnées
  const filteredBoutiques = sortiesEntreprise?.filter((item) => {
    if (!item.date) {
      return false; // Ignore les éléments sans date valide
    }

    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;

    return (
      (startDate === null || itemDate >= startDate) &&
      (endDate === null || itemDate <= endDate)
    );
  });

  const reversedSorties = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(reversedSorties.length / itemsPerPage);

  const reversedSort = reversedSorties.filter((info: any) => info.is_remise === false);

  const totalPrice = reversedSort?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte * row.pu : 0;
    return acc + price;
  }, 0);

  const totalQte = reversedSorties?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte : 0;
    return acc + price;
  }, 0);

  // Calculs pour le panier (basket)
  const basketTotalAmount = basket.reduce((acc, item) => {
    return acc + (Number(item.pu || 0) * Number(item.qte || 0));
  }, 0);

  const basketTotalQte = basket.reduce((acc, item) => {
    return acc + Number(item.qte || 0);
  }, 0);

  // Récupération des éléments à afficher sur la page courante
  const sortiesBoutic = reversedSorties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gestion du changement des dates
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
    setCurrentPage(1);
  };

  // Gestion du changement de page
  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSaveSorties = () => {
    setSorties(sortiesEntreprise);
  };

  const [formValues, setFormValues] = useState<SortieType>({
    user_id: '',
    entre_id: '',
    client_id: '',
    unite: 'kilos',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const calculateAmount = () => {
      setAmount(formValues.pu && formValues.qte ? Number(formValues.pu) * Number(formValues.qte) : 0);
    };

    calculateAmount();
  }, [amount, formValues.pu, formValues.qte, setAmount]);

  const handleAutoCompleteChange = (_: SyntheticEvent<Element, Event>,
    value: string | RecupType | null,
    // reason: AutocompleteChangeReason
  ) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({
        ...formValues,
        entre_id: value.uuid ?? '',
        unite: value.unite || 'kilos',
      });
    } else {
      setFormValues({
        ...formValues,
        entre_id: '',
        unite: 'kilos',
      });
    }
  };

  const itemDate = format(new Date(), 'yyyy-dd-MM');

  const handleAutoClientChange = (_: SyntheticEvent<Element, Event>,
    value: string | RecupType | null,
    // reason: AutocompleteChangeReason
  ) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({
        ...formValues,
        client_id: value.uuid ?? '',
      });
    } else {
      setFormValues({
        ...formValues,
        client_id: '',
      });
    }
  };

  const [selectedOption, setSelectedOption] = useState<RecupType | null>(null);
  const [selectedClient, setSelectedClient] = useState<RecupType | null>(null);

  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    clientAddress: '',
    clientCoordonne: '',
    clientId: '',
    clientNumero: 0,
  });

  const handleChange = (selected: SingleValue<RecupType>) => {
    // Assurez-vous que "selected" contient la clé du prix unitaire, par exemple "pu"
    if (selected) {
      setFormValues(prev => ({
        ...prev,
        entre_id: selected.uuid || "",
        pu: selected.pu || 0,
        is_prix: selected.is_prix || false,
        unite: selected.unite || 'kilos',
        categorie_libelle: selected.categorie_libelle || "", // pour l'affichage dans le panier
        libelle: selected.libelle || "", // pour l'affichage dans le panier
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        entre_id: "",
        pu: 0,
        unite: '',
        categorie_libelle: '',
        libelle: '',
      }));
    }
    setSelectedOption(selected); // Met à jour l'état de l'option sélectionnée
  };

  const handleClient = (selected: SingleValue<RecupType>) => {
    setFormValues(prev => ({
      ...prev,
      client_id: selected?.uuid
    }));
    setSelectedClient(selected);

    if (selected) {
      setClientInfo({
        clientName: selected.nom || '', // Remplacez par la clé appropriée pour le nom
        clientAddress: selected.adresse || '', // Remplacez par la clé appropriée pour l'adresse
        clientCoordonne: selected.adresse || '', // Remplacez par la clé appropriée pour l'adresse
        clientId: selected?.uuid || '', // Remplacez par la clé appropriée pour l'adresse
        clientNumero: selected.numero || 0, // Remplacez par la clé appropriée pour l'adresse
      });
    } else {
      setClientInfo({ clientName: '', clientAddress: '', clientCoordonne: '', clientId: '', clientNumero: 0 });
    }
  };

  const { entresEntreprise: entres, refetch } = useGetAllEntre(entreprise_uuid!)

  const ent = entres.filter(info => info.qte !== 0 && info.is_sortie);

  const [scannedCode, setScannedCode] = useState<string>('');
  const [open, openchange] = useState(false);

  const functionopen = () => {
    openchange(true);
  };
  const closeopen = () => {
    openchange(false);
  };

  const handleScanResult = (code: string) => {
    setScannedCode(code);
    // Optionnel : fermer le dialog après scan
    openchange(false);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formValues.entre_id || !formValues.qte) {
      return;
    }

    // Ajouter au panier au lieu d'envoyer directement
    const newItem: SortieType = {
      ...formValues,
      user_id: connect,
    }

    setBasket([...basket, newItem]);

    setFormValues({
      ...formValues,
      qte: '',
      pu: '',
      entre_id: '',
      categorie_libelle: '',
      libelle: '',
    })

    setSelectedOption(null);
    setScannedCode("")
  };

  const handleFinalSubmit = async () => {
    if (basket.length === 0) return;

    await ajoutSortie(basket as any);
    setBasket([]);
    setSelectedClient(null);
    setClientInfo({ clientName: '', clientAddress: '', clientCoordonne: '', clientId: '', clientNumero: 0 });
    await refetch();
  };

  const removeItemFromBasket = (index: number) => {
    setBasket(basket.filter((_, i) => i !== index));
  };

  // Pour la remise

  const selectedIds = useStoreCart(state => state.selectedIds)
  const sortiess = useStoreCart(state => state.sorties);
  const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  // const totalPrix = selectSorties.reduce((sum, sor) => sum + sor.prix_total, 0);

  const total = selectSorties?.reduce((acc, sortie) => {
    // Convertir prix_total en nombre ou utiliser 0 si invalide
    const prixTotal = sortie.prix_total ? parseFloat(String(sortie.prix_total)) : 0;
    return acc + prixTotal;
  }, 0);

  const [discountedTotal] = useState(total); // Total avec remise
  const [payerTotal] = useState(total); // Total avec remise
  // fin
  if (isLoading) {
    return (
      <Box className={`${isMobile ? 'mobile-p-4' : 'w-300'}`}>
        <Skeleton className="mobile-loading" />
        <Skeleton animation="wave" className="mobile-loading" />
        <Skeleton animation={false} className="mobile-loading" />
      </Box>
    );
  }

  if (isError) {
    window.location.reload();
    return (
      <div className={`${isMobile ? 'mobile-p-4' : ''}`}>
        <Typography variant="h6" color="error" className="mobile-alert">
          Error ...
        </Typography>
      </div>
    );
  }

  if (sortiesEntreprise) {
    return (
      <div>
        {/* ── Page principale ── */}
        <Paper
          elevation={0}
          sx={{
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            marginTop: '24px',
            bgcolor: 'rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Header ── */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 16,
              paddingBottom: 20,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                }}>
                  <LocalAtmIcon style={{ fontSize: 20, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: isMobile ? '1.2rem' : '1.5rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                    Gestion des Sorties
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {reversedSorties.length} enregistrement{reversedSorties.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => { handleSaveSorties(); handleOnClick(); }}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    px: 3,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                      boxShadow: '0 6px 20px rgba(99,102,241,0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Créer Facture
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleOpenClick}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    px: 3,
                    py: 1.2,
                    borderColor: 'rgba(239,68,68,0.4)',
                    color: '#f87171',
                    '&:hover': {
                      background: 'rgba(239,68,68,0.08)',
                      borderColor: '#ef4444',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>

            {/* ── Filtres de dates ── */}
            {(unUser.role === 1 || unUser.role === 2) && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(99,102,241,0.05)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}>
                <TextField
                  label="Date de début"
                  type="date"
                  value={selectedStartDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '9px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Date de fin"
                  type="date"
                  value={selectedEndDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '9px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                      },
                    },
                  }}
                />
              </div>
            )}

            {/* ── Cartes KPI ── */}
            {unUser.role === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                {/* CA */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '20px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.08) 100%)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(99,102,241,0.4)',
                    flexShrink: 0,
                  }}>
                    <LocalAtmIcon style={{ fontSize: 26, color: '#fff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      Chiffre d'affaires
                    </div>
                    <div style={{ fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {formatNumberWithSpaces(totalPrice)}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginLeft: 4 }}>F</span>
                    </div>
                  </div>
                </div>

                {/* Quantité */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '20px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.06) 100%)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(16,185,129,0.4)',
                    flexShrink: 0,
                  }}>
                    <QuantityLimitsIcon style={{ fontSize: 26, color: '#fff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      Quantité totale
                    </div>
                    <div style={{ fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                      {formatNumberWithSpaces(totalQte)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Table Section ── */}
            <div>
              <TableSortie
                onSubmit={onSubmit}
                onChange={onChange}
                formValues={formValues}
                amount={amount}
                handleAutoCompleteChange={handleAutoCompleteChange}
                handleAutoClientChange={handleAutoClientChange}
                handleSaveSorties={handleSaveSorties}
                handleChange={handleChange}
                handleClient={handleClient}
                selectedOption={selectedOption}
                selectedClient={selectedClient}
                list={sortiesBoutic}
                ent={ent}
                scannedCode={scannedCode}
                functionopen={functionopen}
                open={open}
                handleScanResult={handleScanResult}
                closeopen={closeopen}
                basket={basket}
                handleFinalSubmit={handleFinalSubmit}
                removeItemFromBasket={removeItemFromBasket}
                basketTotalAmount={basketTotalAmount}
                basketTotalQte={basketTotalQte}
              />
            </div>

            {/* ── Pagination ── */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-1px)' },
                  },
                  '& .Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5) !important',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                  },
                }}
              />
            </div>

          </div>
        </Paper>

        {/* ── Aperçu Facture ── */}
        {showInvoice && entreprise && (
          <div style={{ marginTop: 16 }}>
            <Fact
              invoiceDate={itemDate}
              post={entreprise}
              discountedTotal={discountedTotal}
              payerTotal={payerTotal}
              clientName={clientInfo.clientName}
              invoiceNumber={clientInfo.clientNumero}
              clientId={clientInfo.clientId}
            />
          </div>
        )}
      </div>
    );
  }
}
