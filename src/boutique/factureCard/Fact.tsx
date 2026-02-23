import { ChangeEvent, Fragment, useEffect, useRef, useState } from 'react'
import ReactToPrint from 'react-to-print'
import Header from './component/Header';
// import MainDetails from './component/MainDetails';
// import ClientDetails from './component/ClientDetails';
// import Dates from './component/Dates';
import Notes from './component/Notes';
// import Footer from './component/Footer';
import RemoveIcon from '@mui/icons-material/Remove';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { useStoreCart } from '../../usePerso/cart_store';
import TableFact from './TableFact';
import "./print.css";
// import { generateOrderNumber } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import { connect } from '../../_services/account.service';
import { RecupType } from '../../typescript/DataType';
import { Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, IconButton, Box, Modal, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Grid, Checkbox, FormControlLabel } from '@mui/material';
import { useCreateFacSortie } from '../../usePerso/fonction.facture';
import CloseIcon from '@mui/icons-material/Close';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-hot-toast';
import { useUpdateSortie } from '../../usePerso/fonction.entre';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../usePerso/store';
import { useFetchEntreprise } from '../../usePerso/fonction.user';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  p: 4,
};

export type TypeText = {
  clientName: string,
  clientAddress: string,
  numeroFac: string,
  id?: string,
  clientCoordonne: string,
  invoiceDate: string,
  dueDate: string,
  notes: string,
  invoiceNumber?: number,
}

interface ChildModalProps {
  discountAmount: number;
  total: number;
  amountPaid: number;
  clientName?: string;
  clientId?: string;
  numeroFac?: string;
  resteAPayer?: number;
  isRemise?: boolean;
}

function ChildModal({ discountAmount, clientName, clientId, numeroFac, total, amountPaid, isRemise }: ChildModalProps) {
  const reset = useStoreCart(state => state.reset)
  const { updateSortie } = useUpdateSortie()
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const selectedIds = useStoreCart(state => state.selectedIds)
  const sortiess = useStoreCart(state => state.sorties);
  const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    const idsToUpdate = selectSorties.map(sor => sor.id);

    // Préparer les données pour la mise à jour
    const data = {
      ids: idsToUpdate,
      remise_montant: discountAmount,
      entreprise_uuid: entreprise_uuid,
      client_name: clientName,
      code: numeroFac,
      montant_remise: discountAmount,
      montant_paye: amountPaid,
      montant_total: total,
      client_id: clientId,
      is_remise: isRemise,
      // total: total // Le backend recalcule le total pour sécurité
    };

    updateSortie(data);
    reset();
    setOpen(false);
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{
          borderRadius: '12px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #059669, #047857)'
          }
        }}
      >
        Confirmer
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 300, borderRadius: '16px' }}>
          <Typography id="child-modal-title" variant="h6" component="h2" gutterBottom>
            Confirmer la remise
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Voulez-vous vraiment confirmer cette remise et générer la facture ?
          </Typography>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleClose} color="inherit">Non</Button>
            <Button onClick={handleConfirm} variant="contained" color="primary">Oui</Button>
          </div>
        </Box>
      </Modal>
    </Fragment>
  );
}

