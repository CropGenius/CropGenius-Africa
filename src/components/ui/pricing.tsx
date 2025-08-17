"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Shield, TrendingUp, Users, Zap, Award, Lock, HeadphonesIcon } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingProps {
  monthlyPrice?: number;
  annualPrice?: number;
  title?: string;
  description?: string;
  onUpgrade?: (planType: 'monthly' | 'annual') => void;
}

export function Pricing({
  monthlyPrice = 999,
  annualPrice = 9999,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you. All Pro features included.",
  onUpgrade,
}: PricingProps) {
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual (best value)
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsAnnual(checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#10b981", // green
          "#3b82f6", // blue
          "#8b5cf6", // purple
          "#f59e0b", // yellow
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle", "square"],
      });
    }
  };

  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - annualPrice;
  const savingsPercent = Math.round((savings / monthlyTotal) * 100);
  const monthlyEquivalent = Math.round(annualPrice / 12);

  const monthlyFeatures = [
    { icon: Zap, text: "All core Pro features" },
    { icon: Users, text: "Unlimited scans & field analysis" },
    { icon: TrendingUp, text: "Advanced crop insights & AI chat" },
    { icon: HeadphonesIcon, text: "Email support (48h response)" },
    { icon: Lock, text: "No long-term commitment" },
    { icon: Shield, text: "7-day money-back guarantee" },
  ];

  const annualFeatures = [
    { icon: Zap, text: "Everything in Monthly, plus:" },
    { icon: Award, text: `Save KES ${savings.toLocaleString()} (${savingsPercent}% off)` },
    { icon: HeadphonesIcon, text: "Priority support (24h response)" },
    { icon: Users, text: "Beta access to new features" },
    { icon: TrendingUp, text: "Annual usage reports & insights" },
    { icon: Shield, text: "14-day money-back guarantee" },
  ];

  const currentFeatures = isAnnual ? annualFeatures : monthlyFeatures;

  const handleUpgradeClick = () => {
    onUpgrade?.(isAnnual ? 'annual' : 'monthly');
  };

  return (
    <div className="container max-w-6xl py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Toggle with default Annual selected */}
      <div className="flex justify-center items-center gap-3 mb-10">
        <span className={cn(
          "font-medium transition-colors",
          !isAnnual ? "text-foreground" : "text-muted-foreground"
        )}>
          Monthly
        </span>
        <Label>
          <Switch
            ref={switchRef as any}
            checked={isAnnual}
            onCheckedChange={handleToggle}
            className="relative"
          />
        </Label>
        <span className={cn(
          "font-medium transition-colors flex items-center gap-2",
          isAnnual ? "text-foreground" : "text-muted-foreground"
        )}>
          Annual 
          {isAnnual && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
              Save {savingsPercent}%
            </span>
          )}
        </span>
      </div>

      {/* Single Professional Plan Card */}
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 100,
          }}
          className="rounded-2xl border-2 border-primary p-8 bg-background relative overflow-hidden"
        >
          {/* Best Value Badge for Annual */}
          {isAnnual && (
            <div className="absolute top-0 right-0 bg-primary py-1 px-4 rounded-bl-xl flex items-center">
              <TrendingUp className="text-primary-foreground h-4 w-4" />
              <span className="text-primary-foreground ml-1 font-semibold text-sm">
                BEST VALUE
              </span>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            {/* Plan Name & Description */}
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-foreground mb-2">
                PROFESSIONAL
              </p>
              <p className="text-sm text-muted-foreground">
                {isAnnual 
                  ? "Annual — Best Value, Save 2 months"
                  : "Monthly — Flexible, cancel anytime"}
              </p>
            </div>

            {/* Price Display */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold tracking-tight text-foreground">
                  <NumberFlow
                    value={isAnnual ? annualPrice : monthlyPrice}
                    format={{
                      style: "currency",
                      currency: "KES",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                  />
                </span>
                <span className="text-lg text-muted-foreground">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              
              {/* Pricing context */}
              {isAnnual ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Equivalent to KES {monthlyEquivalent.toLocaleString()}/month
                  </p>
                  <p className="text-sm text-muted-foreground line-through">
                    KES {monthlyTotal.toLocaleString()}/year if paid monthly
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Billed monthly • No commitment
                </p>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              {currentFeatures.map((feature, idx) => (
                <motion.div
                  key={`${isAnnual}-${idx}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <feature.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Usage Limits */}
            <div className="border rounded-lg p-4 mb-6 bg-muted/30">
              <p className="font-semibold text-sm mb-2">What's Included:</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Unlimited field scans & analysis</li>
                <li>• AI-powered crop recommendations</li>
                <li>• Weather integration & alerts</li>
                <li>• Export reports (PDF/CSV)</li>
                <li>• {isAnnual ? "Priority" : "Standard"} API access</li>
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleUpgradeClick}
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "lg",
                }),
                "w-full text-lg font-semibold",
                "bg-primary hover:bg-primary/90",
                "transform transition-all hover:scale-105"
              )}
            >
              {isAnnual 
                ? `Upgrade — Best Value (Save ${savingsPercent}%)`
                : "Start Monthly — KES " + monthlyPrice + "/mo"}
            </button>

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>{isAnnual ? "14-day" : "7-day"} money-back guarantee</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure payment • Cancel anytime</span>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                No hidden fees • Instant activation
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-6 text-center">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="font-medium mb-2">How do cancellations work?</p>
            <p className="text-sm text-muted-foreground">
              {isAnnual 
                ? "You can cancel anytime. Your access continues until the end of your billing year."
                : "Cancel anytime with one click. Your access continues until the end of the current month."}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="font-medium mb-2">Can I switch between monthly and annual?</p>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade from monthly to annual anytime and we'll prorate the difference. 
              Downgrading from annual to monthly takes effect at the end of your annual term.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="font-medium mb-2">Do I keep my data after canceling?</p>
            <p className="text-sm text-muted-foreground">
              Yes, your data remains accessible for 90 days after cancellation. 
              You can export everything or reactivate your subscription during this period.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Trusted by 10,000+ farmers worldwide
        </p>
        <div className="flex justify-center gap-8 opacity-50">
          <div className="w-20 h-8 bg-muted rounded"></div>
          <div className="w-20 h-8 bg-muted rounded"></div>
          <div className="w-20 h-8 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}