import { Link } from "react-router-dom";
import { useStoreCart } from "../../usePerso/cart_store";
import { Checkbox } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { RecupType } from "../../typescript/DataType";

type SortieProps = {
  row: RecupType
}

export default function CardSortie({ row, StyledTableCell, StyledTableRow }: SortieProps | any) {

//   const [isSelected, setIsSelected] = useReducer((pre)=> !pre, false)
  const [checked, setChecked] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const addId = useStoreCart(state => state.toggleId)
  const id = row.id ?? 0;
  return (
    <StyledTableRow>
      <Checkbox
        onClick={() => addId(id)}
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'controlled' }}
      />
        <Link to={`/sortie/modif/${row.slug}`}>              
        <StyledTableCell component="th" scope="row">
            {row.categorie_libelle}
        </StyledTableCell>
        </Link>
        <StyledTableCell component="th" scope="row">
        {/* {row.libelle} */}
        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
        {row.libelle} 
        {/* {row.somme_total} //
        {row.prix_stock} */}
        </span>
        </StyledTableCell>
        <StyledTableCell align="right">{row.qte}</StyledTableCell>
        <StyledTableCell align="right">{row.pu}</StyledTableCell>
        <StyledTableCell align="right">{row.prix_total}</StyledTableCell>
        {/* <StyledTableCell align="right">{row.ref}</StyledTableCell> */}
    </StyledTableRow>
  )
}
