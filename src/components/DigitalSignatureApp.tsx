import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, FileText, Award, Clock, Hash, Menu, X, Zap, Lock, CheckCircle2, Globe, Info } from 'lucide-react';
import { KeyManagement } from './KeyManagement';
import { SignatureOperations } from './SignatureOperations';
import { CertificateManager } from './CertificateManager';
import { TimestampService } from './TimestampService';
import { HashCalculator } from './HashCalculator';

const tabsData = [
  { id: 'keys', label: 'Key Management', icon: Shield, description: 'Generate and manage RSA key pairs' },
  { id: 'signatures', label: 'Signatures', icon: FileText, description: 'Create and verify digital signatures' },
  { id: 'certificates', label: 'Certificates', icon: Award, description: 'Manage X.509 certificates' },
  { id: 'timestamps', label: 'Timestamps', icon: Clock, description: 'RFC 3161 timestamp tokens' },
  { id: 'hashing', label: 'Hashing', icon: Hash, description: 'Calculate cryptographic hashes' },
];

export const DigitalSignatureApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('keys');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTab = tabsData.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Enhanced Header with Navigation */}
      <header className={`sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 transition-all duration-300 ${mounted ? 'animate-fade-in' : ''}`}>
        <div className="container mx-auto px-4">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <Shield className="h-10 w-10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-accent" />
                <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-150 transition-transform duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  CryptoSign
                </h1>
                <p className="text-sm text-muted-foreground">Enterprise Security Suite</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Web Crypto API Active</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Secure Session</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className={`transition-all duration-300 ${isMenuOpen || window.innerWidth >= 768 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100'} overflow-hidden`}>
            <div className="pb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Desktop Tab List */}
                <TabsList className="hidden md:grid w-full grid-cols-5 h-auto p-1 bg-muted/50 backdrop-blur-sm">
                  {tabsData.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={`
                          flex flex-col items-center gap-2 p-4 text-center transition-all duration-300 
                          hover:scale-105 hover:bg-background/80 data-[state=active]:bg-background 
                          data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20
                          ${isActive ? 'animate-scale-in' : ''}
                        `}
                      >
                        <Icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {tab.description}
                          </div>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Mobile Tab List */}
                <div className="md:hidden space-y-2">
                  {tabsData.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <Button
                        key={tab.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 h-auto p-4 transition-all duration-300 ${isActive ? 'animate-scale-in' : ''}`}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-sm text-muted-foreground">{tab.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </Tabs>
            </div>
          </div>

          {/* Current Tab Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 pb-4 border-b border-border/30">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cryptographic Operations</span>
            <span className="text-muted-foreground">/</span>
            {currentTab && (
              <>
                <currentTab.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{currentTab.label}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className={`text-center mb-12 ${mounted ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Enterprise Digital Signature Platform
            </h2>
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Advanced cryptographic solution for document authentication, integrity verification, and digital trust management
            </p>
            
            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: Zap, label: "RSA-PSS Signatures", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
                { icon: Award, label: "X.509 Certificates", color: "bg-green-500/10 text-green-600 border-green-200" },
                { icon: Clock, label: "RFC 3161 Timestamps", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
                { icon: CheckCircle2, label: "Multi-Hash Support", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Badge
                    key={feature.label}
                    variant="outline"
                    className={`
                      ${feature.color} px-4 py-2 text-sm font-medium border transition-all duration-300 
                      hover:scale-105 hover:shadow-md cursor-default
                      ${mounted ? 'animate-fade-in' : ''}
                    `}
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {feature.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className={`max-w-7xl mx-auto shadow-2xl border-0 bg-card/50 backdrop-blur-sm ${mounted ? 'animate-scale-in' : ''}`} style={{ animationDelay: '0.6s' }}>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                {currentTab && (
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <currentTab.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{currentTab.label}</CardTitle>
                      <CardDescription className="text-base">{currentTab.description}</CardDescription>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Ready</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="keys" className={`mt-0 transition-all duration-500 ${activeTab === 'keys' ? 'animate-fade-in' : ''}`}>
                <KeyManagement />
              </TabsContent>

              <TabsContent value="signatures" className={`mt-0 transition-all duration-500 ${activeTab === 'signatures' ? 'animate-fade-in' : ''}`}>
                <SignatureOperations />
              </TabsContent>

              <TabsContent value="certificates" className={`mt-0 transition-all duration-500 ${activeTab === 'certificates' ? 'animate-fade-in' : ''}`}>
                <CertificateManager />
              </TabsContent>

              <TabsContent value="timestamps" className={`mt-0 transition-all duration-500 ${activeTab === 'timestamps' ? 'animate-fade-in' : ''}`}>
                <TimestampService />
              </TabsContent>

              <TabsContent value="hashing" className={`mt-0 transition-all duration-500 ${activeTab === 'hashing' ? 'animate-fade-in' : ''}`}>
                <HashCalculator />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <footer className={`text-center mt-16 ${mounted ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.8s' }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-6 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Web Crypto API</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Industry Standards</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Enterprise Security</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Security Notice</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This is a demonstration system showcasing cryptographic capabilities. 
                For production deployment, ensure compliance with your security requirements and regulatory standards.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};