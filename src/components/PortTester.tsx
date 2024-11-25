import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

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
    setResults(prev => [...prev, { port, status: "testing" }]);
    
    try {
      console.log(`Testing port ${port} for server ${server}`);
      const response = await fetch('/.netlify/functions/test-port', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ host: server, port }),
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      let success = false;
      
      try {
        const data = JSON.parse(text);
        success = data.success;
      } catch (e) {
        // If we can't parse JSON, check if we got any response at all
        success = text.length > 0;
      }
      
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
    } catch (error) {
      console.error(`Error testing port ${port}:`, error);
      setResults(prev => 
        prev.map(result => 
          result.port === port 
            ? { ...result, status: "error" }
            : result
        )
      );

      toast({
        title: "Error testing port",
        description: error instanceof Error ? error.message : "Failed to test port connectivity",
        variant: "destructive",
      });
    }
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

    for (const port of commonPorts) {
      await testPort(port);
    }

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