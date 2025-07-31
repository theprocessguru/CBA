import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface IncomeWarningWidgetProps {
  className?: string;
  showTitle?: boolean;
}

export default function IncomeWarningWidget({ className = "", showTitle = true }: IncomeWarningWidgetProps) {
  const [annualIncome, setAnnualIncome] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  const checkIncomeThreshold = () => {
    const income = parseFloat(annualIncome);
    if (income >= 50000) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            HMRC Filing Requirements Check
          </CardTitle>
          <CardDescription>
            Check if you need HMRC-compliant accounting software for your business
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="income">Annual Income (£)</Label>
            <Input
              id="income"
              type="number"
              placeholder="50000"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              onBlur={checkIncomeThreshold}
            />
          </div>
          <div>
            <Label htmlFor="business-type">Business Type</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole-trader">Sole Trader</SelectItem>
                <SelectItem value="ltd-company">Ltd Company</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={checkIncomeThreshold} className="w-full">
          Check HMRC Requirements
        </Button>

        {showWarning && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">HMRC Filing Required</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p className="mb-2">
                <strong>Important:</strong> With an annual income over £50,000, you are required to use 
                HMRC-compliant accounting software for your tax filings.
              </p>
              <p className="mb-3">
                MyT Accounting Software is fully HMRC-approved and will ensure you meet all 
                legal requirements while saving you money on bookkeeping costs.
              </p>
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">MyT Software is HMRC Making Tax Digital compliant</span>
              </div>
              <Link href="/myt-accounting">
                <Button className="w-full">
                  Explore MyT Accounting Software
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {annualIncome && parseFloat(annualIncome) < 50000 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">No HMRC Requirement</AlertTitle>
            <AlertDescription className="text-green-700">
              <p className="mb-2">
                Your annual income is below £50,000, so you're not required to use specific accounting software for HMRC.
              </p>
              <p className="mb-3">
                However, MyT Accounting can still save you thousands on bookkeeping costs with AI automation.
              </p>
              <Link href="/myt-accounting">
                <Button variant="outline" className="w-full">
                  Still Interested? Explore MyT Accounting
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}