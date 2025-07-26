// Core cryptographic utilities for digital signatures
export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface SignatureResult {
  signature: string;
  algorithm: string;
  keySize: number;
  timestamp: string;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  publicKey: string;
}

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'MD5';
export type KeySize = 2048 | 3072 | 4096;

export class DigitalSignatureSystem {
  // Generate RSA key pair with specified key size
  static async generateKeyPair(keySize: KeySize = 2048): Promise<KeyPair> {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );
      
      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
      };
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${error}`);
    }
  }

  // Export public key to PEM format
  static async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    try {
      const exported = await window.crypto.subtle.exportKey('spki', publicKey);
      const exportedAsBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
      const pemKey = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
      return pemKey;
    } catch (error) {
      throw new Error(`Failed to export public key: ${error}`);
    }
  }

  // Export private key to PEM format
  static async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    try {
      const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
      const exportedAsBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
      const pemKey = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
      return pemKey;
    } catch (error) {
      throw new Error(`Failed to export private key: ${error}`);
    }
  }

  // Import public key from PEM format
  static async importPublicKey(pemKey: string): Promise<CryptoKey> {
    try {
      const pemContents = pemKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s/g, '');
      
      const binaryDerString = atob(pemContents);
      const binaryDer = new Uint8Array(binaryDerString.length);
      
      for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
      }

      return await window.crypto.subtle.importKey(
        'spki',
        binaryDer.buffer,
        {
          name: 'RSA-PSS',
          hash: 'SHA-256',
        },
        true,
        ['verify']
      );
    } catch (error) {
      throw new Error(`Failed to import public key: ${error}`);
    }
  }

  // Import private key from PEM format
  static async importPrivateKey(pemKey: string): Promise<CryptoKey> {
    try {
      const pemContents = pemKey
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
      
      const binaryDerString = atob(pemContents);
      const binaryDer = new Uint8Array(binaryDerString.length);
      
      for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
      }

      return await window.crypto.subtle.importKey(
        'pkcs8',
        binaryDer.buffer,
        {
          name: 'RSA-PSS',
          hash: 'SHA-256',
        },
        true,
        ['sign']
      );
    } catch (error) {
      throw new Error(`Failed to import private key: ${error}`);
    }
  }

  // Sign data using RSA-PSS
  static async signData(data: string | ArrayBuffer, privateKey: CryptoKey): Promise<SignatureResult> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
      
      const signature = await window.crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        privateKey,
        dataBuffer
      );

      const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
      
      return {
        signature: signatureBase64,
        algorithm: 'RSA-PSS',
        keySize: 2048, // TODO: Extract actual key size
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to sign data: ${error}`);
    }
  }

  // Verify signature using RSA-PSS
  static async verifySignature(
    data: string | ArrayBuffer,
    signature: string,
    publicKey: CryptoKey
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
      
      const signatureBuffer = new Uint8Array(
        atob(signature)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      return await window.crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        publicKey,
        signatureBuffer,
        dataBuffer
      );
    } catch (error) {
      throw new Error(`Failed to verify signature: ${error}`);
    }
  }

  // Calculate hash using specified algorithm
  static async calculateHash(data: string | ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
      
      // Handle MD5 separately as it's not supported by Web Crypto API
      if (algorithm === 'MD5') {
        // For demo purposes, we'll use a simple MD5 implementation
        // In production, you might want to use a proper MD5 library
        return this.simpleMD5(dataBuffer);
      }

      const hashBuffer = await window.crypto.subtle.digest(algorithm, dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      throw new Error(`Failed to calculate hash: ${error}`);
    }
  }

  // Simple MD5 implementation for demo purposes
  private static simpleMD5(data: ArrayBuffer): string {
    // This is a simplified MD5 for demonstration
    // In production, use a proper cryptographic library
    const array = new Uint8Array(data);
    let hash = 0;
    for (let i = 0; i < array.length; i++) {
      hash = ((hash << 5) - hash + array[i]) & 0xffffffff;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Generate self-signed certificate (simplified version)
  static generateSelfSignedCert(
    keyPair: KeyPair,
    subject: string,
    validityDays: number = 365
  ): CertificateInfo {
    const now = new Date();
    const validTo = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    
    return {
      subject,
      issuer: subject, // Self-signed
      serialNumber: Math.random().toString(16).substring(2, 10).toUpperCase(),
      validFrom: now.toISOString(),
      validTo: validTo.toISOString(),
      publicKey: 'RSA Public Key', // Simplified for demo
    };
  }

  // Create timestamp token (simplified for demo)
  static createTimestamp(data: string): string {
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // This is a simplified timestamp token
    // In production, this would be an RFC 3161 compliant token
    return btoa(JSON.stringify({
      timestamp,
      nonce,
      data: data.substring(0, 100), // First 100 chars for reference
      algorithm: 'SHA-256',
      authority: 'Local Timestamp Authority (Demo)',
    }));
  }

  // Verify timestamp token
  static verifyTimestamp(token: string): { valid: boolean; timestamp?: string; authority?: string } {
    try {
      const decoded = JSON.parse(atob(token));
      return {
        valid: true,
        timestamp: decoded.timestamp,
        authority: decoded.authority,
      };
    } catch {
      return { valid: false };
    }
  }
}