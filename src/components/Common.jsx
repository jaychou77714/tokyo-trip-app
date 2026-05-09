import React from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-sumi/60 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className={`paper-plain w-full ${maxWidth} md:rounded-md rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-sumi card-shadow-hover relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-dashed border-gold relative">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-stamp"></span>
              <h3 className="editorial-title text-xl">{title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-shu/15 rounded-full">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'relative inline-flex items-center justify-center font-display font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed gap-2 tracking-wider'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  if (variant === 'primary' || variant === 'shu' || variant === 'stamp') {
    const colorMap = {
      primary: 'bg-sumi text-kinari2',
      shu: 'bg-shu text-kinari2',
      stamp: 'bg-stamp text-kinari2',
    }
    return (
      <button
        className={`${base} ${sizes[size]} ${colorMap[variant]} ${className}`}
        style={{
          border: '1.5px solid #3D2817',
          boxShadow: '3px 3px 0 #3D2817',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = '1px 1px 0 #3D2817'
          e.currentTarget.style.transform = 'translate(2px, 2px)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = '3px 3px 0 #3D2817'
          e.currentTarget.style.transform = 'translate(0, 0)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '3px 3px 0 #3D2817'
          e.currentTarget.style.transform = 'translate(0, 0)'
        }}
        {...props}
      >
        {children}
      </button>
    )
  }

  const variants = {
    outline: 'border-2 border-dashed border-sumi text-sumi hover:bg-sumi hover:text-kinari2 hover:border-solid',
    ghost: 'text-sumi hover:bg-sumi/10',
    danger: 'border-2 border-dashed border-stamp text-stamp hover:bg-stamp hover:text-kinari2 hover:border-solid',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">✎ {label}</span>}
      <input className={`w-full form-input ${className}`} {...props} />
      {error && <span className="block text-xs text-stamp mt-1">⚠ {error}</span>}
    </label>
  )
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">✎ {label}</span>}
      <textarea className={`w-full form-input resize-none ${className}`} {...props} />
    </label>
  )
}

export function Select({ label, options, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">✎ {label}</span>}
      <select className={`w-full form-input ${className}`} {...props}>
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center relative">
      <div className="absolute inset-x-8 inset-y-4 border-2 border-dashed border-gold/60 pointer-events-none" />
      {icon && <div className="text-5xl mb-4 opacity-50 relative">{icon}</div>}
      <div className="editorial-title text-xl mb-1.5 relative">{title}</div>
      {desc && <div className="text-sm text-usuzumi mb-5 relative">{desc}</div>}
      {action && <div className="relative">{action}</div>}
    </div>
  )
}

export function StampLabel({ children, color = '#E84E4E' }) {
  return (
    <span
      className="inline-flex items-center justify-center font-display font-bold tracking-widest text-[10px] px-2 py-0.5 border-[1.5px]"
      style={{ borderColor: color, color: color, transform: 'rotate(-2deg)', background: 'rgba(255,252,245,0.6)' }}
    >
      ◉ {children}
    </span>
  )
}

export function StampCircle({ children, color = '#E84E4E', size = 44 }) {
  return (
    <span
      className="inline-flex items-center justify-center font-display font-bold flex-shrink-0"
      style={{
        width: size, height: size,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        color: color,
        background: 'rgba(250,246,236,0.5)',
        transform: 'rotate(-8deg)',
        fontSize: size * 0.28,
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </span>
  )
}

export function WashiTape({ children, color = 'shu', className = '' }) {
  const colorClass = {
    shu: 'washi',
    blue: 'washi washi-blue',
    green: 'washi washi-green',
    yellow: 'washi washi-yellow',
  }[color]
  return <span className={`${colorClass} text-xs ${className}`}>{children}</span>
}

export function EditorialHeader({ jp, zh, accent = '01', tape = 'shu' }) {
  return (
    <div className="mb-6 relative">
      <div className="flex items-center gap-3 mb-3">
        <WashiTape color={tape}>No.{accent}</WashiTape>
        <div className="flex-1 deco-dashed" />
        <span className="text-[10px] text-usuzumi tracking-widest font-mono">★ MEMO ★</span>
      </div>
      <h2 className="editorial-title text-3xl md:text-4xl">{jp}</h2>
      <p className="text-xs text-usuzumi tracking-[0.2em] uppercase mt-1 font-mono">— {zh} —</p>
    </div>
  )
}

export function Toast({ message, type = 'info', onClose }) {
  React.useEffect(() => {
    if (message) {
      const t = setTimeout(() => onClose(), 2400)
      return () => clearTimeout(t)
    }
  }, [message, onClose])
  if (!message) return null
  const config = {
    error: { bg: '#E84E4E', icon: '✗' },
    success: { bg: '#7FA468', icon: '✓' },
    info: { bg: '#3D2817', icon: '✎' },
  }[type] || { bg: '#3D2817', icon: '✎' }
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] animate-fade-up">
      <div
        className="text-kinari2 px-5 py-3 text-sm flex items-center gap-2 max-w-xs font-display"
        style={{
          background: config.bg,
          border: '1.5px solid #3D2817',
          boxShadow: '3px 3px 0 #3D2817',
        }}
      >
        <span className="font-bold">{config.icon}</span>
        {message}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = '確認', cancelText = '取消', danger = false }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <div className="px-5 py-4">
        <p className="text-sm text-sumi/85 leading-relaxed mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button variant={danger ? 'stamp' : 'primary'} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  )
}
