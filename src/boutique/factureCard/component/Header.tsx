import { Divider } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function Header({
  orderNumber,
  nom,
  numeroFac,
  url,
  address,
  numero,
  coordonne,
  clientName,
  invoiceDate,
  invoiceNumber,
  email,
  modePaiement,
  printFormat = 'A4'
}: any) {
  const isThermal = printFormat === 'Thermal';

  return (
    <div style={{ marginBottom: '2rem' }} className={isThermal ? 'text-sm' : ''}>

      {/* ── Bandeau entreprise ── */}
      <div style={{
        display: 'flex',
        flexDirection: isThermal ? 'column' : 'row',
        alignItems: isThermal ? 'center' : 'center',
        justifyContent: isThermal ? 'center' : 'space-between',
        background: 'linear-gradient(135deg, #4338ca 0%, #1d4ed8 60%, #0369a1 100%)',
        borderRadius: isThermal ? '0' : '12px 12px 0 0',
        padding: isThermal ? '16px 12px' : '24px 32px',
        marginBottom: isThermal ? '12px' : '0',
        gap: isThermal ? 8 : 0,
      }}>
        {/* Logo + Nom */}
        <div style={{
          display: 'flex',
          flexDirection: isThermal ? 'column' : 'row',
          alignItems: 'center',
          gap: isThermal ? 8 : 16,
          textAlign: isThermal ? 'center' : 'left',
        }}>
          {url && (
            <img
              src={url}
              alt={nom}
              style={{
                width: isThermal ? 48 : 72,
                height: isThermal ? 48 : 72,
                objectFit: 'contain',
                borderRadius: '10px',
                border: '2px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
          )}
          <div>
            <div style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: isThermal ? '1.1rem' : '1.6rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {nom}
            </div>
            {coordonne && !isThermal && (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: 4 }}>
                {coordonne}
              </div>
            )}
          </div>
        </div>

        {/* Contacts */}
        {!isThermal && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                <LocationOnIcon style={{ fontSize: 14, opacity: 0.8 }} />
                <span>{address}</span>
              </div>
            )}
            {email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                <EmailIcon style={{ fontSize: 14, opacity: 0.8 }} />
                <span>{email}</span>
              </div>
            )}
            {numero && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}>
                <PhoneIcon style={{ fontSize: 14, opacity: 0.8 }} />
                <span>{numero}</span>
              </div>
            )}
          </div>
        )}

        {/* Thermal contacts */}
        {isThermal && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem' }}>
            {email && <span>{email}</span>}
            {numero && <span>{numero}</span>}
            {coordonne && <span>{coordonne}</span>}
          </div>
        )}
      </div>

      {/* ── Meta facture (N° + Date + Client) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isThermal ? '1fr' : '1fr 1fr',
        gap: isThermal ? 0 : '1px',
        background: '#e2e8f0',
        border: '1px solid #e2e8f0',
        borderTop: 'none',
        borderRadius: isThermal ? '0' : '0 0 12px 12px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        {/* Infos Facture */}
        <div style={{
          background: '#f8fafc',
          padding: isThermal ? '12px' : '20px 28px',
          textAlign: isThermal ? 'center' : 'left',
        }}>
          {(orderNumber || numeroFac) && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                N° Facture
              </span>
              <div style={{ fontSize: isThermal ? '0.88rem' : '1.2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>
                {orderNumber || numeroFac}
              </div>
            </div>
          )}
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Date
            </span>
            <div style={{ fontSize: isThermal ? '0.82rem' : '1rem', fontWeight: 600, color: '#334155' }}>
              {invoiceDate}
            </div>
          </div>
          {modePaiement && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Règlement
              </span>
              <div style={{ fontSize: isThermal ? '0.78rem' : '0.9rem', fontWeight: 700, color: '#4f46e5' }}>
                {modePaiement}
              </div>
            </div>
          )}
        </div>

        {/* Infos Client */}
        <div style={{
          background: '#ffffff',
          padding: isThermal ? '12px' : '20px 28px',
          textAlign: isThermal ? 'center' : 'left',
          borderLeft: isThermal ? 'none' : 'none',
          borderTop: isThermal ? '1px solid #e2e8f0' : 'none',
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Client
          </span>
          <div style={{ fontSize: isThermal ? '0.88rem' : '1.1rem', fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
            {clientName || '—'}
          </div>
          {invoiceNumber && (
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
              {invoiceNumber}
            </div>
          )}
        </div>
      </div>

      {/* ── Titre FACTURE ── */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Divider sx={{ mb: 2 }} />
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 28px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          <ReceiptLongIcon style={{ fontSize: 18, color: '#94a3b8' }} />
          <span style={{
            fontWeight: 800,
            fontSize: isThermal ? '0.9rem' : '1rem',
            color: '#ffffff',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            FACTURE
          </span>
        </div>
      </div>
    </div>
  );
}
