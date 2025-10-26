import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { Payment } from '../../lib/supabase';
import { SubscriptionService } from '../../lib/subscription';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface PaymentWithDetails extends Payment {
  courses: {
    title: string;
    thumbnail_url: string;
  };
  students: {
    full_name: string;
    email: string;
  };
}

export default function PaymentManagement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, filterPayments]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const pendingPayments = await SubscriptionService.getPendingPayments();
      setPayments(pendingPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = useCallback(() => {
    let filtered = payments;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.students?.full_name?.toLowerCase().includes(term) ||
        payment.students?.email?.toLowerCase().includes(term) ||
        payment.courses?.title?.toLowerCase().includes(term)
      );
    }

    setFilteredPayments(filtered);
  }, [payments, statusFilter, searchTerm]);

  const handleApprovePayment = async (paymentId: number) => {
    if (!user) return;

    setProcessingPayment(paymentId);
    try {
      await SubscriptionService.approvePayment(paymentId, user.id);
      toast.success('Payment approved successfully!');
      await loadPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('Failed to approve payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleRejectPayment = async (paymentId: number) => {
    if (!user) return;

    setProcessingPayment(paymentId);
    try {
      await SubscriptionService.rejectPayment(paymentId, user.id, rejectionReason);
      toast.success('Payment rejected');
      await loadPayments();
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const viewReceipt = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const downloadReceipt = (payment: PaymentWithDetails) => {
    if (payment.receipt_url) {
      const link = document.createElement('a');
      link.href = payment.receipt_url;
      link.download = payment.receipt_filename || 'receipt';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
          <p className="text-gray-600">Review and process payment requests</p>
        </div>
        <button
          onClick={loadPayments}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed' | 'failed')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.students?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.students?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.courses?.title || 'Unknown Course'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.plan_type === 'monthly' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {payment.plan_type === 'monthly' ? 'Monthly' : 'Yearly'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.amount} {payment.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {payment.receipt_url && (
                        <button
                          onClick={() => viewReceipt(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprovePayment(payment.id)}
                            disabled={processingPayment === payment.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Approve Payment"
                          >
                            {processingPayment === payment.id ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectPayment(payment.id)}
                            disabled={processingPayment === payment.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Reject Payment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No payment requests have been submitted yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedPayment.students?.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.students?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <p className="text-sm text-gray-900">{selectedPayment.courses?.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedPayment.plan_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-sm text-gray-900">{selectedPayment.amount} {selectedPayment.currency}</p>
                </div>
              </div>

              {/* Receipt Image */}
              {selectedPayment.receipt_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={selectedPayment.receipt_url}
                      alt="Payment Receipt"
                      className="max-w-full h-auto rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Receipt preview not available</p>
                      <button
                        onClick={() => downloadReceipt(selectedPayment)}
                        className="mt-2 text-blue-600 hover:text-blue-700 flex items-center mx-auto"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedPayment.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedPayment.admin_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedPayment.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRejectPayment(selectedPayment.id)}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprovePayment(selectedPayment.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
