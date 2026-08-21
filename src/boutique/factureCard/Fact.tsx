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
// import { connect } from '../../_services/account.service';
import { useFetchUser } from '../../usePerso/fonction.user';
import { RecupType } from '../../typescript/DataType';
import { Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, IconButton, Box, Modal, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, FormControlLabel } from '@mui/material';
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

export default function Fact({ clientName, invoiceNumber, clientId, invoiceDate, numeroFac, post, discountedTotal, payerTotal, modePaiement }: RecupType | any) {
  // let url = BASE(post.image);

  const url = post.image ? BASE(post.image) : post.image;

  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);
  const { unUser } = useFetchUser();

  const selectedIds = useStoreCart(state => state.selectedIds)
  const reset = useStoreCart(state => state.reset)
  const sorties = useStoreCart(state => state.sorties);
  const selectSorties = sorties.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  // const totalPrix = selectSorties.reduce((sum, sor) => sum + sor.prix_total, 0);

  const effectivePaymentMode = modePaiement || selectSorties?.[0]?.mode_paiement || 'Caisse';

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
    clientName: clientName || '',
    clientAddress: '',
    clientCoordonne: '',
    invoiceDate: invoiceDate || '',
    dueDate: '',
    notes: '',
    numeroFac: numeroFac || '',
    invoiceNumber: invoiceNumber || undefined,
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
    setNom(prev => ({
      ...prev,
      clientName: clientName !== undefined && clientName !== '' ? clientName : prev.clientName,
      invoiceNumber: invoiceNumber !== undefined && invoiceNumber !== 0 ? invoiceNumber : prev.invoiceNumber,
      numeroFac: numeroFac || prev.numeroFac,
    }));
  }, [clientName, invoiceNumber, numeroFac]);

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
    return new Promise<void>((resolve) => {
      if (!imgUrl) return resolve();
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = imgUrl;
      img.onload = () => resolve();
      img.onerror = () => resolve();
      setTimeout(resolve, 2000);
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
        margin: printFormat === 'Thermal' ? [1, 1, 1, 1] : 0.2,
        filename: `facture-${form.ref || Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          letterRendering: true,
        },
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
      const user_id = unUser?.uuid || '';
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
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-full sm:max-w-[1200px] mx-auto px-2 sm:px-4">
        <Paper elevation={0} className="rounded-lg overflow-hidden">
          <div className="p-2 sm:p-6">

            {/* ── Barre d'actions glassmorphique ── */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '14px 20px',
              borderRadius: '16px',
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              marginBottom: '16px',
            }}>

              {/* Annuler */}
              <button
                onClick={() => reset()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              >
                <RemoveIcon style={{ fontSize: 16 }} />
                Annuler
              </button>

              {/* Groupe financier */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {(unEntreprise.licence_type !== 'Stock Simple') && (
                  <button
                    onClick={handleOpenRemise}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: '10px',
                      background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)',
                      color: '#c084fc', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.18)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.1)')}
                  >
                    Remise Facture
                  </button>
                )}

                <button
                  onClick={toggleModal}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: '10px',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                    color: '#a5b4fc', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                >
                  <LocalAtmIcon style={{ fontSize: 16 }} />
                  Remise Art.
                </button>

                <button
                  onClick={toggleModalPay}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 20px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(16,185,129,0.45)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.35)';
                  }}
                >
                  <LocalAtmIcon style={{ fontSize: 16 }} />
                  Paiement
                </button>
              </div>

              {/* Impression & Export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <ReactToPrint
                  trigger={() => (
                    <button style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: '10px',
                      background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                      color: '#38bdf8', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      <PrintIcon style={{ fontSize: 16 }} />
                      Imprimer
                    </button>
                  )}
                  content={() => componentRef.current}
                />

                {(unEntreprise.licence_type !== 'Stock Simple') && (
                  <button
                    onClick={() => setOpenModal(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 20px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(99,102,241,0.45)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.35)';
                    }}
                  >
                    <AddIcon style={{ fontSize: 16 }} />
                    Valider & PDF
                  </button>
                )}

                {/* Sélecteur format */}
                <div style={{
                  display: 'flex',
                  gap: 4,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '3px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {(['A4', 'Thermal'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setPrintFormat(fmt)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: printFormat === fmt
                          ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                          : 'transparent',
                        color: printFormat === fmt ? '#fff' : '#64748b',
                        boxShadow: printFormat === fmt ? '0 2px 8px rgba(99,102,241,0.4)' : 'none',
                        transform: printFormat === fmt ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {fmt === 'Thermal' ? 'Ticket' : fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Formulaire infos client ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16,
              padding: '20px',
              borderRadius: '14px',
              background: 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.12)',
              marginBottom: '16px',
              borderLeft: '4px solid #6366f1',
            }}>
              <TextField
                fullWidth
                label="Numéro de Facture"
                name="numeroFac"
                value={fac.numeroFac}
                variant="outlined"
                onChange={onChan}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Nom du Client"
                name="clientName"
                variant="outlined"
                value={fac.clientName}
                onChange={onChan}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Numéro du Client"
                name="invoiceNumber"
                variant="outlined"
                value={fac.invoiceNumber || ''}
                onChange={onChan}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                    },
                  },
                }}
              />

              <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8, color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* <div className={`${isMobile ? 'mobile-notes-section' : 'mt-6'}`}> */}

            {/* Invoice Content */}
            <div
              ref={componentRef}
              style={{
                width: printFormat === 'Thermal' ? '78mm' : '100%',
                maxWidth: printFormat === 'Thermal' ? '78mm' : '100%',
                margin: printFormat === 'Thermal' ? '0 auto' : undefined,
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
              className={`${printFormat === 'Thermal' ? 'p-1 sm:p-2' : 'p-2 sm:p-8'} rounded-lg shadow-sm border border-gray-100 print-container format-${printFormat.toLowerCase()}`}
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
                modePaiement={effectivePaymentMode}
                printFormat={printFormat}
              />

              <div className={printFormat === 'Thermal' ? 'w-full' : 'overflow-x-auto w-full'}>
                <TableFact
                  list={selectSorties}
                  total={totalPrix}
                  discountedTotal={finalDiscountedTotal}
                  payerTotal={finalPayerTotal}
                  payDiscount={payDiscount}
                  modePaiement={effectivePaymentMode}
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
                    <Button onClick={() => setOpenModal(false)} disabled={loadingPdf}>
                      Annuler
                    </Button>

                    <Button type="submit" variant="contained" disabled={loadingPdf}>
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
                  // background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'bounceIn 0.6s ease-out'
                } : style}
                // className={isMobile ? 'mobile-modal' : ''}
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
                    
                  />
                  <TextField
                    fullWidth
                    label="Pourcentage"
                    variant="outlined"
                    value={percentageDiscount}
                    onChange={(e) => setPercentageDiscount(normalizeInput(e.target.value))}
                    helperText="Ex: 2% ou 5%"
                    
                  />
                  <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-3 pt-4'}`}>
                    <Button
                      variant="outlined"
                      onClick={toggleModal}
                      
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleApplyDiscount}
                      
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
                  // background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'bounceIn 0.6s ease-out'
                } : style}
                // className={isMobile ? 'mobile-modal' : ''}
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
                  className={`mb-4`}
                  
                />
                <div className={`flex justify-end space-x-3`}>
                  <Button
                    variant="outlined"
                    onClick={toggleModalPay}
                    
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyPayer}
                    
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
                  // background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'bounceIn 0.6s ease-out'
                })
              }}
                // className={isMobile ? 'mobile-confirmation-section' : ''}
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className={`border-b pb-4`}>
                    <Typography
                      id="confirmation-modal-title"
                      variant="h5"
                      component="h2"
                      className="font-semibold"
                    >
                      Confirmation de Remise
                    </Typography>
                    <Typography
                      id="confirmation-modal-description"
                      variant="subtitle1"
                      className="mt-1"
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
                    // className={isMobile ? 'mobile-table-container' : ''}
                    sx={{
                      backgroundColor: 'transparent',
                      '& .MuiTable-root': {
                        borderCollapse: 'separate',
                        borderSpacing: '0 4px',
                      },
                      ...(isMobile && {
                        borderRadius: '16px',
                        overflow: 'hidden',
                        // background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      })
                    }}
                  >
                    <Table
                      
                    >
                      <TableHead>
                        <TableRow >
                          <TableCell className={` font-semibold`}>Désignation</TableCell>
                          <TableCell align="right" className={`font-semibold`}>Quantité</TableCell>
                          <TableCell align="right" className={`font-semibold`}>Prix unitaire</TableCell>
                          <TableCell align="right" className={`font-semibold`}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectSorties.map((post, index) => (
                          <TableRow key={index}>
                            <TableCell >
                              <div className="flex flex-col">
                                {/* <span className="font-medium">{post.ref}</span> */}
                                <span className="text-sm">{post.categorie_libelle}</span>
                              </div>
                            </TableCell>
                            <TableCell align="right" >{post.qte}</TableCell>
                            <TableCell align="right" >{formatNumberWithSpaces(post.pu)} F</TableCell>
                            <TableCell align="right" className={`font-medium`}>
                              {formatNumberWithSpaces(post.prix_total)} F
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Summary Rows */}
                        <TableRow >
                          <TableCell rowSpan={4} />
                          <TableCell
                            colSpan={2}
                            align="right"
                            sx={{ fontWeight: 600 }}
                          >
                            Sous-total
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600 }}
                          >
                            {formatNumberWithSpaces(total)} F
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            colSpan={2}
                            align="right"
                            sx={{ fontWeight: 600 }}
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
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              align="right"
                              sx={{ fontWeight: 600 }}
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

                        <TableRow>
                          <TableCell
                            colSpan={2}
                            align="right"
                            sx={{ fontWeight: 600 }}
                          >
                            {resteAPayer > 0 && "Reste à payer"}
                            {resteAPayer === 0 && "Total"}
                            {resteAPayer < 0 && "Total"}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, fontSize: '1.1em' }}
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
                  <div className={`flex justify-end space-x-3 pt-4 border-t`}>
                    <Button
                      variant="outlined"
                      onClick={handleCloseRemise}
                      className={`border-gray-300 hover:bg-gray-50`}

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