// ClinIQ Configuration for IONOS Hosting
// This file contains environment variables for production
// IMPORTANT: Update these values with your actual API keys before deployment

window.APP_CONFIG = {
  // Speech Recognition APIs
  ASSEMBLYAI_API_KEY: '5100b0ac98e841cda654bf17e3ef8ca6',
  REVERIE_API_ID: 'dev.bibhutimailx',
  REVERIE_API_KEY: 'd269788c46c29e5b8c30d28486fdfc20288ba521',
  
  // Optional APIs (set to empty string if not using)
  GOOGLE_CLOUD_API_KEY: '',
  AZURE_SPEECH_KEY: '',
  AZURE_SPEECH_REGION: '',
  
  // Application Settings
  APP_NAME: 'ClinIQ',
  APP_ENVIRONMENT: 'production',
  APP_VERSION: '1.0.0',
  
  // Security Settings
  ENABLE_HTTPS: true,
  ENABLE_CORS: true,
  
  // Feature Flags
  ENABLE_SPEECH_RECOGNITION: true,
  ENABLE_MULTILINGUAL: true,
  ENABLE_MEDICAL_ENTITIES: true,
  
  // API Endpoints
  API_BASE_URL: 'https://cliniq.org.in',
  
  // Google STT Streaming Proxy
  GOOGLE_STT_PROXY_URL: 'wss://cliniq.org.in/stt',
  GOOGLE_STT_ENABLED: true,
  GOOGLE_STT_DEFAULT_PROVIDER: 'google-streaming',
  
  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: '',
  VERCEL_ANALYTICS_ID: ''
};

// Helper function to get config values
window.getConfig = function(key) {
  return window.APP_CONFIG[key] || '';
};

// Log configuration status (remove in production)
console.log('ClinIQ Configuration loaded:', {
  environment: window.APP_CONFIG.APP_ENVIRONMENT,
  version: window.APP_CONFIG.APP_VERSION,
  speechEnabled: window.APP_CONFIG.ENABLE_SPEECH_RECOGNITION
});
