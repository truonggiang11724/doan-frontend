import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        <Button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;