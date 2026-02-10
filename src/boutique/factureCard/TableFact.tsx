import React from 'react';
import { Typography } from '@mui/material';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso'

interface TableFactProps {
  list: {
    categorie_libelle: string;
    qte: number;
    unite?: string;
    pu: number;
    prix_total: number;
    date: string;
    ref: string;
  }[];
  total: number;
  discountedTotal: number;
  payerTotal: number;
  payDiscount?: number | string;
  printFormat?: string;
}

const TableFact: React.FC<TableFactProps> = ({ list, total, discountedTotal, payerTotal, payDiscount, printFormat = 'A4' }) => {
  const isThermal = printFormat === 'Thermal';
  const resteAPayer = (total - ((total - discountedTotal) + (Number(payDiscount))));
  // const restTota = (total - )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="overflow-x-auto">
        <table className="w-full print-table">
          {/* Table Header */}
          <thead className="print-table-header">
            <tr className={`${isThermal ? 'bg-gray-100' : 'bg-gray-600'} border-b-2 border-gray-900`}>
              <th className={`text-left ${isThermal ? 'p-1 text-gray-900' : 'p-4 text-gray-50'} font-semibold border-r border-gray-100`}>
                Désignation
              </th>
              <th className={`text-right ${isThermal ? 'p-1 text-gray-900' : 'p-4 text-gray-50'} font-semibold border-r border-gray-100`}>
                Qté
              </th>
              <th className={`text-right ${isThermal ? 'p-1 text-gray-900' : 'p-4 text-gray-50'} font-semibold border-r border-gray-100`}>
                P.U
              </th>
              <th className={`text-right ${isThermal ? 'p-1 text-gray-900' : 'p-4 text-gray-50'} font-semibold`}>
                Total
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="print-table-body">
            {list.map((post, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-900"
              >
                <td className={`${isThermal ? 'p-1' : 'p-4'} border-r border-gray-200`}>
                  <div>
                    <Typography variant={isThermal ? "caption" : "body2"} className="font-medium text-gray-900 leading-tight">
                      {post.categorie_libelle}
                    </Typography>
                    {/* <Typography variant="body2" className="text-gray-400">
                        {post.ref}
                    </Typography>                       */}
                  </div>
                </td>
                <td className={`text-right ${isThermal ? 'p-1' : 'p-4'} border-r border-gray-200`}>
                  {post.qte} {post.unite === 'kilos' ? "" : post.unite}
                </td>
                <td className={`text-right ${isThermal ? 'p-1' : 'p-4'} border-r border-gray-200`}>
                  {formatNumberWithSpaces(post.pu)}
                </td>
                <td className={`text-right ${isThermal ? 'p-1' : 'p-4'} font-medium`}>
                  {formatNumberWithSpaces(post.prix_total)}
                </td>
              </tr>
            ))}

            {/* Summary Rows */}
            <tr className="border-b border-gray-900">
              <td rowSpan={4} className="border-r border-gray-200"></td>
              <td
                colSpan={2}
                className={`text-right ${isThermal ? 'p-1' : 'p-4'} text-gray-600 font-semibold border-r border-gray-200`}
              >
                Sous-total
              </td>
              <td className={`text-right ${isThermal ? 'p-1' : 'p-4'} font-semibold text-gray-900`}>
                {formatNumberWithSpaces(total)}
              </td>
            </tr>

            <tr className="border-b border-gray-900">
              <td
                colSpan={2}
                className={`text-right ${isThermal ? 'p-1' : 'p-4'} text-gray-600 font-semibold border-r border-gray-200`}
              >
                Remise
              </td>
              <td className={`text-right ${isThermal ? 'p-1' : 'p-4'} font-semibold text-red-600`}>
                - {formatNumberWithSpaces(total - discountedTotal)}
              </td>
            </tr>

            {(total - payerTotal) > 0 && (
              <tr className="border-b border-gray-900">
                <td
                  colSpan={2}
                  className={`text-right ${isThermal ? 'p-1' : 'p-4'} text-gray-600 font-semibold border-r border-gray-200`}
                >
                  Montant Payé
                </td>
                <td className={`text-right ${isThermal ? 'p-1' : 'p-4'} font-semibold text-green-600`}>
                  {/* {formatNumberWithSpaces(total - payerTotal)} F */}
                  {formatNumberWithSpaces(payDiscount)}
                </td>
              </tr>
            )}

            <tr className="border-t-2 border-gray-900 bg-gray-300">

              <td
                colSpan={2}
                className={`text-right ${isThermal ? 'p-1' : 'p-4'} text-gray-900 font-bold border-r border-gray-200`}
              >

                {resteAPayer > 0 && "Reste à payer"}
                {resteAPayer === 0 && "Total"}
                {resteAPayer < 0 && "Total"}
              </td>

              <td className={`text-right ${isThermal ? 'p-1 text-base' : 'p-4 text-lg'} font-bold text-gray-900`}>

                {resteAPayer > 0 && formatNumberWithSpaces(resteAPayer)}
                {resteAPayer === 0 && formatNumberWithSpaces(payDiscount)}
                {resteAPayer < 0 && formatNumberWithSpaces(discountedTotal)}
                {" "}F
              </td>

            </tr>
          </tbody>
        </table>
        {/* {resteAPayer < 0 && <>money du reste de l'argent {formatNumberWithSpaces(resteAPayer)} F </> } */}
        {resteAPayer < 0 && (
          <span className="block mt-2 px-4 py-2 rounded-md bg-yellow-100 text-yellow-700 font-semibold text-center">
            Monnaie à rendre : {formatNumberWithSpaces(Math.abs(resteAPayer))} F
          </span>
        )}

      </div>
    </div>
  );
};

export default TableFact;
