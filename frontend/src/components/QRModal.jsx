import React from 'react';
import { X, QrCode, CheckCircle, Shield, Download } from 'lucide-react';

export default function QRModal({ isOpen, onClose, procurementData }) {
  if (!isOpen || !procurementData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Procurement QR Receipt</h3>
          <p className="text-xs text-gray-500 font-mono mt-1">Lot #{procurementData.lot_number}</p>
        </div>

        {/* QR Image */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center mb-6">
          <img
            src={procurementData.qr_code_url}
            alt="Lot QR Code"
            className="w-48 h-48 object-contain rounded-lg border border-gray-300 shadow-sm"
          />
          <span className="text-[11px] text-gray-400 mt-2 font-mono flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" /> Cryptographically Linked Procurement Record
          </span>
        </div>

        {/* Breakdown Details */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 text-xs space-y-2 text-gray-700">
          <div className="flex justify-between border-b border-emerald-200/50 pb-1.5">
            <span className="text-gray-500 font-medium">Crop Type:</span>
            <span className="font-bold text-gray-900">{procurementData.crop_type}</span>
          </div>
          <div className="flex justify-between border-b border-emerald-200/50 pb-1.5">
            <span className="text-gray-500 font-medium">Quality Grade:</span>
            <span className="font-bold text-emerald-700">{procurementData.grade}</span>
          </div>
          <div className="flex justify-between border-b border-emerald-200/50 pb-1.5">
            <span className="text-gray-500 font-medium">Verified Net Weight:</span>
            <span className="font-bold text-gray-900">{procurementData.verified_weight_kg} kg</span>
          </div>
          <div className="flex justify-between border-b border-emerald-200/50 pb-1.5">
            <span className="text-gray-500 font-medium">MSP Rate:</span>
            <span className="font-bold text-gray-900">₹{procurementData.rate_per_kg} / kg</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold text-emerald-900">
            <span>Total Payout Amount:</span>
            <span className="text-emerald-700">₹{procurementData.total_amount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Close & Return to Dashboard
        </button>

      </div>
    </div>
  );
}