export default function Fact({ clientName, invoiceNumber, clientId, invoiceDate, numeroFac, post, discountedTotal, payerTotal }: RecupType | any) {
  // let url = BASE(post.image);

  const url = post.image ? BASE(post.image) : post.image;

  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);

  const selectedIds = useStoreCart(state => state.selectedIds)
  const reset = useStoreCart(state => state.reset)
  const sorties = useStoreCart(state => state.sorties);
  const selectSorties = sorties.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  // const totalPrix = selectSorties.reduce((sum, sor) => sum + sor.prix_total, 0);

  const totalPrix = selectSorties?.reduce((acc, sortie) => {
    // Convertir prix_total en nombre ou utiliser 0 si invalide
    const prixTotal = sortie.prix_total ? parseFloat(String(sortie.prix_total)) : 0;
    return acc + prixTotal;
  }, 0);

  const total = totalPrix || 0;

  // États pour les remises et paiements
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPay, setIsModalOpenPay] = useState(false);
  const [fixedDiscount, setFixedDiscount] = useState<number | string>(""); // Remise fixe
  const [payDiscount, setPayDiscount] = useState<number | string>(0); // Remise fixe
  const [percentageDiscount, setPercentageDiscount] = useState<number | string>(""); // Remise en %
  const [localDiscountedTotal, setLocalDiscountedTotal] = useState(total); // Total avec remise
  const [localPayerTotal, setLocalPayerTotal] = useState(total); // Total avec remise

  // Utiliser les valeurs locales si elles sont définies, sinon utiliser les props
  const finalDiscountedTotal = localDiscountedTotal !== total ? localDiscountedTotal : (discountedTotal || total);
  const finalPayerTotal = localPayerTotal !== total ? localPayerTotal : (payerTotal || total);

  // Variable calculée pour le reste à payer (Aligné avec TableFact)
  const resteAPayer = (total - ((total - finalDiscountedTotal) + (Number(payDiscount))));

  // Normaliser la saisie (remplace ',' par '.')
  const normalizeInput = (value: string) => value.replace(",", ".");

  // Calculer le nouveau total
  const calculateDiscountedTotal = () => {
    let newTotal = total;
    const fixed = parseFloat(normalizeInput(fixedDiscount as string)) || 0;
    const percentage = parseFloat(normalizeInput(percentageDiscount as string)) || 0;

    if (fixed) {
      newTotal -= fixed;
    }
    if (percentage) {
      newTotal -= (percentage / 100) * total;
    }
    setLocalDiscountedTotal(Math.max(0, newTotal)); // Empêche un total négatif
  };

  const calculatePayerTotal = () => {
    let newTotal = finalDiscountedTotal;
    const fixed = parseFloat(normalizeInput(payDiscount as string)) || 0;

    if (fixed) {
      newTotal -= fixed;
    }

    setLocalPayerTotal(Math.max(0, newTotal)); // Empêche un total négatif
  };

  // Ouvrir/fermer le modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleModalPay = () => setIsModalOpenPay(!isModalOpenPay);

  // Appliquer la remise
  const handleApplyDiscount = () => {
    calculateDiscountedTotal();
    toggleModal();
  };

  const handleApplyPayer = () => {
    calculatePayerTotal();
    toggleModalPay();

  };

  // Pour la remise des facture
  const [openF, setOpenF] = useState(false);
  const [isRemiseChecked, setIsRemiseChecked] = useState(false);
  const handleOpenRemise = () => {
    setOpenF(true);
  };

  const handleCloseRemise = () => {
    setOpenF(false);
  };

  const [isMobile, setIsMobile] = useState(false);
  const [fac, setNom] = useState<TypeText>({
    clientName: '',
    clientAddress: '',
    clientCoordonne: '',
    invoiceDate: '',
    dueDate: '',
    notes: '',
    numeroFac: '',
    invoiceNumber: undefined,
  });

  const onChan = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNom({
      ...fac,
      [name]: value,
    });
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setLocalDiscountedTotal(total);
    setLocalPayerTotal(total);
  }, [total]);

  useEffect(() => {
    if (clientName || invoiceNumber) {
      setNom(prev => ({
        ...prev,
        clientName: clientName || prev.clientName,
        invoiceNumber: invoiceNumber || prev.invoiceNumber
      }));
    }
  }, [clientName, invoiceNumber]);

  const [quantity] = useState<number>(0);
  const [price] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [printFormat, setPrintFormat] = useState<'A4' | 'A5' | 'A6' | 'A10' | 'Thermal'>('A4');

  // const componentRef = useRef();
  const componentRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ libelle: '', ref: '', date: '' });
  const { ajoutFacSortie } = useCreateFacSortie();
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Fonction utilitaire pour attendre le chargement de l'image
  const waitImageLoad = (imgUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new window.Image();
      img.src = imgUrl;
      img.onload = () => resolve();
      img.onerror = reject;
    });
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Générer le PDF et envoyer le formData
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingPdf(true);
    try {
      // Générer le PDF à partir du composant
      const element = componentRef.current;
      if (!element) throw new Error('Aperçu facture introuvable');

      // Options html2pdf
      const formatOptions = {
        'A4': { unit: 'in', format: 'a4', orientation: 'portrait' },
        'A5': { unit: 'in', format: 'a5', orientation: 'portrait' },
        'A6': { unit: 'in', format: 'a6', orientation: 'portrait' },
        'A10': { unit: 'in', format: 'a10', orientation: 'portrait' },
        'Thermal': { unit: 'mm', format: [80, 297], orientation: 'portrait' }
      };

      const opt = {
        margin: printFormat === 'Thermal' ? 0.1 : 0.2,
        filename: `facture-${form.ref || Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: formatOptions[printFormat],
      };

      // Attendre que l'image soit chargée si elle existe
      if (url) {
        await waitImageLoad(url);
      }

      // Détecter si on est sur iOS/Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

      let pdfBlob: Blob;

      if (isIOS || isSafari) {
        // Méthode alternative pour iOS/Safari
        try {
          // Essayer d'abord la méthode normale
          pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
        } catch (iosError) {
          // Méthode alternative : générer en base64 puis convertir
          const pdfBase64 = await html2pdf().from(element).set(opt).outputPdf('datauristring');
          const base64Data = pdfBase64.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        }
      } else {
        // Méthode normale pour les autres navigateurs
        pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
      }

      // Préparer le formData
      const user_id = connect;
      const entreprise_id = post.entreprise_id || post.uuid || '';
      const formData: any = {
        ...form,
        user_id,
        entreprise_id,
        facture: new File([pdfBlob], opt.filename, { type: 'application/pdf' })
      };

      await ajoutFacSortie(formData);
      setForm({ libelle: '', ref: '', date: '' });
      setOpenModal(false);
      toast.success('Facture ajoutée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      toast.error('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setLoadingPdf(false);
    }
  };

  // Calculate items amount function
  useEffect(() => {
    const calculateAmount = () => {
      setAmount(quantity * price);
    };

    calculateAmount();
  }, [amount, price, quantity, setAmount]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-full sm:max-w-[1200px] mx-auto px-2 sm:px-4">
        <Paper elevation={0} className="bg-white rounded-lg overflow-hidden">
          <div className="p-2 sm:p-6">
            {/* Redesigned Actions Bar */}
            <div className="flex flex-col space-y-4 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">

                {/* Cancel Group */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => reset()}
                    className="group inline-flex items-center justify-center px-4 py-2 text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all duration-300 shadow-sm"
                  >
                    <RemoveIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-semibold text-sm">Annuler</span>
                  </button>
                </div>

                {/* Financial Actions Group */}
                <div className="flex flex-wrap items-center gap-2">
                  {(unEntreprise.licence_type != "Stock Simple") &&

                    <button
                      onClick={handleOpenRemise}
                      className="inline-flex items-center justify-center px-4 py-2 bg-white text-purple-600 border border-purple-100 rounded-xl hover:bg-purple-50 transition-all duration-300 shadow-sm"
                    >
                      <span className="font-semibold text-sm">Remise Facture</span>
                    </button>
                  }

                  <button
                    onClick={toggleModal}
                    className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all duration-300 shadow-sm"
                  >
                    <LocalAtmIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold text-sm">Remise Art.</span>
                  </button>

                  <button
                    onClick={toggleModalPay}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <LocalAtmIcon className="w-5 h-5 mr-2" />
                    <span className="font-bold text-sm">Paiement</span>
                  </button>
                </div>

                {/* Print & Export Group */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-inner">
                  <div className="flex items-center gap-2">
                    <ReactToPrint
                      trigger={() => (
                        <button className="inline-flex items-center justify-center px-4 py-2 bg-white text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-sm">
                          <PrintIcon className="w-5 h-5 mr-2" />
                          <span className="font-semibold text-sm">Imprimer</span>
                        </button>
                      )}
                      content={() => componentRef.current}
                    />
                    {(unEntreprise.licence_type != "Stock Simple") &&
                      <button
                        onClick={() => setOpenModal(true)}
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <AddIcon className="w-5 h-5 mr-2" />
                        <span className="font-bold text-sm">Valider & PDF</span>
                      </button>
                    }
                  </div>
                </div>
              </div>
              {/* Format Selector inside Print Group */}
              <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-1">
                {(['A4', 'Thermal'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setPrintFormat(format)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${printFormat === format
                      ? 'bg-white text-blue-600 shadow-sm scale-105'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {format === 'Thermal' ? 'Ticket' : format}
                  </button>
                ))}
              </div>
            </div>
            <Grid
              container
              spacing={isMobile ? 2 : 3}
              className={isMobile ? 'mt-3' : ''}
              sx={{
                '& .MuiGrid-item': {
                  padding: isMobile ? '8px' : '12px'
                }
              }}
            >
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Numéro de Facture"
                  name="numeroFac"
                  variant="outlined"
                  onChange={onChan}
                  className={`${isMobile ? 'mobile-form-field' : 'bg-white'}`}
                  sx={isMobile ? {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:focus-within': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  } : {}}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom du Client"
                  name="clientName"
                  variant="outlined"
                  value={fac.clientName}
                  onChange={onChan}
                  className={`${isMobile ? 'mobile-form-field' : 'bg-white'}`}
                  sx={isMobile ? {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:focus-within': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  } : {}}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Numero du Client"
                  name="invoiceNumber"
                  variant="outlined"
                  value={fac.invoiceNumber || ''}
                  onChange={onChan}
                  className={`${isMobile ? 'mobile-form-field' : 'bg-white'}`}
                  sx={isMobile ? {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:focus-within': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  } : {}}
                />
              </Grid>

              <Grid item xs={12} md={12}>
                <Typography variant={isMobile ? "h6" : "h6"} className="text-gray-900">
                  Notes additionnelles
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 4}
                  name="notes"
                  placeholder="Ajouter des notes ou commentaires pour cette facture..."
                  variant="outlined"
                  onChange={onChan}
                  className={`${isMobile ? 'mobile-form-field' : 'bg-white'}`}
                  sx={isMobile ? {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:focus-within': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  } : {}}
                />
              </Grid>

            </Grid>

            {/* <div className={`${isMobile ? 'mobile-notes-section' : 'mt-6'}`}> */}

            {/* Invoice Content */}
            <div
              ref={componentRef}
              className={`bg-white p-2 sm:p-8 rounded-lg shadow-sm border border-gray-100 print-container format-${printFormat.toLowerCase()}`}
            >
              <Header
                // orderNumber={orderNumber}
                nom={post.nom}
                numeroFac={numeroFac || fac.numeroFac}
                url={url}
                email={post.email}
                address={post.adresse}
                numero={post.numero}
                coordonne={post.coordonne}
                clientName={clientName || fac.clientName}
                invoiceDate={invoiceDate}
                invoiceNumber={invoiceNumber || fac.invoiceNumber}
                printFormat={printFormat}
              />

              <div className="overflow-x-auto w-full">
                <TableFact
                  list={selectSorties}
                  total={totalPrix}
                  discountedTotal={finalDiscountedTotal}
                  payerTotal={finalPayerTotal}
                  payDiscount={payDiscount}
                  printFormat={printFormat}
                />
              </div>

              <Notes
                notes={fac.notes}
              />

            </div>

            {/* Modal d'ajout de facture de sortie */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
              <DialogTitle className="flex justify-between items-center">
                <span>Ajouter une facture de sortie</span>
                <IconButton onClick={() => setOpenModal(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <Stack spacing={2}>
                    <TextField
                      label="Libellé"
                      name="libelle"
                      value={form.libelle}
                      onChange={handleFormChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Référence"
                      name="ref"
                      value={form.ref}
                      onChange={handleFormChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleFormChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Stack>
                  <DialogActions className="mt-4">
                    <Button onClick={() => setOpenModal(false)} color="secondary" disabled={loadingPdf}>
                      Annuler
                    </Button>

                    <Button type="submit" variant="contained" color="primary" disabled={loadingPdf}>
                      {loadingPdf ? 'Génération...' : 'Ajouter'}
                    </Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>

            {/* Modal Appliquer Remise */}
            <Modal open={isModalOpen} onClose={toggleModal}>
              <Box
                sx={isMobile ? {
                  ...style,
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'bounceIn 0.6s ease-out'
                } : style}
                className={isMobile ? 'mobile-modal' : ''}
              >
                <Typography variant="h6" className="mb-4">
                  Appliquer une remise
                </Typography>
                <div className="space-y-4">
                  <TextField
                    fullWidth
                    label="Montant fixe"
                    variant="outlined"
                    value={fixedDiscount}
                    onChange={(e) => setFixedDiscount(normalizeInput(e.target.value))}
                    helperText="Ex: 1500 ou 85.45"
                    className={isMobile ? 'mobile-form-field' : ''}
                    sx={isMobile ? {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:focus-within': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }
                    } : {}}
                  />
                  <TextField
                    fullWidth
                    label="Pourcentage"
                    variant="outlined"
                    value={percentageDiscount}
                    onChange={(e) => setPercentageDiscount(normalizeInput(e.target.value))}
                    helperText="Ex: 2% ou 5%"
                    className={isMobile ? 'mobile-form-field' : ''}
                    sx={isMobile ? {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:focus-within': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }
                    } : {}}
                  />
                  <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-3 pt-4'}`}>
                    <Button
                      variant="outlined"
                      onClick={toggleModal}
                      className={isMobile ? 'mobile-button' : ''}
                      sx={isMobile ? {
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                        }
                      } : {}}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleApplyDiscount}
                      className={`${isMobile ? 'mobile-button mobile-button-primary' : ''}`}
                      sx={isMobile ? {
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                          background: 'linear-gradient(135deg, #1d4ed8, #1e40af)'
                        }
                      } : {}}
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>
              </Box>
            </Modal>

            {/* Modal Paiement */}
            <Modal open={isModalOpenPay} onClose={toggleModalPay}>
              <Box
                sx={isMobile ? {
                  ...style,
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'bounceIn 0.6s ease-out'
                } : style}
                className={isMobile ? 'mobile-modal' : ''}
              >
                <Typography variant="h6" className="mb-4">
                  Enregistrer le paiement
                </Typography>
                <TextField
                  fullWidth
                  label="Montant payé"
                  variant="outlined"
                  value={payDiscount}
                  onChange={(e) => setPayDiscount(normalizeInput(e.target.value))}
                  helperText="Ex: 1500 ou 85.45"
                  className={`${isMobile ? 'mobile-form-field mb-4' : 'mb-4'}`}
                  sx={isMobile ? {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:focus-within': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  } : {}}
                />
                <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-3'}`}>
                  <Button
                    variant="outlined"
                    onClick={toggleModalPay}
                    className={isMobile ? 'mobile-button' : ''}
                    sx={isMobile ? {
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                      }
                    } : {}}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyPayer}
                    className={`${isMobile ? 'mobile-button mobile-button-success' : ''}`}
                    sx={isMobile ? {
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                        background: 'linear-gradient(135deg, #059669, #047857)'
                      }
                    } : {}}
                  >
                    Confirmer
                  </Button>
                </div>
              </Box>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
              open={openF}
              onClose={handleCloseRemise}
              aria-labelledby="confirmation-modal-title"
              aria-describedby="confirmation-modal-description"
            >
              <Box sx={{
                ...style,
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                ...(isMobile && {
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'bounceIn 0.6s ease-out'
                })
              }}
                className={isMobile ? 'mobile-confirmation-section' : ''}
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className={`${isMobile ? 'mobile-modal-header' : 'border-b pb-4'}`}>
                    <Typography
                      id="confirmation-modal-title"
                      variant="h5"
                      component="h2"
                      className="font-semibold text-gray-900"
                    >
                      Confirmation de Remise
                    </Typography>
                    <Typography
                      id="confirmation-modal-description"
                      variant="subtitle1"
                      className="text-gray-600 mt-1"
                    >
                      Veuillez vérifier les détails de la remise avant de confirmer
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isRemiseChecked}
                          onChange={(e) => setIsRemiseChecked(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Appliquer une remise sur ces produits ?"
                      sx={{ mt: 1 }}
                    />
                  </div>

                  {/* Table Container */}
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    className={isMobile ? 'mobile-table-container' : ''}
                    sx={{
                      backgroundColor: 'transparent',
                      '& .MuiTable-root': {
                        borderCollapse: 'separate',
                        borderSpacing: '0 4px',
                      },
                      ...(isMobile && {
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      })
                    }}
                  >
                    <Table
                      sx={{
                        minWidth: '100%',
                        '& .MuiTableCell-root': {
                          borderBottom: 'none',
                          padding: '16px',
                        },
                        '& .MuiTableRow-root': {
                          backgroundColor: '#fff',
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                          },
                        },
                        '& .MuiTableHead-root .MuiTableRow-root': {
                          backgroundColor: '#f1f5f9',
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow className={isMobile ? 'mobile-table-header' : ''}>
                          <TableCell className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Désignation</TableCell>
                          <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Quantité</TableCell>
                          <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Prix unitaire</TableCell>
                          <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectSorties.map((post, index) => (
                          <TableRow key={index}>
                            <TableCell className={`${isMobile ? 'mobile-table-cell' : ''} text-gray-900`}>
                              <div className="flex flex-col">
                                {/* <span className="font-medium">{post.ref}</span> */}
                                <span className="text-gray-500 text-sm">{post.categorie_libelle}</span>
                              </div>
                            </TableCell>
                            <TableCell align="right" className={isMobile ? 'mobile-table-cell' : ''}>{post.qte}</TableCell>
                            <TableCell align="right" className={isMobile ? 'mobile-table-cell' : ''}>{formatNumberWithSpaces(post.pu)} F</TableCell>
                            <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-medium`}>
                              {formatNumberWithSpaces(post.prix_total)} F
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Summary Rows */}
                        <TableRow className={isMobile ? 'mobile-total-row' : ''} sx={{ backgroundColor: '#f8fafc !important' }}>
                          <TableCell rowSpan={4} />
                          <TableCell
                            colSpan={2}
                            align="right"
                            sx={{ color: '#64748b', fontWeight: 600 }}
                          >
                            Sous-total
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: '#0f172a', fontWeight: 600 }}
                          >
                            {formatNumberWithSpaces(total)} F
                          </TableCell>
                        </TableRow>

                        <TableRow className={isMobile ? 'mobile-total-row' : ''} sx={{ backgroundColor: '#f8fafc !important' }}>
                          <TableCell
                            colSpan={2}
                            align="right"
                            sx={{ color: '#64748b', fontWeight: 600 }}
                          >
                            Remise
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: '#dc2626', fontWeight: 600 }}
                          >
                            - {formatNumberWithSpaces(total - finalDiscountedTotal)} F
                          </TableCell>
                        </TableRow>

                        {(total - payerTotal) > 0 && (
                          <TableRow className={isMobile ? 'mobile-total-row' : ''} sx={{ backgroundColor: '#f8fafc !important' }}>
                            <TableCell
                              colSpan={2}
                              align="right"
                              sx={{ color: '#64748b', fontWeight: 600 }}
                            >
                              Montant Payé
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: '#059669', fontWeight: 600 }}
                            >
                              {formatNumberWithSpaces(payDiscount)} F
                            </TableCell>
                          </TableRow>
                        )}

                        <TableRow className={isMobile ? 'mobile-total-row' : ''} sx={{ backgroundColor: '#f8fafc !important' }}>
                          <TableCell
                            colSpan={2}
                            align="right"
                            sx={{ color: '#64748b', fontWeight: 600 }}
                          >
                            {resteAPayer > 0 && "Reste à payer"}
                            {resteAPayer === 0 && "Total"}
                            {resteAPayer < 0 && "Total"}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: '#0f172a', fontWeight: 600, fontSize: '1.1em' }}
                          >
                            {resteAPayer > 0 && formatNumberWithSpaces(resteAPayer)}
                            {resteAPayer === 0 && formatNumberWithSpaces(payDiscount)}
                            {resteAPayer < 0 && formatNumberWithSpaces(finalDiscountedTotal)} F
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Actions */}
                  <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-3'} pt-4 border-t`}>
                    <Button
                      variant="outlined"
                      onClick={handleCloseRemise}
                      className={`${isMobile ? 'mobile-button' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                      sx={isMobile ? {
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                        }
                      } : {}}
                    >
                      Annuler
                    </Button>
                    <ChildModal
                      discountAmount={total - finalDiscountedTotal}
                      clientName={fac.clientName}
                      numeroFac={fac.numeroFac}
                      resteAPayer={resteAPayer}
                      clientId={clientId} // Assurez-vous que post contient client_id si disponible
                      total={finalDiscountedTotal}
                      amountPaid={Number(payDiscount) || 0}
                      isRemise={isRemiseChecked}
                    />
                  </div>
                </div>
              </Box>
            </Modal>
          </div>
        </Paper>
      </div>
    </div>
  )
}