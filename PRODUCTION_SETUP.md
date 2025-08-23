# Production Hospital Setup Guide

## 🏥 **AWS Bedrock Configuration for Hospital Production**

### **1. AWS Bedrock Setup**

For production hospital use, configure AWS Bedrock with the following environment variables:

```bash
# .env.production
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_id
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
VITE_AWS_REGION=us-east-1
```

### **2. AWS IAM Permissions**

Create an IAM user with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:StartStreamTranscription",
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob",
        "s3:PutObject",
        "s3:GetObject",
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    }
  ]
}
```

### **3. HIPAA Compliance**

For HIPAA compliance, ensure:

- ✅ **Data Encryption**: All audio data encrypted in transit and at rest
- ✅ **Access Controls**: Strict IAM policies and role-based access
- ✅ **Audit Logging**: Enable CloudTrail for all AWS services
- ✅ **Data Retention**: Configure appropriate retention policies
- ✅ **Business Associate Agreement**: Sign BAA with AWS

### **4. Production Deployment**

#### **Option A: AWS Amplify (Recommended)**
```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### **Option B: Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

### **5. Environment Variables**

Create `.env.production` with:

```bash
# AWS Bedrock Configuration
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_AWS_REGION=us-east-1

# Alternative Providers
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_key
VITE_GOOGLE_CLOUD_API_KEY=your_google_key
VITE_AZURE_SPEECH_KEY=your_azure_key

# Application Settings
VITE_APP_NAME=ClinIQ
VITE_APP_ENVIRONMENT=production
```

### **6. Production Features**

#### **✅ Real-time Speech Recognition**
- AWS Bedrock with Amazon Transcribe
- Speaker diarization for multiple speakers
- Language auto-detection (100+ languages)
- Medical terminology recognition

#### **✅ Hospital-Specific Features**
- HIPAA compliant data handling
- Medical entity extraction
- Patient privacy protection
- Audit trail logging

#### **✅ Multilingual Support**
- English, Hindi, Odia, Bengali, Tamil, Telugu
- Real-time language switching
- Medical terminology in local languages

#### **✅ Production Monitoring**
- AWS CloudWatch integration
- Error tracking and alerting
- Performance monitoring
- Usage analytics

### **7. Security Checklist**

- [ ] **HTTPS Only**: All traffic encrypted
- [ ] **CORS Configuration**: Restrict to hospital domains
- [ ] **API Rate Limiting**: Prevent abuse
- [ ] **Input Validation**: Sanitize all inputs
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Session Management**: Secure session handling
- [ ] **Data Backup**: Regular automated backups

### **8. Performance Optimization**

#### **Audio Processing**
- High-quality audio capture (48kHz, 128kbps)
- Noise suppression for hospital environments
- Echo cancellation for better accuracy

#### **Real-time Processing**
- 2-second audio chunks for low latency
- Parallel processing for multiple speakers
- Caching for repeated phrases

### **9. Testing in Production**

#### **Pre-deployment Testing**
```bash
# Test AWS credentials
npm run test:aws

# Test speech recognition
npm run test:speech

# Test multilingual support
npm run test:languages
```

#### **Load Testing**
```bash
# Simulate hospital load
npm run test:load

# Test concurrent users
npm run test:concurrent
```

### **10. Monitoring and Maintenance**

#### **Health Checks**
- AWS Bedrock service status
- Audio processing pipeline
- Speaker detection accuracy
- Language detection performance

#### **Alerting**
- Service downtime alerts
- High error rate notifications
- Performance degradation warnings
- Security incident alerts

### **11. Backup and Recovery**

#### **Data Backup**
- Daily automated backups
- Point-in-time recovery
- Cross-region replication
- Encrypted backup storage

#### **Disaster Recovery**
- Multi-region deployment
- Automated failover
- Data recovery procedures
- Business continuity plan

### **12. Compliance Documentation**

- HIPAA compliance checklist
- Data retention policies
- Access control procedures
- Audit trail requirements
- Incident response plan

---

## 🚀 **Quick Start for Production**

1. **Set up AWS credentials**
2. **Configure environment variables**
3. **Deploy to AWS Amplify**
4. **Test with real hospital scenarios**
5. **Monitor performance and accuracy**
6. **Train staff on usage**

---

## 📞 **Support**

For production support:
- **Technical Issues**: AWS Support
- **Medical Compliance**: HIPAA consultant
- **Application Support**: Development team
- **Emergency**: 24/7 on-call support 