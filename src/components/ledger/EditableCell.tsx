import { useState, useRef, useEffect, memo } from 'react'

interface EditableCellProps {
  value: number
  onChange: (value: number) => void
  className?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  readOnly?: boolean
}

export const EditableCell = memo(function EditableCell({ value, onChange, className = '', dir = 'ltr', readOnly = false }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalValue(String(value))
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleBlur = () => {
    setEditing(false)
    const parsed = parseFloat(localValue)
    if (!isNaN(parsed) && parsed !== value) {
      onChange(parsed)
    } else {
      setLocalValue(String(value))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setLocalValue(String(value))
      setEditing(false)
    }
  }

  if (readOnly) {
    return (
      <span className={`block px-2 py-1 text-sm tabular-nums ${className}`} dir={dir}>
        {value}
      </span>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`w-full px-2 py-1 text-sm bg-transparent border border-amber-400 dark:border-amber-600 rounded focus:outline-none tabular-nums ${className}`}
        dir={dir}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    )
  }

  return (
    <span
      className={`block px-2 py-1 text-sm cursor-pointer rounded hover:bg-amber-100 dark:hover:bg-zinc-800 tabular-nums ${className}`}
      dir={dir}
      onClick={() => !readOnly && setEditing(true)}
    >
      {value}
    </span>
  )
})
