import { MessageCircle } from 'lucide-react'

export default function AIChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 flex items-center justify-center ai-chat-bottom-mobile sm:ai-chat-bottom-desktop tour-ai-chat"
      aria-label="AI Assistant"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  )
}
