import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailTestForm {
  server: string;
  port: string;
  from: string;
  to: string;
  username: string;
  password: string;
}

const initialFormState: EmailTestForm = {
  server: "",
  port: "",
  from: "",
  to: "",
  username: "",
  password: "",
};

export const EmailTester = () => {
  const [form, setForm] = useState<EmailTestForm>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, content: "" });

  const handleInputChange = (field: keyof EmailTestForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields = Object.entries(form);
    const emptyFields = requiredFields.filter(([_, value]) => !value);
    
    if (emptyFields.length > 0) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleSendTest = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const responseText = await response.text();
      
      // Try to parse as JSON first
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          toast.success(data.message || "Test email sent successfully");
        } else {
          setErrorDialog({
            open: true,
            content: data.error || 'Failed to send email'
          });
        }
      } catch (parseError) {
        // If parsing fails, show the raw response
        setErrorDialog({
          open: true,
          content: responseText
        });
      }
    } catch (error) {
      console.error('Email test error:', error);
      setErrorDialog({
        open: true,
        content: error instanceof Error ? error.message : "Failed to send test email"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Server Address</label>
            <Input
              placeholder="smtp.gmail.com"
              value={form.server}
              onChange={(e) => handleInputChange("server", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Port</label>
            <Select onValueChange={(value) => handleInputChange("port", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select port" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 (SMTP)</SelectItem>
                <SelectItem value="465">465 (SMTPS)</SelectItem>
                <SelectItem value="587">587 (Submission)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">From Email</label>
            <Input
              type="email"
              placeholder="from@example.com"
              value={form.from}
              onChange={(e) => handleInputChange("from", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To Email</label>
            <Input
              type="email"
              placeholder="to@example.com"
              value={form.to}
              onChange={(e) => handleInputChange("to", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              placeholder="SMTP username"
              value={form.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="SMTP password"
              value={form.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSendTest}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Test Email
        </Button>
      </div>

      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Server Response</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
            {errorDialog.content}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
};