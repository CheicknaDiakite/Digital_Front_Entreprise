import { Box, Typography } from '@mui/material'

export default function Header({orderNumber, nom, numeroFac, url}: any) {
  return (
    <>
      <header className="flex flex-col items-center justify-center mb-5 xl:flex-row xl:justify-between">
        <div>
        <Typography variant="h1" className="mt-4">
          {/* <Box className="flex items-center justify-center mx-auto"> */}
            <img src={url} alt="img" className="h-24 w-24" />
            <Box >{nom}</Box>  {/* Ajoute un espace horizontal autour du texte */}
            {/* <img src={url} alt="brand" className="h-16 w-16" /> */}
          {/* </Box> */}
        </Typography>
          
          {orderNumber && (
            <Typography variant="h6" className="mt-4">
              Numero de la facture : {orderNumber}
            </Typography>
          )}

          {numeroFac && (
            <Typography variant="h4" className="mt-4">
              Numero de la facture : {numeroFac}
            </Typography>
          )}
        </div>

        {/* <div>
          <ul className="flex items-center justify-between flex-wrap">
            <li>
              <button
                onClick={handlePrint}
                className="bg-gray-500 text-white font-bold py-2 px-8 rounded shadow border-2 border-gray-500 hover:bg-transparent hover:text-gray-500 transition-all duration-300"
              >
                Print
              </button>
            </li>
            <li className="mx-2">
              <button className="bg-blue-500 text-white font-bold py-2 px-8 rounded shadow border-2 border-blue-500 hover:bg-transparent hover:text-blue-500 transition-all duration-300">
                Download
              </button>
            </li>
            <li>
              <button className="bg-green-500 text-white font-bold py-2 px-8 rounded shadow border-2 border-green-500 hover:bg-transparent hover:text-green-500 transition-all duration-300">
                Send
              </button>
            </li>
          </ul>
        </div> */}
      </header>
    </>
  )
}
