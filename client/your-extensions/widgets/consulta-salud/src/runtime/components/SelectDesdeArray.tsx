
import { Select, Label, Option } from 'jimu-ui'
import type { Key, ReactElement, ReactNode, ReactPortal } from 'react'

export default function SelectDesdeArray({label, disabled, array, valor, onChange, setValor}) {
    return (
        <div>
        <Label>{label}</Label>
        <Select
        value={valor}
        onChange={ onChange ? (e) => onChange(e) : (e) => setValor(e.target.value) }
        disabled={disabled}>
            <Option value="">Seleccione...</Option>

            {array.map((option: { value: Key; label: string | number | boolean | ReactElement | Iterable<ReactNode> | ReactPortal }) => (
            <Option key={option.value} value={option.value.toLocaleString()}>
                {option.label}
            </Option>
            ))}
        </Select>
        </div>
    )
}


