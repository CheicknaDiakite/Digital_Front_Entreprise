import { Typography, Divider } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

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
  printFormat = 'A4'
}: any) {
  const isThermal = printFormat === 'Thermal';

  return (
    <div className={`mb-8 ${isThermal ? 'text-sm' : ''}`}>
      {/* Company Header */}
      <div className={`flex ${isThermal ? 'flex-col items-center text-center' : 'items-center justify-between'} bg-blue-400 mb-8 m-3 p-2`}>
        <div className={`flex ${isThermal ? 'flex-col items-center space-y-2' : 'items-center space-x-4'} m-3`}>
          {url && <img src={url} className={`${isThermal ? 'h-12 w-12' : 'h-20 w-20'} object-contain`} />}
          <div>
            <Typography variant={isThermal ? "h5" : "h4"} className="font-bold text-white">
              {nom}
            </Typography>
          </div>
        </div>
        <div className="flex items-center space-x-4 m-3">
          {address && (
            <div className="flex items-center text-white">
              {!isThermal && <LocationOnIcon className="w-5 h-5 mr-2" />}
              <Typography variant={isThermal ? "body2" : "h4"}>{address}</Typography>
            </div>
          )}
        </div>
      </div>

      <div className={`${isThermal ? 'text-center' : 'text-right'} p-5 m-3`}>
        {(orderNumber || numeroFac) && (
          <Typography variant={isThermal ? "body1" : "h4"} className="text-gray-700 mb-1">
            N° Facture : {orderNumber || numeroFac}
          </Typography>
        )}
        <Typography variant={isThermal ? "body1" : "h4"} className="text-gray-600">
          Date : {invoiceDate}
        </Typography>
      </div>

      {/* Info Sections */}
      <div className={`${isThermal ? 'flex flex-col space-y-4' : 'grid grid-cols-2 gap-8'} mb-8 m-3`}>
        {/* Company Info */}
        <div className="space-y-2">
          {!isThermal && (
            <Typography variant="h4" className="text-gray-500 font-medium">
              Informations de l'entreprise
            </Typography>
          )}
          <div className="space-y-1">
            {email && (
              <div className={`flex items-center ${isThermal ? 'justify-center' : ''} text-gray-600`}>
                {!isThermal && <EmailIcon className="w-5 h-5 mr-2" />}
                <Typography variant={isThermal ? "body2" : "h5"}>{email}</Typography>
              </div>
            )}
            {numero && (
              <div className={`flex items-center ${isThermal ? 'justify-center' : ''} text-gray-600`}>
                {!isThermal && <PhoneIcon className="w-5 h-5 mr-2" />}
                <Typography variant={isThermal ? "body2" : "h5"}>{numero}</Typography>
              </div>
            )}
            {coordonne && (
              <Typography variant={isThermal ? "body2" : "h5"} className={`text-gray-600 ${isThermal ? 'text-center' : ''}`}>
                {coordonne}
              </Typography>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className={`space-y-2 ${isThermal ? 'border-t border-dashed pt-4 text-center' : 'm-3'}`}>
          <Typography variant={isThermal ? "body1" : "h5"} className="text-gray-500 font-medium font-bold">
            CLIENT
          </Typography>
          <div className="space-y-1">
            <Typography variant={isThermal ? "body1" : "h5"} className="text-gray-600">
              {clientName}
            </Typography>
            {invoiceNumber &&
              <Typography variant={isThermal ? "body2" : "h5"} className="text-gray-600">
                {invoiceNumber}
              </Typography>
            }
          </div>
        </div>
      </div>

      {/* Facture Title */}
      <div className="text-center mb-8">
        <Divider className="mb-4" />
        <Typography variant="h5" className="font-bold text-gray-900">
          FACTURE
        </Typography>
      </div>
    </div>
  );
}

