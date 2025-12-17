"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

interface EMICalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  carPrice: number;
}

export default function EMICalculatorDialog({ 
  isOpen, 
  onClose, 
  carPrice 
}: EMICalculatorDialogProps) {
  const [vehiclePrice, setVehiclePrice] = useState(carPrice);
  const [downPayment, setDownPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(56); // in months
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const calculateEMI = () => {
    // Convert interest rate from percentage to decimal
    const monthlyInterestRate = (interestRate / 100) / 12;
    
    // Calculate loan amount (vehicle price - down payment)
    const loanAmount = vehiclePrice - downPayment;
    
    if (loanAmount <= 0 || loanTerm <= 0) {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalAmount(downPayment);
      return;
    }
    
    // EMI formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) / 
                (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);
    
    const total = emi * loanTerm;
    const interest = total - loanAmount;
    
    setMonthlyPayment(Math.round(emi));
    setTotalInterest(Math.round(interest));
    setTotalAmount(Math.round(total + downPayment));
  };

  useEffect(() => {
    calculateEMI();
  }, [vehiclePrice, downPayment, interestRate, loanTerm]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>EMI Calculator</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Calculate your monthly payments for this vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vehicle Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Price</label>
            <Input
              type="number"
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(Number(e.target.value))}
              className="text-lg font-medium"
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Down Payment</label>
              <span className="text-sm text-gray-500">
                {formatPrice(downPayment)} ({Math.round((downPayment / vehiclePrice) * 100)}%)
              </span>
            </div>
            <Slider
              value={[Math.round((downPayment / vehiclePrice) * 100)]}
              onValueChange={([value]) => setDownPayment((value / 100) * vehiclePrice)}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Loan Term</label>
              <span className="text-sm text-gray-500">{loanTerm} months</span>
            </div>
            <Slider
              value={[loanTerm]}
              onValueChange={([value]) => setLoanTerm(value)}
              min={12}
              max={84}
              step={12}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 year</span>
              <span>3 years</span>
              <span>5 years</span>
              <span>7 years</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Interest Rate</label>
              <span className="text-sm text-gray-500">{interestRate}%</span>
            </div>
            <Slider
              value={[interestRate]}
              onValueChange={([value]) => setInterestRate(value)}
              min={3}
              max={15}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3%</span>
              <span>9%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Monthly Payment</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(monthlyPayment)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Loan Amount</p>
                <p className="font-medium">{formatPrice(vehiclePrice - downPayment)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Interest</p>
                <p className="font-medium">{formatPrice(totalInterest)}</p>
              </div>
              <div>
                <p className="text-gray-500">Down Payment</p>
                <p className="font-medium">{formatPrice(downPayment)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-medium">{formatPrice(totalAmount)}</p>
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={onClose}>
            Close Calculator
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

