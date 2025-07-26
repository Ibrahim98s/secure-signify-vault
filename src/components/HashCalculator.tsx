import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Hash, Upload, Copy, Check, AlertTriangle, Info } from 'lucide-react';
import { DigitalSignatureSystem, HashAlgorithm } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
  inputSize: number;
  timestamp: string;
}

export const HashCalculator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [hashResults, setHashResults] = useState<HashResult[]>([]);
  const [compareHash1, setCompareHash1] = useState('');
  const [compareHash2, setCompareHash2] = useState('');
  const [comparisonResult, setComparisonResult] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const { toast } = useToast();

  const algorithmInfo = {
    'SHA-1': { 
      strength: 'Weak', 
      variant: 'destructive' as const,
      description: 'Legacy algorithm, vulnerable to collision attacks'
    },
    'SHA-256': { 
      strength: 'Strong', 
      variant: 'default' as const,
      description: 'Industry standard, recommended for most applications'
    },
    'SHA-384': { 
      strength: 'Very Strong', 
      variant: 'default' as const,
      description: 'Enhanced security for sensitive applications'
    },
    'SHA-512': { 
      strength: 'Very Strong', 
      variant: 'default' as const,
      description: 'Maximum security, highest resistance to attacks'
    },
    'MD5': { 
      strength: 'Broken', 
      variant: 'destructive' as const,
      description: 'Deprecated, only for legacy compatibility'
    },
  };

  const calculateHash = async (algorithm?: HashAlgorithm) => {
    if (!inputText.trim()) {
      toast({
        title: "Missing Input",
        description: "Please provide text or upload a file to hash",
        variant: "destructive",
      });
      return;
    }

    const alg = algorithm || selectedAlgorithm;
    setIsProcessing(true);
    
    try {
      const hash = await DigitalSignatureSystem.calculateHash(inputText, alg);
      const result: HashResult = {
        algorithm: alg,
        hash,
        inputSize: new TextEncoder().encode(inputText).length,
        timestamp: new Date().toISOString(),
      };
      
      setHashResults(prev => [result, ...prev.filter(r => r.algorithm !== alg)]);
      
      toast({
        title: "Hash Calculated",
        description: `${alg} hash generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: `Failed to calculate ${alg} hash: ${error}`,
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const calculateAllHashes = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Missing Input",
        description: "Please provide text or upload a file to hash",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'MD5'];
    const results: HashResult[] = [];
    
    try {
      for (const algorithm of algorithms) {
        const hash = await DigitalSignatureSystem.calculateHash(inputText, algorithm);
        results.push({
          algorithm,
          hash,
          inputSize: new TextEncoder().encode(inputText).length,
          timestamp: new Date().toISOString(),
        });
      }
      
      setHashResults(results);
      
      toast({
        title: "All Hashes Calculated",
        description: "Generated hashes for all supported algorithms",
      });
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: `Failed to calculate hashes: ${error}`,
        variant: "destructive",
      });
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
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
      toast({
        title: "Copied",
        description: "Hash copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy hash",
        variant: "destructive",
      });
    }
  };

  const compareHashes = () => {
    if (!compareHash1.trim() || !compareHash2.trim()) {
      toast({
        title: "Missing Hashes",
        description: "Please provide both hashes to compare",
        variant: "destructive",
      });
      return;
    }

    const normalizedHash1 = compareHash1.trim().toLowerCase();
    const normalizedHash2 = compareHash2.trim().toLowerCase();
    const result = normalizedHash1 === normalizedHash2;
    
    setComparisonResult(result);
    
    toast({
      title: result ? "Hashes Match" : "Hashes Don't Match",
      description: result 
        ? "The hashes are identical - data integrity verified"
        : "The hashes are different - data may have been modified",
      variant: result ? "default" : "destructive",
    });
  };

  const clearResults = () => {
    setHashResults([]);
    setInputText('');
    setUploadedFile(null);
    setComparisonResult(null);
    setCompareHash1('');
    setCompareHash2('');
  };

  return (
    <div className="space-y-6">
      {/* Hash Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hash Calculator
          </CardTitle>
          <CardDescription>
            Generate cryptographic hashes using various algorithms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hashInput">Text or Data to Hash</Label>
            <div className="flex gap-2 mb-2">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-hash"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload-hash')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              {uploadedFile && (
                <Badge variant="secondary">{uploadedFile.name}</Badge>
              )}
            </div>
            <Textarea
              id="hashInput"
              placeholder="Enter text or upload a file to calculate its hash..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-32 resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="algorithm">Hash Algorithm</Label>
              <Select value={selectedAlgorithm} onValueChange={(value) => setSelectedAlgorithm(value as HashAlgorithm)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA-256">SHA-256</SelectItem>
                  <SelectItem value="SHA-384">SHA-384</SelectItem>
                  <SelectItem value="SHA-512">SHA-512</SelectItem>
                  <SelectItem value="SHA-1">SHA-1</SelectItem>
                  <SelectItem value="MD5">MD5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button 
                onClick={() => calculateHash()}
                disabled={isProcessing || !inputText.trim()}
              >
                {isProcessing ? 'Calculating...' : `Calculate ${selectedAlgorithm}`}
              </Button>
              <Button 
                variant="outline"
                onClick={calculateAllHashes}
                disabled={isProcessing || !inputText.trim()}
              >
                Calculate All
              </Button>
            </div>
          </div>

          {/* Algorithm Info */}
          <Alert variant={algorithmInfo[selectedAlgorithm].variant}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{algorithmInfo[selectedAlgorithm].description}</span>
                <Badge variant={algorithmInfo[selectedAlgorithm].variant}>
                  {algorithmInfo[selectedAlgorithm].strength}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Hash Results */}
      {hashResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Hash Results</span>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear All
              </Button>
            </CardTitle>
            <CardDescription>
              Generated cryptographic hashes for your input data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hashResults.map((result, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={algorithmInfo[result.algorithm].variant}>
                        {result.algorithm}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.inputSize} bytes
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hash Value</Label>
                    <div className="flex gap-2">
                      <Textarea
                        value={result.hash}
                        readOnly
                        className="font-mono text-xs h-16 resize-none flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyHash(result.hash)}
                      >
                        {copiedHash === result.hash ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Hash Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hash Comparison
          </CardTitle>
          <CardDescription>
            Compare two hashes to verify data integrity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hash1">First Hash</Label>
              <Textarea
                id="hash1"
                placeholder="Enter first hash..."
                value={compareHash1}
                onChange={(e) => setCompareHash1(e.target.value)}
                className="font-mono text-xs h-20 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hash2">Second Hash</Label>
              <Textarea
                id="hash2"
                placeholder="Enter second hash..."
                value={compareHash2}
                onChange={(e) => setCompareHash2(e.target.value)}
                className="font-mono text-xs h-20 resize-none"
              />
            </div>
          </div>

          <Button 
            onClick={compareHashes}
            disabled={!compareHash1.trim() || !compareHash2.trim()}
            className="w-full"
          >
            Compare Hashes
          </Button>

          {comparisonResult !== null && (
            <Alert variant={comparisonResult ? "default" : "destructive"}>
              {comparisonResult ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    {comparisonResult 
                      ? "✅ Hashes match - Data integrity verified"
                      : "❌ Hashes don't match - Data may have been modified"
                    }
                  </span>
                  <Badge variant={comparisonResult ? "default" : "destructive"}>
                    {comparisonResult ? "MATCH" : "NO MATCH"}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Hash Information */}
      <Card>
        <CardHeader>
          <CardTitle>Hash Algorithm Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(algorithmInfo).map(([algorithm, info]) => (
              <Card key={algorithm} className="border-l-4 border-l-muted">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{algorithm}</h4>
                    <Badge variant={info.variant}>{info.strength}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};