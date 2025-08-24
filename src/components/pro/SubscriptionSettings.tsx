import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useSubscriptionContext } from '@/providers/SubscriptionProvider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { VerifySubscription } from './VerifySubscription';

export function SubscriptionSettings() {
  const { subscription, isActive, loading } = useSubscriptionContext();
  const navigate = useNavigate();
  const isPro = localStorage.getItem('plan_is_pro') === 'true';

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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>Manage your subscription details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <span className="font-medium">Plan Type:</span>
                <span className="capitalize">{subscription.plan_type}</span>
                
                <span className="font-medium">Status:</span>
                <span className="capitalize">{subscription.status}</span>
                
                <span className="font-medium">Activated:</span>
                <span>{new Date(subscription.activated_at).toLocaleDateString()}</span>
                
                <span className="font-medium">Expires:</span>
                <span>{new Date(subscription.expires_at).toLocaleDateString()}</span>
              </div>
              
              {isActive ? (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Active Subscription</AlertTitle>
                  <AlertDescription>
                    Your subscription is active. You have full access to premium features.
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
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Local Storage Status:</h4>
              {renderLocalStorageStatus()}
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Troubleshooting:</h4>
              <VerifySubscription />
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
              <h4 className="text-sm font-medium mb-2">Local Storage Status:</h4>
              {renderLocalStorageStatus()}
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Troubleshooting:</h4>
              <VerifySubscription />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        {!isActive && (
          <Button onClick={() => navigate('/upgrade')}>
            Upgrade to Pro
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default SubscriptionSettings;