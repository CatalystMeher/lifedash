export default function Card({ className = '', children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`card transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
  