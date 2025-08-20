import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick || (() => toast('Quick Log coming soon'))}
      className="fixed right-4 w-14 h-14 rounded-2xl accent-bg accent-text font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center fab-bottom-mobile sm:fab-bottom-desktop"
      aria-label="Quick Log"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
