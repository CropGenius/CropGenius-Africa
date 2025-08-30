import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useSubscriptionContext } from '@/providers/SubscriptionProvider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, AlertTriangle, Download, CreditCard, Calendar, X, RefreshCw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { VerifySubscription } from './VerifySubscription';

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  confirmation_code: string | null;
  payment_method: string | null;
}

export function SubscriptionSettings() {
  const { subscription, isActive, loading } = useSubscriptionContext();
  const { user } = useSimpleAuthContext();
  const navigate = useNavigate();
  const isPro = localStorage.getItem('plan_is_pro') === 'true';
  
  // State for payment history and management
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);

  // Load payment history
  useEffect(() => {
    if (user?.email) {
      loadPaymentHistory();
    }
  }, [user?.email]);

  const loadPaymentHistory = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_email', user.email)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription || !user?.email) return;
    
    setCanceling(true);
    try {
      // Update subscription status to cancelled
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_email', user.email);
      
      if (error) throw error;
      
      // Clear pro status from localStorage
      localStorage.setItem('plan_is_pro', 'false');
      
      toast.success('Subscription cancelled successfully. You can continue using Pro features until your subscription expires.');
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
      setShowCancelConfirm(false);
    }
  };

  const changePlan = async (newPlan: 'monthly' | 'annual') => {
    if (!subscription || !user?.email) return;
    
    setChangingPlan(true);
    try {
      // For plan changes, redirect to upgrade page with current plan context
      navigate(`/upgrade?current=${subscription.plan_type}&change=${newPlan}`);
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan. Please try again.');
    } finally {
      setChangingPlan(false);
    }
  };

  const downloadInvoice = (payment: PaymentHistory) => {
    // Generate a simple invoice
    const invoice = {
      invoice_number: `INV-${payment.id.slice(0, 8)}`,
      date: new Date(payment.created_at).toLocaleDateString(),
      amount: payment.amount,
      currency: payment.currency,
      payment_method: payment.payment_method,
      confirmation_code: payment.confirmation_code,
      customer_email: user?.email,
      description: payment.amount >= 5000 ? 'CropGenius Annual Plan' : 'CropGenius Monthly Plan'
    };
    
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cropgenius-invoice-${invoice.invoice_number}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully');
  };

  const getNextBillingDate = () => {
    if (!subscription || !isActive) return null;
    
    const expiryDate = new Date(subscription.expires_at);
    return expiryDate > new Date() ? expiryDate.toLocaleDateString() : null;
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Loading your subscription details...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-full bg-gray-100 animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const renderLocalStorageStatus = () => {
    if (isPro) {
      return (
        <div className="flex items-center p-2 bg-green-50 rounded-md">
          <Check className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-green-700">Pro status active in local storage</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center p-2 bg-amber-50 rounded-md">
        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
        <span className="text-sm text-amber-700">Pro status not detected in local storage</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your CropGenius Pro subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Plan Type:</span>
                  <p className="text-lg font-semibold capitalize">{subscription.plan_type}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <p className={`text-lg font-semibold capitalize ${
                    subscription.status === 'active' ? 'text-green-600' : 
                    subscription.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {subscription.status}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Activated:</span>
                  <p>{new Date(subscription.activated_at).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">
                    {subscription.status === 'cancelled' ? 'Access Until:' : 'Next Billing:'}
                  </span>
                  <p>{new Date(subscription.expires_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {isActive ? (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertTitle>
                    {subscription.status === 'cancelled' ? 'Access Until Expiry' : 'Active Subscription'}
                  </AlertTitle>
                  <AlertDescription>
                    {subscription.status === 'cancelled' 
                      ? 'Your subscription is cancelled but you can still use Pro features until the expiry date.'
                      : 'Your subscription is active. You have full access to premium features.'
                    }
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Subscription Expired</AlertTitle>
                  <AlertDescription>
                    Your subscription has expired. Please renew to continue accessing premium features.
                  </AlertDescription>
                </Alert>
              )}

              {/* Subscription Management Actions */}
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Subscription Management</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subscription.status === 'active' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => changePlan(subscription.plan_type === 'monthly' ? 'annual' : 'monthly')}
                        disabled={changingPlan}
                        className="justify-start"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Switch to {subscription.plan_type === 'monthly' ? 'Annual' : 'Monthly'}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setShowCancelConfirm(true)}
                        className="justify-start text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => navigate('/upgrade')}
                    className="justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </>
          ) : (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Active Subscription</AlertTitle>
              <AlertDescription>
                You don't have an active subscription. Upgrade to Pro to access premium features.
              </AlertDescription>
            </Alert>
            
            <div className="pt-2">
              <VerifySubscription />
            </div>
          </>
        )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent CropGenius Pro payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="text-center py-4 text-gray-500">Loading payment history...</div>
          ) : paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{payment.currency} {payment.amount}</span>
                      <span className="text-sm text-gray-500">
                        • {payment.amount >= 5000 ? 'Annual Plan' : 'Monthly Plan'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(payment.created_at).toLocaleDateString()} 
                      {payment.payment_method && ` • ${payment.payment_method}`}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(payment)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Invoice
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No payment history found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Having issues with your subscription?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Local Storage Status:</h4>
            {renderLocalStorageStatus()}
          </div>
          
          <div className="pt-2">
            <VerifySubscription />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Cancel Subscription</CardTitle>
              <CardDescription>
                Are you sure you want to cancel your CropGenius Pro subscription?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">
                  Your subscription will be cancelled but you'll continue to have access to Pro features until {new Date(subscription?.expires_at || '').toLocaleDateString()}.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                disabled={canceling}
              >
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={cancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SubscriptionSettings;