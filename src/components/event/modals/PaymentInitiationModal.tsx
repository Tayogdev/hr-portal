import React from "react";

interface PaymentInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRequest: () => void;
  applicantName?: string;
}

export function PaymentInitiationModal({
  isOpen,
  onClose,
  onPaymentRequest,
}: PaymentInitiationModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Frame 1984078167</h2>
          <div className="mb-6">
            <p className="text-lg font-bold text-green-600 mb-2">
              The application is approved
            </p>
            <p className="text-gray-600">
              Proceed for the payment initiation request
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onPaymentRequest}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Payment request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
