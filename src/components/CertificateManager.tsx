import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Award, Plus, FileCheck, Info } from 'lucide-react';
import { DigitalSignatureSystem, CertificateInfo, KeyPair } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

export const CertificateManager: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [newCertSubject, setNewCertSubject] = useState('');
  const [validityDays, setValidityDays] = useState(365);
  const [selectedCert, setSelectedCert] = useState<CertificateInfo | null>(null);
  const [importCertPem, setImportCertPem] = useState('');
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCertificate = async () => {
    if (!newCertSubject.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide certificate subject information",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate new key pair for certificate
      const newKeyPair = await DigitalSignatureSystem.generateKeyPair(2048);
      setKeyPair(newKeyPair);
      
      // Generate self-signed certificate
      const cert = DigitalSignatureSystem.generateSelfSignedCert(
        newKeyPair,
        newCertSubject,
        validityDays
      );
      
      setCertificates(prev => [...prev, cert]);
      setSelectedCert(cert);
      
      toast({
        title: "Certificate Generated",
        description: "Self-signed certificate created successfully",
      });
      
      // Clear form
      setNewCertSubject('');
      setValidityDays(365);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate certificate: ${error}`,
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const importCertificate = () => {
    if (!importCertPem.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide certificate in PEM format",
        variant: "destructive",
      });
      return;
    }

    try {
      // This is a simplified certificate import for demonstration
      // In a real implementation, you would parse the actual X.509 certificate
      const cert: CertificateInfo = {
        subject: 'Imported Certificate',
        issuer: 'External CA',
        serialNumber: Math.random().toString(16).substring(2, 10).toUpperCase(),
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        publicKey: 'RSA Public Key (Imported)',
      };
      
      setCertificates(prev => [...prev, cert]);
      setSelectedCert(cert);
      setImportCertPem('');
      
      toast({
        title: "Certificate Imported",
        description: "Certificate imported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to import certificate: ${error}`,
        variant: "destructive",
      });
    }
  };

  const deleteCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
    if (selectedCert === certificates[index]) {
      setSelectedCert(null);
    }
    toast({
      title: "Certificate Deleted",
      description: "Certificate removed from store",
    });
  };

  const exportCertificate = (cert: CertificateInfo) => {
    // Generate a simplified PEM-like format for demonstration
    const certPem = `-----BEGIN CERTIFICATE-----
${btoa(JSON.stringify(cert)).match(/.{1,64}/g)?.join('\n')}
-----END CERTIFICATE-----`;
    
    const blob = new Blob([certPem], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${cert.serialNumber}.crt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isExpired = (validTo: string): boolean => {
    return new Date(validTo) < new Date();
  };

  const isExpiringSoon = (validTo: string): boolean => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(validTo) < thirtyDaysFromNow && !isExpired(validTo);
  };

  return (
    <div className="space-y-6">
      {/* Certificate Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate Self-Signed Certificate
          </CardTitle>
          <CardDescription>
            Create X.509 self-signed certificates for testing and development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Certificate Subject</Label>
              <Input
                id="subject"
                placeholder="CN=example.com,O=Organization,C=US"
                value={newCertSubject}
                onChange={(e) => setNewCertSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity">Validity Period (Days)</Label>
              <Input
                id="validity"
                type="number"
                min="1"
                max="3650"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 365)}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateCertificate}
            disabled={isGenerating || !newCertSubject.trim()}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Certificate'}
          </Button>
        </CardContent>
      </Card>

      {/* Certificate Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Import Certificate
          </CardTitle>
          <CardDescription>
            Import existing X.509 certificates in PEM format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importCert">Certificate (PEM Format)</Label>
            <Textarea
              id="importCert"
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              value={importCertPem}
              onChange={(e) => setImportCertPem(e.target.value)}
              className="font-mono text-xs h-24 resize-none"
            />
          </div>
          
          <Button 
            onClick={importCertificate}
            disabled={!importCertPem.trim()}
            className="w-full"
          >
            Import Certificate
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Certificate Store */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Store
          </CardTitle>
          <CardDescription>
            Manage your X.509 certificates and view their properties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificates.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No certificates in store. Generate or import a certificate to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cert.subject}</CardTitle>
                      <div className="flex gap-2">
                        {isExpired(cert.validTo) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {isExpiringSoon(cert.validTo) && !isExpired(cert.validTo) && (
                          <Badge variant="outline">Expiring Soon</Badge>
                        )}
                        {!isExpired(cert.validTo) && !isExpiringSoon(cert.validTo) && (
                          <Badge variant="default">Valid</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Serial Number:</strong> {cert.serialNumber}
                      </div>
                      <div>
                        <strong>Issuer:</strong> {cert.issuer}
                      </div>
                      <div>
                        <strong>Valid From:</strong> {new Date(cert.validFrom).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Valid To:</strong> {new Date(cert.validTo).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCert(cert)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportCertificate(cert)}
                      >
                        Export
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCertificate(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Details */}
      {selectedCert && (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>
              Detailed information about the selected certificate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm text-muted-foreground">{selectedCert.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Issuer</Label>
                  <p className="text-sm text-muted-foreground">{selectedCert.issuer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Serial Number</Label>
                  <p className="text-sm text-muted-foreground">{selectedCert.serialNumber}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Valid From</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCert.validFrom).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valid To</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCert.validTo).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Public Key</Label>
                  <p className="text-sm text-muted-foreground">{selectedCert.publicKey}</p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setSelectedCert(null)}
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};