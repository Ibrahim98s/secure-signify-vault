import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, PenTool, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { DigitalSignatureSystem, SignatureResult } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

export const SignatureOperations: React.FC = () => {
  const [documentText, setDocumentText] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [signatureResult, setSignatureResult] = useState<SignatureResult | null>(null);
  const [verificationSignature, setVerificationSignature] = useState('');
  const [verificationDocument, setVerificationDocument] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const signDocument = async () => {
    if (!documentText.trim() || !privateKeyPem.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both document text and private key",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const privateKey = await DigitalSignatureSystem.importPrivateKey(privateKeyPem);
      const result = await DigitalSignatureSystem.signData(documentText, privateKey);
      setSignatureResult(result);
      
      toast({
        title: "Document Signed",
        description: "Digital signature created successfully",
      });
    } catch (error) {
      toast({
        title: "Signature Failed",
        description: `Failed to sign document: ${error}`,
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const verifySignature = async () => {
    if (!verificationDocument.trim() || !verificationSignature.trim() || !publicKeyPem.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide document, signature, and public key",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const publicKey = await DigitalSignatureSystem.importPublicKey(publicKeyPem);
      const isValid = await DigitalSignatureSystem.verifySignature(
        verificationDocument,
        verificationSignature,
        publicKey
      );
      setVerificationResult(isValid);
      
      toast({
        title: isValid ? "Signature Valid" : "Signature Invalid",
        description: isValid 
          ? "The signature is valid and the document is authentic" 
          : "The signature is invalid or the document has been modified",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: `Failed to verify signature: ${error}`,
        variant: "destructive",
      });
      setVerificationResult(false);
    }
    setIsProcessing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDocumentText(content);
      };
      reader.readAsText(file);
    }
  };

  const clearSignature = () => {
    setSignatureResult(null);
    setVerificationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Document Signing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Create Digital Signature
          </CardTitle>
          <CardDescription>
            Sign documents using your RSA private key with PSS padding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document">Document to Sign</Label>
            <div className="flex gap-2 mb-2">
              <input
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              {uploadedFile && (
                <Badge variant="secondary">{uploadedFile.name}</Badge>
              )}
            </div>
            <Textarea
              id="document"
              placeholder="Enter the document text to be signed..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="h-32 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey">Private Key (PEM Format)</Label>
            <Textarea
              id="privateKey"
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              value={privateKeyPem}
              onChange={(e) => setPrivateKeyPem(e.target.value)}
              className="font-mono text-xs h-24 resize-none"
            />
          </div>

          <Button 
            onClick={signDocument}
            disabled={isProcessing || !documentText.trim() || !privateKeyPem.trim()}
            className="w-full"
          >
            {isProcessing ? 'Signing...' : 'Create Digital Signature'}
          </Button>

          {signatureResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Document signed successfully!</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Algorithm:</strong> {signatureResult.algorithm}
                    </div>
                    <div>
                      <strong>Key Size:</strong> {signatureResult.keySize} bits
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {new Date(signatureResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label>Digital Signature:</Label>
                    <Textarea
                      value={signatureResult.signature}
                      readOnly
                      className="font-mono text-xs h-20 resize-none mt-1"
                    />
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Signature Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Verify Digital Signature
          </CardTitle>
          <CardDescription>
            Verify the authenticity and integrity of signed documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verifyDocument">Original Document</Label>
            <Textarea
              id="verifyDocument"
              placeholder="Enter the original document text..."
              value={verificationDocument}
              onChange={(e) => setVerificationDocument(e.target.value)}
              className="h-32 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Digital Signature</Label>
            <Textarea
              id="signature"
              placeholder="Enter the digital signature to verify..."
              value={verificationSignature}
              onChange={(e) => setVerificationSignature(e.target.value)}
              className="font-mono text-xs h-20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicKeyVerify">Public Key (PEM Format)</Label>
            <Textarea
              id="publicKeyVerify"
              placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
              value={publicKeyPem}
              onChange={(e) => setPublicKeyPem(e.target.value)}
              className="font-mono text-xs h-24 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={verifySignature}
              disabled={isProcessing || !verificationDocument.trim() || !verificationSignature.trim() || !publicKeyPem.trim()}
              className="flex-1"
            >
              {isProcessing ? 'Verifying...' : 'Verify Signature'}
            </Button>
            <Button 
              variant="outline"
              onClick={clearSignature}
            >
              Clear
            </Button>
          </div>

          {verificationResult !== null && (
            <Alert variant={verificationResult ? "default" : "destructive"}>
              {verificationResult ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {verificationResult 
                      ? "✅ Signature is VALID - Document is authentic and unmodified"
                      : "❌ Signature is INVALID - Document may be modified or signature is incorrect"
                    }
                  </span>
                  <Badge variant={verificationResult ? "default" : "destructive"}>
                    {verificationResult ? "VERIFIED" : "FAILED"}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {signatureResult && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVerificationDocument(documentText);
                  setVerificationSignature(signatureResult.signature);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Test This Signature
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};