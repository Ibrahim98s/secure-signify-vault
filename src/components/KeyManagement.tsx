import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Key, Copy, Check } from 'lucide-react';
import { DigitalSignatureSystem, KeyPair, KeySize } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

export const KeyManagement: React.FC = () => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [keySize, setKeySize] = useState<KeySize>(2048);
  const [isGenerating, setIsGenerating] = useState(false);
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [importedPublicKey, setImportedPublicKey] = useState('');
  const [importedPrivateKey, setImportedPrivateKey] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const generateKeyPair = async () => {
    setIsGenerating(true);
    try {
      const newKeyPair = await DigitalSignatureSystem.generateKeyPair(keySize);
      setKeyPair(newKeyPair);
      
      const publicPem = await DigitalSignatureSystem.exportPublicKey(newKeyPair.publicKey);
      const privatePem = await DigitalSignatureSystem.exportPrivateKey(newKeyPair.privateKey);
      
      setPublicKeyPem(publicPem);
      setPrivateKeyPem(privatePem);
      
      toast({
        title: "Key Pair Generated",
        description: `Successfully generated ${keySize}-bit RSA key pair`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate key pair: ${error}`,
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string, keyType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyType);
      setTimeout(() => setCopiedKey(null), 2000);
      toast({
        title: "Copied",
        description: `${keyType} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadKey = (key: string, filename: string) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importKeys = async () => {
    try {
      if (importedPublicKey) {
        const publicKey = await DigitalSignatureSystem.importPublicKey(importedPublicKey);
        
        let privateKey = null;
        if (importedPrivateKey) {
          privateKey = await DigitalSignatureSystem.importPrivateKey(importedPrivateKey);
        }
        
        if (privateKey) {
          setKeyPair({ publicKey, privateKey });
        }
        
        setPublicKeyPem(importedPublicKey);
        if (importedPrivateKey) {
          setPrivateKeyPem(importedPrivateKey);
        }
        
        toast({
          title: "Keys Imported",
          description: "Successfully imported RSA keys",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to import keys: ${error}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            RSA Key Pair Generation
          </CardTitle>
          <CardDescription>
            Generate cryptographically secure RSA key pairs for digital signatures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="keySize">Key Size (bits)</Label>
              <Select value={keySize.toString()} onValueChange={(value) => setKeySize(parseInt(value) as KeySize)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2048">2048</SelectItem>
                  <SelectItem value="3072">3072</SelectItem>
                  <SelectItem value="4096">4096</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Button 
              onClick={generateKeyPair} 
              disabled={isGenerating}
              className="min-w-32"
            >
              {isGenerating ? 'Generating...' : 'Generate Keys'}
            </Button>
          </div>
          
          {keyPair && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Key pair generated successfully! Keys are ready for use in digital signatures.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Public Key Export */}
      {publicKeyPem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Public Key (PEM Format)</span>
              <div className="flex gap-2">
                <Badge variant="secondary">{keySize} bits</Badge>
                <Badge variant="outline">RSA-PSS</Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Share this public key for signature verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={publicKeyPem}
              readOnly
              className="font-mono text-xs h-32 resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(publicKeyPem, 'Public Key')}
              >
                {copiedKey === 'Public Key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadKey(publicKeyPem, 'public_key.pem')}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Private Key Export */}
      {privateKeyPem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Private Key (PEM Format)</span>
              <Badge variant="destructive">⚠️ Keep Secure</Badge>
            </CardTitle>
            <CardDescription>
              Keep this private key secure and never share it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={privateKeyPem}
              readOnly
              className="font-mono text-xs h-32 resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(privateKeyPem, 'Private Key')}
              >
                {copiedKey === 'Private Key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadKey(privateKeyPem, 'private_key.pem')}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Existing Keys
          </CardTitle>
          <CardDescription>
            Import previously generated RSA keys in PEM format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importPublicKey">Public Key (PEM)</Label>
            <Textarea
              id="importPublicKey"
              placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
              value={importedPublicKey}
              onChange={(e) => setImportedPublicKey(e.target.value)}
              className="font-mono text-xs h-24 resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="importPrivateKey">Private Key (PEM) - Optional</Label>
            <Textarea
              id="importPrivateKey"
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              value={importedPrivateKey}
              onChange={(e) => setImportedPrivateKey(e.target.value)}
              className="font-mono text-xs h-24 resize-none"
            />
          </div>
          
          <Button 
            onClick={importKeys}
            disabled={!importedPublicKey.trim()}
          >
            Import Keys
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};