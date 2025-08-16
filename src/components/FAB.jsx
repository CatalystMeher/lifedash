import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick || (() => toast('Quick Log coming soon'))}
      className="fixed right-4 bottom-20 sm:bottom-24 w-14 h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 flex items-center justify-center"
      aria-label="Quick Log"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
