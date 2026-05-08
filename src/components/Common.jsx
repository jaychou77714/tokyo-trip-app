import React from 'react'
import { X } from 'lucide-react'

// ===== Modal =====
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-sumi/70 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className={`bg-kinari w-full ${maxWidth} md:rounded-lg rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col card-shadow-hover`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-sumi/10">
            <h3 className="editorial-title text-xl">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sumi/5">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

// ===== 按鈕 =====
export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed gap-2'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  const variants = {
    primary: 'bg-sumi text-kinari hover:bg-sumi/90',
    shu: 'bg-shu text-kinari hover:bg-shu/90',
    outline: 'border border-sumi text-sumi hover:bg-sumi hover:text-kinari',
    ghost: 'text-sumi hover:bg-sumi/5',
    danger: 'border border-shu text-shu hover:bg-shu hover:text-kinari',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ===== 輸入框 =====
export function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-usuzumi mb-1.5 tracking-wider">{label}</span>}
      <input
        className={`w-full px-3.5 py-2.5 bg-white/60 border border-sumi/15 focus:border-shu focus:outline-none text-sm transition-colors ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-shu mt-1">{error}</span>}
    </label>
  )
}

// ===== textarea =====
export function Textarea({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-usuzumi mb-1.5 tracking-wider">{label}</span>}
      <textarea
        className={`w-full px-3.5 py-2.5 bg-white/60 border border-sumi/15 focus:border-shu focus:outline-none text-sm transition-colors resize-none ${className}`}
        {...props}
      />
    </label>
  )
}

// ===== Select =====
export function Select({ label, options, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-usuzumi mb-1.5 tracking-wider">{label}</span>}
      <select
        className={`w-full px-3.5 py-2.5 bg-white/60 border border-sumi/15 focus:border-shu focus:outline-none text-sm transition-colors ${className}`}
        {...props}
      >
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// ===== Empty 狀態 =====
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-5xl mb-4 opacity-40">{icon}</div>}
      <div className="editorial-title text-xl mb-1.5">{title}</div>
      {desc && <div className="text-sm text-usuzumi mb-5">{desc}</div>}
      {action}
    </div>
  )
}

// ===== 印章標籤 =====
export function StampLabel({ children, color = '#c9302c' }) {
  return (
    <span
      className="inline-flex items-center justify-center font-display font-bold tracking-widest text-[10px] px-1.5 py-0.5 border-2"
      style={{ borderColor: color, color: color, transform: 'rotate(-2deg)' }}
    >
      {children}
    </span>
  )
}

// ===== Editorial 標題（中日雙語）=====
export function EditorialHeader({ jp, zh, accent = '01' }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-display text-shu text-xs tracking-[0.3em]">No.{accent}</span>
        <div className="flex-1 deco-line text-sumi/30" />
      </div>
      <h2 className="editorial-title text-3xl md:text-4xl">{jp}</h2>
      <p className="text-xs text-usuzumi tracking-[0.2em] uppercase mt-1">{zh}</p>
    </div>
  )
}

// ===== Toast =====
export function Toast({ message, type = 'info', onClose }) {
  React.useEffect(() => {
    if (message) {
      const t = setTimeout(() => onClose(), 2400)
      return () => clearTimeout(t)
    }
  }, [message, onClose])
  if (!message) return null
  const bg = type === 'error' ? 'bg-shu' : type === 'success' ? 'bg-[#7a8a5a]' : 'bg-sumi'
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] animate-fade-up">
      <div className={`${bg} text-kinari px-5 py-3 text-sm shadow-lg max-w-xs`}>
        {message}
      </div>
    </div>
  )
}

// ===== 確認對話框 =====
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = '確認', cancelText = '取消', danger = false }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <div className="px-5 py-4">
        <p className="text-sm text-sumi/80 leading-relaxed mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button variant={danger ? 'shu' : 'primary'} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  )
}
