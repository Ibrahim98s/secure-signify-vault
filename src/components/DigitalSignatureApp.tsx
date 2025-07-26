import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Award, Clock, Hash } from 'lucide-react';
import { KeyManagement } from './KeyManagement';
import { SignatureOperations } from './SignatureOperations';
import { CertificateManager } from './CertificateManager';
import { TimestampService } from './TimestampService';
import { HashCalculator } from './HashCalculator';

export const DigitalSignatureApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('keys');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              Digital Signature System
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive cryptographic solution for document authentication and integrity verification
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">RSA-PSS</Badge>
            <Badge variant="secondary">X.509 Certificates</Badge>
            <Badge variant="secondary">RFC 3161 Timestamps</Badge>
            <Badge variant="secondary">Multiple Hash Algorithms</Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-6xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
            <CardTitle className="text-2xl text-center">Cryptographic Operations</CardTitle>
            <CardDescription className="text-center">
              Secure digital signature creation, verification, and certificate management
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="keys" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Key Management
                </TabsTrigger>
                <TabsTrigger value="signatures" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Signatures
                </TabsTrigger>
                <TabsTrigger value="certificates" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certificates
                </TabsTrigger>
                <TabsTrigger value="timestamps" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timestamps
                </TabsTrigger>
                <TabsTrigger value="hashing" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="keys" className="mt-0">
                <KeyManagement />
              </TabsContent>

              <TabsContent value="signatures" className="mt-0">
                <SignatureOperations />
              </TabsContent>

              <TabsContent value="certificates" className="mt-0">
                <CertificateManager />
              </TabsContent>

              <TabsContent value="timestamps" className="mt-0">
                <TimestampService />
              </TabsContent>

              <TabsContent value="hashing" className="mt-0">
                <HashCalculator />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Built with Web Crypto API • Industry-standard cryptographic practices</p>
          <p className="mt-1">⚠️ This is a demonstration system. For production use, ensure compliance with your security requirements.</p>
        </div>
      </div>
    </div>
  );
};