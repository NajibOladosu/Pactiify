"use client";

import { createContractAction } from "@/app/actions"; // Import the server action
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react"; // Import useTransition
import { ChevronRightIcon, PlusIcon, FileTextIcon, Loader2 } from "lucide-react"; // Import Loader2
import Link from "next/link";

export default function NewContractPage() {
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast
  const [isPending, startTransition] = useTransition(); // For loading state
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [contractDetails, setContractDetails] = useState({
    title: "",
    description: "",
    clientEmail: "",
    price: "",
    currency: "USD",
    paymentType: "fixed",
  });
  const [formError, setFormError] = useState<string | null>(null); // State for form-level errors

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    handleNextStep();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContractDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    // Basic validation (can be expanded)
    if (!contractDetails.title) {
      setFormError("Contract title is required.");
      return;
    }
    if (!contractDetails.clientEmail) {
      setFormError("Client's email is required.");
      return;
    }
     if (!contractDetails.price) {
      setFormError("Price/Rate is required.");
      return;
    }


    startTransition(async () => {
      const result = await createContractAction({
        title: contractDetails.title,
        description: contractDetails.description,
        clientEmail: contractDetails.clientEmail,
        price: contractDetails.price,
        currency: contractDetails.currency,
        paymentType: contractDetails.paymentType,
        template: selectedTemplate,
      });

      if (result.error) {
        toast({
          title: "Error Creating Contract",
          description: result.error,
          variant: "destructive",
        });
        setFormError(result.error); // Show error near the button
      } else if (result.success && result.contractId) {
        toast({
          title: "Contract Created",
          description: "Your new contract draft has been saved.",
        });
        // Navigate to the newly created contract's page (or contracts list)
        // router.push(`/dashboard/contracts/${result.contractId}`); // Option: Go to specific contract
        router.push('/dashboard/contracts'); // Option: Go to list
      } else {
         toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Create New Contract</h1>
          <p className="text-muted-foreground mt-1">Follow the steps to create a legally binding contract.</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2 w-full">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-muted text-muted-foreground'}`}>
            1
          </div>
          <div className="text-sm font-medium">Select Template</div>
          <div className="h-0.5 flex-1 bg-muted relative">
            <div className={`h-full bg-primary-500 absolute top-0 left-0 ${step > 1 ? 'w-full' : 'w-0'} transition-all`}></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-muted text-muted-foreground'}`}>
            2
          </div>
          <div className="text-sm font-medium">Contract Details</div>
          <div className="h-0.5 flex-1 bg-muted relative">
            <div className={`h-full bg-primary-500 absolute top-0 left-0 ${step > 2 ? 'w-full' : 'w-0'} transition-all`}></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-muted text-muted-foreground'}`}>
            3
          </div>
          <div className="text-sm font-medium">Review & Create</div>
        </div>
      </div>

      {/* Step content */}
      <Card className="mt-8">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Select a Contract Template</CardTitle>
              <CardDescription>Choose a starting point for your contract.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Corrected Grid Structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Basic Freelance Agreement */}
                <div
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary-500 hover:bg-primary-500/5"
                  onClick={() => handleTemplateSelect('Basic Freelance Agreement')}
                >
                  <div className="flex items-start gap-3">
                    <FileTextIcon className="h-6 w-6 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Basic Freelance Agreement</h3>
                      <p className="text-sm text-muted-foreground mt-1">A simple agreement for freelance work with basic terms and conditions.</p>
                    </div>
                  </div>
                </div>

                {/* Web Development Contract */}
                <div
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary-500 hover:bg-primary-500/5"
                  onClick={() => handleTemplateSelect('Web Development Contract')}
                >
                  <div className="flex items-start gap-3">
                    <FileTextIcon className="h-6 w-6 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Web Development Contract</h3>
                      <p className="text-sm text-muted-foreground mt-1">Comprehensive contract for website development projects.</p>
                    </div>
                  </div>
                </div>

                {/* Graphic Design Contract */}
                <div
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary-500 hover:bg-primary-500/5"
                  onClick={() => handleTemplateSelect('Graphic Design Contract')}
                >
                  <div className="flex items-start gap-3">
                    <FileTextIcon className="h-6 w-6 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Graphic Design Contract</h3>
                      <p className="text-sm text-muted-foreground mt-1">For design services including logo design, branding, and illustrations.</p>
                    </div>
                  </div>
                </div>

                {/* Start from Scratch */}
                <div
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary-500 hover:bg-primary-500/5"
                  onClick={() => handleTemplateSelect('custom')} // 'custom' is fine here as it signifies no template ID
                >
                  <div className="flex items-start gap-3">
                    <PlusIcon className="h-6 w-6 text-primary-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Start from Scratch</h3>
                      <p className="text-sm text-muted-foreground mt-1">Create a custom contract with your own terms and conditions.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/contracts">Cancel</Link>
                </Button>
                <Button type="button" onClick={handleNextStep} disabled>
                  Next <ChevronRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
        
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>Fill in the basic information for your contract.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Contract Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={contractDetails.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Website Redesign Project for XYZ Company" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Contract Description</Label>
                    <textarea 
                      id="description" 
                      name="description"
                      value={contractDetails.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the project and agreement" 
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientEmail">Client's Email</Label>
                    <Input 
                      id="clientEmail" 
                      name="clientEmail" 
                      type="email"
                      value={contractDetails.clientEmail}
                      onChange={handleInputChange}
                      placeholder="client@example.com" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">The client will receive an invitation to review and sign the contract.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paymentType">Payment Type</Label>
                      <div className="flex space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="fixed"
                            name="paymentType"
                            value="fixed"
                            checked={contractDetails.paymentType === "fixed"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                          />
                          <Label htmlFor="fixed">Fixed Price</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="hourly"
                            name="paymentType"
                            value="hourly"
                            checked={contractDetails.paymentType === "hourly"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                          />
                          <Label htmlFor="hourly">Hourly Rate</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">
                          {contractDetails.paymentType === "hourly" ? "Hourly Rate" : "Fixed Price"}
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="price"
                            name="price"
                            type="text"
                            inputMode="decimal"
                            value={contractDetails.price}
                            onChange={handleInputChange}
                            placeholder={contractDetails.paymentType === "hourly" ? "e.g., 50.00" : "e.g., 500.00"}
                            className="pl-7"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          name="currency"
                          value={contractDetails.currency}
                          onChange={handleInputChange as any}
                          className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleNextStep}>
                    Next <ChevronRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
        
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Review & Create Contract</CardTitle>
              <CardDescription>Review your contract details before creating it.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Contract Type</h4>
                      {/* Display the selected template name or 'Custom' */}
                      <p className="text-sm font-medium">
                        {selectedTemplate === 'custom' ? 'Custom Contract' : selectedTemplate}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Contract Title</h4>
                      <p className="text-sm font-medium">{contractDetails.title || "Not specified"}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Client Email</h4>
                      <p className="text-sm font-medium">{contractDetails.clientEmail || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm">{contractDetails.description || "No description provided."}</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileTextIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">What happens next?</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        After creating this contract, you'll be taken to the contract editor where you can customize the terms.
                        Once you're happy with the contract, you can send it to your client for review and signature.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Display Form Error Here */}
                {formError && <p className="text-sm text-destructive mt-4 text-center">{formError}</p>}

                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isPending}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Contract"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
