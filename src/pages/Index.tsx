import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortTester } from "@/components/PortTester";
import { EmailTester } from "@/components/EmailTester";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-600">Email Port Tester</h1>
          <p className="text-gray-600">Test email server ports and send test emails</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="port-test" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="port-test">Port Test</TabsTrigger>
              <TabsTrigger value="email-test">Email Test</TabsTrigger>
            </TabsList>
            
            <TabsContent value="port-test">
              <PortTester />
            </TabsContent>
            
            <TabsContent value="email-test">
              <EmailTester />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;