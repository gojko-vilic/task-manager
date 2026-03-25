import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="h-5 w-3/4 bg-gray-300 rounded" />
    <div className="h-10 w-full bg-gray-300 rounded" />
    <div className="h-5 w-1/2 bg-gray-300 rounded" />
    <div className="h-24 w-full bg-gray-300 rounded" />
    <div className="flex justify-end gap-3">
      <div className="h-10 w-20 bg-gray-300 rounded" />
      <div className="h-10 w-20 bg-gray-300 rounded" />
    </div>
  </div>
);

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      loading={isLoading}
      loadingSkeleton={<LoadingSkeleton />}
    >
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
