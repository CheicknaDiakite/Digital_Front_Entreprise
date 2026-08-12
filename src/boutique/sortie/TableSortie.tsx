import { ToastContainer } from 'react-toastify'
import { Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, InputAdornment, Button } from '@mui/material'
import CardTableSortie from './CardTableSortie';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { Money } from '../../_components/icons/Money';
import MyTextField from '../../_components/Input/MyTextField';
import { ABType } from '../../typescript/Account';
import { useAllClients, useFetchEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../usePerso/fonctionPerso';
import Select from 'react-select';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { ChangeEvent, useEffect, useState } from 'react';
import CloseIcon from "@mui/icons-material/Close"
import BarcodeScanner from '../../_components/Input/BarcodeScanner';
import M_Abonnement from '../../_components/Card/M_Abonnement';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';

// Styles partagés
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#6366f1',
      boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
    },
  },
};

const sectionLabel = (text: string) => (
  <div style={{
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#94a3b8',
    marginBottom: '8px',
  }}>
    {text}
  </div>
);

export default function TableSortie({
  ent,
  onSubmit,
  amount,
  list,
  onChange,
  formValues,
  selectedOption,
  handleChange,
  handleClient,
  selectedClient,
  scannedCode,
  functionopen,
  open,
  closeopen,
  handleScanResult,
  basket,
  handleFinalSubmit,
  removeItemFromBasket,
  basketTotalAmount,
  basketTotalQte
}: any) {
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);
  const { getClients } = useAllClients(entreprise_uuid!);
  const clients = getClients.filter((info) => info.role === 1 || info.role === 3);

  const sortedLi = list?.sort((a: ABType, b: ABType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return b.id - a.id;
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const sortedList = sortedLi.filter((post: any) =>
    post?.ref?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnt = scannedCode
    ? ent.filter((option: any) => option.ref === scannedCode)
    : ent;

  useEffect(() => {
    if (filteredEnt && filteredEnt.length === 1) {
      if (handleChange && typeof handleChange === 'function') {
        handleChange(filteredEnt[0]);
      }
    }
  }, [filteredEnt, handleChange]);

  // Styles react-select personnalisés
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '10px',
      border: state.isFocused ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
      minHeight: '42px',
      transition: 'all 0.2s',
      '&:hover': { borderColor: '#6366f1' },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#eff6ff' : '#fff',
      color: '#1e293b',
      fontWeight: state.isSelected ? 600 : 400,
      fontSize: '0.85rem',
    }),
    singleValue: (base: any) => ({ ...base, color: '#1e293b', fontWeight: 500 }),
    placeholder: (base: any) => ({ ...base, color: '#94a3b8', fontSize: '0.85rem' }),
  };

  return (
    <>
      <ToastContainer position="top-right" theme="colored" />

      {/* ── Recherche ── */}
      <TextField
        label="Rechercher par référence"
        variant="outlined"
        className="mt-3"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ ...inputSx, mt: 2, mb: 0.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* ── Formulaire ── */}
      <form onSubmit={onSubmit}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          marginTop: '16px',
          borderRadius: '14px',
          border: '1px solid rgba(99,102,241,0.15)',
          background: 'rgba(99,102,241,0.03)',
        }}>

          {/* Scanner QR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={functionopen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            >
              <QrCode2Icon style={{ fontSize: 18 }} />
              Scanner code-barres
            </button>
          </div>

          <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Scanner un code-barres</span>
              <IconButton onClick={closeopen} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <BarcodeScanner onScan={handleScanResult} />
            </DialogContent>
          </Dialog>

          {/* Client */}
          <div>
            {sectionLabel('Client')}
            <Select
              options={clients}
              value={selectedClient}
              onChange={handleClient}
              styles={selectStyles}
              placeholder="Sélectionner un client..."
              isClearable
              getOptionLabel={(option: any) =>
                typeof option === 'string' ? option : option.nom || ''
              }
              getOptionValue={(option: any) => option.uuid.toString()}
            />
          </div>

          {/* Désignation */}
          <div>
            {sectionLabel(`Désignation${scannedCode ? ` — Code : ${scannedCode}` : ''}`)}
            <Select
              required
              styles={selectStyles}
              options={filteredEnt}
              value={selectedOption}
              onChange={handleChange}
              placeholder="Sélectionner un article..."
              isClearable
              getOptionLabel={(option: any) =>
                `${option.categorie_libelle} ${option.libelle ? `(${option.libelle})` : ''} (${option.qte})`
              }
              getOptionValue={(option: any) => option.uuid.toString()}
            />
            {scannedCode && filteredEnt && filteredEnt.length === 0 && (
              <div style={{
                marginTop: 8,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                fontSize: '0.78rem',
                fontWeight: 500,
              }}>
                Aucun article trouvé pour ce code.
              </div>
            )}
          </div>

          {/* Quantité + PU + Somme */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {/* Quantité */}
            <div>
              {sectionLabel(`Quantité${formValues.unite && formValues.unite !== 'kilos' ? ` (${formValues.unite})` : ''}`)}
              <MyTextField
                required
                type="number"
                name="qte"
                inputProps={{ step: '0.01', min: '0' }}
                value={formValues.qte}
                id="quantity"
                placeholder="0"
                onChange={onChange}
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QuantityLimitsIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Prix Unitaire */}
            <div>
              {sectionLabel('Prix Unitaire')}
              <MyTextField
                disabled={formValues.is_prix}
                variant="outlined"
                type="number"
                inputProps={{ step: '0.01', min: '0', max: '9999999999.99' }}
                name="pu"
                onChange={onChange}
                value={formValues.pu}
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalAtmIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Somme calculée */}
            <div>
              {sectionLabel('Montant')}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: '42px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                background: 'rgba(99,102,241,0.04)',
              }}>
                <Money size={18} color="#6366f1" />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                  {formatNumberWithSpaces(amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Bouton Ajouter */}
          {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
            <M_Abonnement />
          ) : (
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                transition: 'all 0.2s ease',
                alignSelf: 'flex-start',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)';
              }}
            >
              <AddShoppingCartIcon style={{ fontSize: 20 }} />
              Ajouter au panier
            </button>
          )}
        </div>
      </form>

      {/* ── Panier ── */}
      {basket && basket.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            mb: 3,
            borderRadius: '16px',
            border: '1px solid rgba(99,102,241,0.2)',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Header panier */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                Articles sélectionnés
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
                height: 24,
                borderRadius: '999px',
                background: '#6366f1',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0 8px',
              }}>
                {basket.length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total :</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#a5b4fc', fontVariantNumeric: 'tabular-nums' }}>
                {formatNumberWithSpaces(basketTotalAmount)} F
              </span>
            </div>
          </div>

          {/* Vue Mobile */}
          <div className="md:hidden" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {basket.map((item: any, index: number) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '12px 14px',
                borderLeft: '3px solid #6366f1',
                position: 'relative',
              }}>
                <div style={{ fontWeight: 700, color: '#a5b4fc', paddingRight: 32, fontSize: '0.85rem' }}>
                  {item.categorie_libelle} {item.libelle ? `(${item.libelle})` : ''}
                </div>
                <IconButton
                  onClick={() => removeItemFromBasket(index)}
                  size="small"
                  sx={{ position: 'absolute', top: 6, right: 6, color: '#f87171' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: 8, fontSize: '0.78rem' }}>
                  <span style={{ color: '#64748b' }}>Prix :</span>
                  <span style={{ textAlign: 'right', color: '#e2e8f0' }}>{formatNumberWithSpaces(Number(item.pu || 0))}</span>
                  <span style={{ color: '#64748b' }}>Qté :</span>
                  <span style={{ textAlign: 'right', color: '#e2e8f0' }}>{item.qte} {item.unite === 'kilos' ? '' : item.unite}</span>
                  <span style={{ color: '#94a3b8', fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 4 }}>Total :</span>
                  <span style={{ textAlign: 'right', color: '#a5b4fc', fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 4 }}>
                    {formatNumberWithSpaces(Number(item.pu || 0) * Number(item.qte || 0))}
                  </span>
                </div>
              </div>
            ))}
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: '#a5b4fc',
              fontWeight: 700,
            }}>
              <span>Qté totale :</span>
              <span>{basketTotalQte}</span>
            </div>
          </div>

          {/* Vue Desktop */}
          <div className="hidden md:block" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Désignation', 'Prix', 'Qté', 'Total', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: h === 'Action' ? 'center' : 'left',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#64748b',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {basket.map((item: any, index: number) => (
                  <tr key={index} 
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500, fontSize: '0.85rem' }}>
                      {item.categorie_libelle} {item.libelle ? `(${item.libelle})` : ''}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
                      {formatNumberWithSpaces(Number(item.pu || 0))}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {item.qte} {item.unite === 'kilos' ? '' : item.unite}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#a5b4fc', fontWeight: 700, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                      {formatNumberWithSpaces(Number(item.pu || 0) * Number(item.qte || 0))}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <IconButton
                        onClick={() => removeItemFromBasket(index)}
                        size="small"
                        sx={{
                          color: '#f87171',
                          border: '1px solid rgba(248,113,113,0.2)',
                          borderRadius: '8px',
                          '&:hover': { background: 'rgba(239,68,68,0.1)' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.08)' }}>
                  <td colSpan={2} style={{ padding: '14px 16px', textAlign: 'right', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Totaux :
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: 700 }}>{basketTotalQte}</td>
                  <td style={{ padding: '14px 16px', color: '#a5b4fc', fontWeight: 800, fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>
                    {formatNumberWithSpaces(basketTotalAmount)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bouton Enregistrer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SaveIcon />}
              onClick={handleFinalSubmit}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                py: 1.5,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  boxShadow: '0 6px 20px rgba(16,185,129,0.45)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Enregistrer l'achat
            </Button>
          </div>
        </Paper>
      )}

      {/* ── Table historique ── */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 560,
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <Table aria-label="sticky table" stickyHeader>
          <TableHead>
            <TableRow>
              {['Image', 'Date', 'Réf.', 'Client', 'Désignation', 'Quantité', 'P.U', 'Montant'].map(col => (
                <TableCell
                  key={col}
                  sx={{
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    py: 1.5,
                  }}
                >
                  {col}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedList.map((row: any) => (
              <CardTableSortie key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}