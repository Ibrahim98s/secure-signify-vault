import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Plus, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { DigitalSignatureSystem } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

interface TimestampRecord {
  id: string;
  data: string;
  token: string;
  timestamp: string;
  authority: string;
  isValid: boolean;
}

export const TimestampService: React.FC = () => {
  const [documentText, setDocumentText] = useState('');
  const [timestampToken, setTimestampToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [timestamps, setTimestamps] = useState<TimestampRecord[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    timestamp?: string;
    authority?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createTimestamp = async () => {
    if (!documentText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide document text to timestamp",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const token = DigitalSignatureSystem.createTimestamp(documentText);
      setTimestampToken(token);
      
      const record: TimestampRecord = {
        id: Math.random().toString(36).substring(2, 9),
        data: documentText.substring(0, 100) + (documentText.length > 100 ? '...' : ''),
        token,
        timestamp: new Date().toISOString(),
        authority: 'Local Timestamp Authority (Demo)',
        isValid: true,
      };
      
      setTimestamps(prev => [record, ...prev]);
      
      toast({
        title: "Timestamp Created",
        description: "RFC 3161 compliant timestamp token generated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create timestamp: ${error}`,
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const verifyTimestamp = async () => {
    if (!verifyToken.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide timestamp token to verify",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = DigitalSignatureSystem.verifyTimestamp(verifyToken);
      setVerificationResult(result);
      
      toast({
        title: result.valid ? "Valid Timestamp" : "Invalid Timestamp",
        description: result.valid 
          ? "Timestamp token is valid and authentic"
          : "Timestamp token is invalid or corrupted",
        variant: result.valid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: `Failed to verify timestamp: ${error}`,
        variant: "destructive",
      });
      setVerificationResult({ valid: false });
    }
    setIsProcessing(false);
  };

  const deleteTimestamp = (id: string) => {
    setTimestamps(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Timestamp Deleted",
      description: "Timestamp record removed",
    });
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Copied",
      description: "Timestamp token copied to clipboard",
    });
  };

  const downloadToken = (token: string, id: string) => {
    const blob = new Blob([token], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timestamp_${id}.tst`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearVerification = () => {
    setVerificationResult(null);
    setVerifyToken('');
  };

  return (
    <div className="space-y-6">
      {/* Timestamp Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Timestamp Token
          </CardTitle>
          <CardDescription>
            Generate RFC 3161 compliant timestamp tokens for non-repudiation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timestampDocument">Document or Data to Timestamp</Label>
            <Textarea
              id="timestampDocument"
              placeholder="Enter document text or data to be timestamped..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="h-32 resize-none"
            />
          </div>

          <Button 
            onClick={createTimestamp}
            disabled={isProcessing || !documentText.trim()}
            className="w-full"
          >
            {isProcessing ? 'Creating Timestamp...' : 'Create Timestamp Token'}
          </Button>

          {timestampToken && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Timestamp token created successfully!</p>
                  <div className="text-sm">
                    <strong>Created:</strong> {new Date().toLocaleString()}
                  </div>
                  <div className="mt-2">
                    <Label>Timestamp Token (RFC 3161):</Label>
                    <Textarea
                      value={timestampToken}
                      readOnly
                      className="font-mono text-xs h-20 resize-none mt-1"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToken(timestampToken)}
                    >
                      Copy Token
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadToken(timestampToken, 'new')}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Timestamp Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Verify Timestamp Token
          </CardTitle>
          <CardDescription>
            Verify the authenticity and integrity of timestamp tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verifyTimestamp">Timestamp Token</Label>
            <Textarea
              id="verifyTimestamp"
              placeholder="Enter timestamp token to verify..."
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              className="font-mono text-xs h-20 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={verifyTimestamp}
              disabled={isProcessing || !verifyToken.trim()}
              className="flex-1"
            >
              {isProcessing ? 'Verifying...' : 'Verify Timestamp'}
            </Button>
            <Button 
              variant="outline"
              onClick={clearVerification}
            >
              Clear
            </Button>
          </div>

          {verificationResult !== null && (
            <Alert variant={verificationResult.valid ? "default" : "destructive"}>
              {verificationResult.valid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>
                      {verificationResult.valid 
                        ? "✅ Timestamp is VALID and authentic"
                        : "❌ Timestamp is INVALID or corrupted"
                      }
                    </span>
                    <Badge variant={verificationResult.valid ? "default" : "destructive"}>
                      {verificationResult.valid ? "VERIFIED" : "FAILED"}
                    </Badge>
                  </div>
                  {verificationResult.valid && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
                      <div>
                        <strong>Timestamp:</strong> {verificationResult.timestamp ? new Date(verificationResult.timestamp).toLocaleString() : 'N/A'}
                      </div>
                      <div>
                        <strong>Authority:</strong> {verificationResult.authority || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Timestamp History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timestamp History
          </CardTitle>
          <CardDescription>
            View and manage your created timestamp tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {timestamps.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No timestamp tokens created yet. Create a timestamp to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {timestamps.map((record) => (
                <Card key={record.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Timestamp #{record.id}</CardTitle>
                      <Badge variant={record.isValid ? "default" : "destructive"}>
                        {record.isValid ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Data Preview</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          {record.data}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Created:</strong> {new Date(record.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <strong>Authority:</strong> {record.authority}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Timestamp Token</Label>
                      <Textarea
                        value={record.token}
                        readOnly
                        className="font-mono text-xs h-16 resize-none"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToken(record.token)}
                      >
                        Copy Token
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadToken(record.token, record.id)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVerifyToken(record.token);
                        }}
                      >
                        Verify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTimestamp(record.id)}
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

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Timestamp Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>RFC 3161 Timestamps:</strong> Provide cryptographic proof of when data existed
          </p>
          <p>
            <strong>Non-repudiation:</strong> Proves that data existed at a specific time
          </p>
          <p>
            <strong>Trusted Third Party:</strong> Timestamp authorities provide independent verification
          </p>
          <p className="text-xs">
            ⚠️ This demo uses local timestamps. For production, use certified Timestamp Authorities (TSA).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};