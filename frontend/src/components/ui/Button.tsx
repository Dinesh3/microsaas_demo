import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<string, string> = {
    primary: 'bg-ink text-white hover:bg-ink-700',
    secondary: 'bg-white text-ink border border-ink-100 hover:bg-ink-50',
    ghost: 'text-ink hover:bg-ink-50',
    danger: 'bg-rust text-white hover:opacity-90',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
