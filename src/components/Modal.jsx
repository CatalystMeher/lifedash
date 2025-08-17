export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md rounded-2xl card shadow-xl animate-slide-up my-4 max-h-[calc(100vh-2rem)] flex flex-col">
          <div className="p-6 border-b theme-border flex-shrink-0">
            <h3 className="text-lg font-semibold theme-text">{title}</h3>
          </div>
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
          {footer && (
            <div className="p-4 border-t theme-border theme-bg-secondary flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
  