import React from 'react'
import { X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'accent'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100',
  }
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-50 disabled:text-gray-500',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-50 disabled:text-gray-500',
        className
      )}
      {...props}
    />
  )
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  maxWidth = 'max-w-lg'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={onClose} />
      <div className={cn("relative w-full rounded-xl bg-white shadow-xl animate-in fade-in zoom-in duration-200", maxWidth)}>
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base sm:text-lg font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">{children}</div>
        {footer && <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  )
}
