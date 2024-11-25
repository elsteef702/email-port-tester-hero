import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PortResult {
  port: number;
  status: "success" | "error" | "testing";
}

export const PortTester = () => {
  const [server, setServer] = useState("");
  const [customPort, setCustomPort] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const { toast } = useToast();

  const commonPorts = [25, 465, 587];

  const testPort = async (port: number) => {
    // In a real application, this would make an actual connection test
    // For demo purposes, we'll simulate the test with a timeout
    setResults(prev => [...prev, { port, status: "testing" }]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random success/failure
    const success = Math.random() > 0.5;
    
    setResults(prev => 
      prev.map(result => 
        result.port === port 
          ? { ...result, status: success ? "success" : "error" }
          : result
      )
    );

    toast({
      title: success ? "Port is open" : "Port is closed",
      description: `Port ${port} ${success ? "is" : "is not"} accessible`,
      variant: success ? "default" : "destructive",
    });
  };

  const handleTest = async () => {
    if (!server) {
      toast({
        title: "Server required",
        description: "Please enter a server address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);

    // Test common ports
    for (const port of commonPorts) {
      await testPort(port);
    }

    // Test custom port if provided
    if (customPort) {
      await testPort(parseInt(customPort));
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Server Address</label>
          <Input
            placeholder="Enter server address (e.g., smtp.gmail.com)"
            value={server}
            onChange={(e) => setServer(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Port (Optional)</label>
          <Input
            type="number"
            placeholder="Enter custom port number"
            value={customPort}
            onChange={(e) => setCustomPort(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleTest}
          disabled={isLoading || !server}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Ports
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Results:</h3>
          <div className="space-y-2">
            {results.map(({ port, status }) => (
              <div
                key={port}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>Port {port}</span>
                {status === "testing" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};