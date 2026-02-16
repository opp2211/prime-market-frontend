export default function Button({
  variant = 'primary',
  type = 'button',
  onClick,
  children,
  className = '',
  disabled,
}) {
  const cls = `btn btn--${variant} ${className}`
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  )
}
