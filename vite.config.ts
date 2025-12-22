
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Initialize env vars with local .env values as fallback
    const envVars: Record<string, string> = {
        API_KEY: env.GEMINI_API_KEY || env.API_KEY || '',
        FIREBASE_API_KEY: env.FIREBASE_API_KEY || '',
        FIREBASE_AUTH_DOMAIN: env.FIREBASE_AUTH_DOMAIN || '',
        FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID || '',
        FIREBASE_STORAGE_BUCKET: env.FIREBASE_STORAGE_BUCKET || '',
        FIREBASE_MESSAGING_SENDER_ID: env.FIREBASE_MESSAGING_SENDER_ID || '',
        FIREBASE_APP_ID: env.FIREBASE_APP_ID || '',
        FIREBASE_MEASUREMENT_ID: env.FIREBASE_MEASUREMENT_ID || ''
    };

    // Secret Management Integration
    try {
        // Auto-detect gcp-key.json for local dev if env var is missing
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            const localKeyPath = path.resolve('gcp-key.json');
            if (fs.existsSync(localKeyPath)) {
                process.env.GOOGLE_APPLICATION_CREDENTIALS = localKeyPath;
            }
        }

        // Dynamically import to avoid build failures if dependencies or creds are missing locally
        const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager');
        
        const client = new SecretManagerServiceClient();
        const projectId = await client.getProjectId();
        
        if (projectId) {
            // Map of Secret Name -> Internal Env Var Key
            const secretMappings: Record<string, string> = {
                'GEMINI_API_KEY': 'API_KEY',
                'FIREBASE_API_KEY': 'FIREBASE_API_KEY',
                'FIREBASE_AUTH_DOMAIN': 'FIREBASE_AUTH_DOMAIN',
                'FIREBASE_PROJECT_ID': 'FIREBASE_PROJECT_ID',
                'FIREBASE_STORAGE_BUCKET': 'FIREBASE_STORAGE_BUCKET',
                'FIREBASE_MESSAGING_SENDER_ID': 'FIREBASE_MESSAGING_SENDER_ID',
                'FIREBASE_APP_ID': 'FIREBASE_APP_ID',
                'FIREBASE_MEASUREMENT_ID': 'FIREBASE_MEASUREMENT_ID'
            };

            await Promise.all(Object.entries(secretMappings).map(async ([secretName, envKey]) => {
                try {
                    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
                    const [version] = await client.accessSecretVersion({ name });
                    const payload = version.payload?.data?.toString();
                    
                    if (payload) {
                        envVars[envKey] = payload.trim(); // Trim whitespace/newlines
                    }
                } catch (e) {
                    // Secret might not exist or permissions issue; silent fallback to local env
                }
            }));
        }
    } catch (error) {
        // Non-critical error: Log warning and proceed (likely local environment without GCP creds)
        // console.warn('[Secret Manager] Skipped secret fetching.');
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Expose processed variables to the client
        'process.env.API_KEY': JSON.stringify(envVars.API_KEY),
        // Legacy support
        'process.env.GEMINI_API_KEY': JSON.stringify(envVars.API_KEY),
        
        // Firebase Configuration
        'process.env.FIREBASE_API_KEY': JSON.stringify(envVars.FIREBASE_API_KEY),
        'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(envVars.FIREBASE_AUTH_DOMAIN),
        'process.env.FIREBASE_PROJECT_ID': JSON.stringify(envVars.FIREBASE_PROJECT_ID),
        'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(envVars.FIREBASE_STORAGE_BUCKET),
        'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(envVars.FIREBASE_MESSAGING_SENDER_ID),
        'process.env.FIREBASE_APP_ID': JSON.stringify(envVars.FIREBASE_APP_ID),
        'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(envVars.FIREBASE_MEASUREMENT_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});
