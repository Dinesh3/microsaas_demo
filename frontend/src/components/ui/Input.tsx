import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus-ring ${props.className ?? ''}`}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-400 focus-ring ${props.className ?? ''}`}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink focus-ring ${props.className ?? ''}`}
    />
  )
}

export function Label({ children }: { children: string }) {
  return <label className="block text-xs font-medium text-ink-400 mb-1">{children}</label>
}
