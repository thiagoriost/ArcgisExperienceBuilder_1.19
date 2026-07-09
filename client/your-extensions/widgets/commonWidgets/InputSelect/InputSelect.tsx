/* eslint-disable @typescript-eslint/array-type */
import { React } from 'jimu-core'
import { Label, Select } from 'jimu-ui' // import components

// @ts-expect-error
import './style.css'
import { validaLoggerLocalStorage } from '../../shared/utils/export.utils'

const InputSelect = ({
  dataArray = [{ value: 1, label: 'prueba1' }, { value: 2, label: 'prueba2' }],
  onChange,
  value = undefined,
  label = 'Campo',
  campo = '',
  placeHolder = `Seleccione  ${label}...`
}: {
  dataArray?: { value: number; label: string }[];
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: number;
  label?: string;
  campo?: string;
  placeHolder?: string;
}) => {
  // console.log({dataArray, campo})
  const data = dataArray.length ? dataArray : dataArray[campo]
  // const data = dataArray.length ? dataArray : campo !== '' ? [{ value: value !== undefined ? value : campo, label: campo }] : []
  if (validaLoggerLocalStorage(`logger`)) console.log({ dataArray, value, label, campo, placeHolder, data })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Label size='sm'> {label} </Label>
        <Select
            onChange={onChange}
            placeholder={placeHolder}
            value={value}
        >
            {
                data &&
                    data.map(
                      ({ value, label }) => (
                          <option value={value}>{label}</option>
                      ))
            }
        </Select>
    </div>
  )
}

export default InputSelect
