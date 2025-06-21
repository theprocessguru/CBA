import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

const EmailSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<EmailConfig>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    fromEmail: '',
    fromName: 'Croydon Business Association',
  });

  const [testEmail, setTestEmail] = useState('');

  const configureEmailMutation = useMutation({
    mutationFn: (emailConfig: EmailConfig) => {
      return apiRequest("POST", "/api/admin/email/configure", emailConfig);
    },
    onSuccess: () => {
      toast({
        title: "Email Configuration Updated",
        description: "Email service has been configured successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/status'] });
    },
    onError: (error) => {
      toast({
        title: "Configuration Failed",
        description: error instanceof Error ? error.message : "Failed to configure email service",
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: (email: string) => {
      return apiRequest("POST", "/api/admin/email/test", { email });
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Check your inbox for the test email.",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Email Failed",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const { data: emailStatus } = useQuery({
    queryKey: ['/api/admin/email/status'],
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    configureEmailMutation.mutate(config);
  };

  const handleTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (testEmail.trim()) {
      testEmailMutation.mutate(testEmail.trim());
    }
  };

  const handleInputChange = (field: keyof EmailConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Email Settings - Admin Dashboard</title>
        <meta name="description" content="Configure email service for password resets and notifications" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Email Settings</h1>
            <p className="text-neutral-600">Configure email service for password resets and notifications</p>
          </div>
        </div>

        {emailStatus && (
          <Alert className={emailStatus.configured ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            {emailStatus.configured ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={emailStatus.configured ? "text-green-800" : "text-yellow-800"}>
              {emailStatus.configured 
                ? "Email service is configured and ready to send emails"
                : "Email service is not configured. Password reset links will only be shown in console logs."
              }
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="configure" className="space-y-6">
          <TabsList>
            <TabsTrigger value="configure">Configure SMTP</TabsTrigger>
            <TabsTrigger value="test">Test Email</TabsTrigger>
            <TabsTrigger value="providers">Email Providers</TabsTrigger>
          </TabsList>

          <TabsContent value="configure">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
                <CardDescription>
                  Configure your SMTP server settings to enable email delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">SMTP Host</Label>
                      <Input
                        id="host"
                        placeholder="smtp.gmail.com"
                        value={config.host}
                        onChange={(e) => handleInputChange('host', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        placeholder="587"
                        value={config.port}
                        onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 587)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">Username/Email</Label>
                      <Input
                        id="user"
                        type="email"
                        placeholder="your-email@gmail.com"
                        value={config.user}
                        onChange={(e) => handleInputChange('user', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Your app password"
                        value={config.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="noreply@croydonba.org.uk"
                        value={config.fromEmail}
                        onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        placeholder="Croydon Business Association"
                        value={config.fromName}
                        onChange={(e) => handleInputChange('fromName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="secure"
                      checked={config.secure}
                      onChange={(e) => handleInputChange('secure', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="secure">Use SSL/TLS (port 465)</Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={configureEmailMutation.isPending}
                    className="w-full"
                  >
                    {configureEmailMutation.isPending ? "Configuring..." : "Save Configuration"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Test Email Delivery</CardTitle>
                <CardDescription>
                  Send a test email to verify your configuration is working
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTestEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testEmail">Test Email Address</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={testEmailMutation.isPending || !emailStatus?.configured}
                    className="w-full"
                  >
                    {testEmailMutation.isPending ? "Sending..." : "Send Test Email"}
                  </Button>
                  {!emailStatus?.configured && (
                    <p className="text-sm text-yellow-600">
                      Configure SMTP settings first before testing
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Email Provider Settings</CardTitle>
                  <CardDescription>
                    Common SMTP settings for popular email providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold">Gmail</h3>
                    <p className="text-sm text-neutral-600">
                      Host: smtp.gmail.com, Port: 587, Secure: No<br/>
                      Use App Password (not regular password)
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold">Outlook/Hotmail</h3>
                    <p className="text-sm text-neutral-600">
                      Host: smtp-mail.outlook.com, Port: 587, Secure: No
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold">Yahoo</h3>
                    <p className="text-sm text-neutral-600">
                      Host: smtp.mail.yahoo.com, Port: 587, Secure: No<br/>
                      Use App Password (not regular password)
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-semibold">Custom SMTP</h3>
                    <p className="text-sm text-neutral-600">
                      Contact your hosting provider for SMTP settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default EmailSettings;