import { forwardRef } from 'react'

const Card = forwardRef(({ className = '', children, onClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`card transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export default Card
  