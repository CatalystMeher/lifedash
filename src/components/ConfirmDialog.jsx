import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel" }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="p-4">
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </Modal>
  )
}
