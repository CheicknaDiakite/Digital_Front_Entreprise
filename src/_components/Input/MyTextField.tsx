import { TextField, TextFieldProps } from '@mui/material'
import { ChangeEvent } from 'react'

type TypeText = {
  
  name: string,
  onChange: (value: ChangeEvent<HTMLInputElement>) => void,
} & TextFieldProps; // Étend TextFieldProps pour inclure toutes les props de MUI

export default function MyTextField({ name, onChange, ...props}: TypeText) {
  return (
    <TextField 
    variant="outlined"
    
    name={name}
    onChange={onChange}
    {...props}
    >
        
    </TextField>
  )
}
