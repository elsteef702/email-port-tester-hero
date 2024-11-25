import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EmailTester = () => {
  const [server, setServer] = useState("");
  const [port, setPort] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!server || !port || !from || !to || !username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Starting email test with config:', {
      server,
      port,
      from,
      to,
      username,
    });

    try {
      const response = await fetch('/.netlify/functions/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server,
          port: parseInt(port),
          from,
          to,
          username,
          password,
        }),
      });

      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      let data;
      try {
        // Only try to parse as JSON if the content type is application/json
        if (contentType?.includes('application/json')) {
          data = JSON.parse(responseText);
        } else {
          throw new Error('Server returned non-JSON response');
        }
      } catch (error) {
        console.error('Response parsing error:', error);
        console.error('Raw response:', responseText);
        throw new Error(
          'Failed to process server response. Please check the server logs for more details.'
        );
      }

      if (data.success) {
        toast({
          title: "Test email sent",
          description: "The test email was sent successfully",
        });
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email test error:', error);
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "An error occurred while sending the test email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Server Address</label>
          <Input
            placeholder="smtp.gmail.com"
            value={server}
            onChange={(e) => setServer(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Port</label>
          <Select onValueChange={setPort}>
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
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To Email</label>
          <Input
            type="email"
            placeholder="to@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input
            placeholder="SMTP username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            placeholder="SMTP password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
  );
};