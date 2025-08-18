import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick || (() => toast('Quick Log coming soon'))}
      className="fixed right-4 bottom-28 sm:bottom-4 w-14 h-14 rounded-2xl accent-bg accent-text font-semibold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 flex items-center justify-center"
      aria-label="Quick Log"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
