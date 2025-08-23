
interface VoiceSignature {
  id: string;
  name: string;
  features: {
    pitch: number;
    tempo: number;
    volume: number;
    accent: string;
    language: string;
    medicalTerms: string[];
    speakingPattern: string;
  };
  confidence: number;
  lastSeen: Date;
  totalUtterances: number;
}

interface SpeakerDetectionResult {
  speaker: string;
  confidence: number;
  isNewSpeaker: boolean;
  voiceSignature: VoiceSignature | null;
}

class AdvancedVoiceSignatureDetection {
  private voiceSignatures: Map<string, VoiceSignature> = new Map();
  private currentSpeakerId: string = 'doctor';
  private speakerCounter: number = 0;
  private medicalTermPatterns: { [key: string]: string[] } = {
    'doctor': [
      'diagnosis', 'treatment', 'prescription', 'medication', 'symptoms', 'examination',
      'blood pressure', 'temperature', 'heart rate', 'pulse', 'oxygen', 'x-ray',
      'test results', 'follow up', 'appointment', 'referral', 'consultation'
    ],
    'patient': [
      'pain', 'hurt', 'sick', 'fever', 'headache', 'stomach', 'nausea', 'dizzy',
      'tired', 'weak', 'cough', 'cold', 'allergy', 'rash', 'swelling', 'bleeding',
      'can\'t sleep', 'appetite', 'weight', 'mood', 'stress', 'anxiety'
    ]
  };

  // Advanced voice profiling based on multiple parameters
  private analyzeVoiceSignature(audioData: any, transcript: string): VoiceSignature {
    const pitch = this.extractPitch(audioData);
    const tempo = this.extractTempo(audioData);
    const volume = this.extractVolume(audioData);
    const accent = this.detectAccent(transcript);
    const language = this.detectLanguage(transcript);
    const medicalTerms = this.extractMedicalTerms(transcript);
    const speakingPattern = this.analyzeSpeakingPattern(transcript);

    return {
      id: this.generateSpeakerId(),
      name: this.generateSpeakerName(),
      features: {
        pitch,
        tempo,
        volume,
        accent,
        language,
        medicalTerms,
        speakingPattern
      },
      confidence: 0.85,
      lastSeen: new Date(),
      totalUtterances: 1
    };
  }

  private extractPitch(audioData: any): number {
    // Simulate pitch extraction from audio data
    // In real implementation, this would use FFT analysis
    return Math.random() * 200 + 100; // Hz range 100-300
  }

  private extractTempo(audioData: any): number {
    // Simulate tempo extraction (words per minute)
    return Math.random() * 50 + 120; // WPM range 120-170
  }

  private extractVolume(audioData: any): number {
    // Simulate volume extraction (dB)
    return Math.random() * 20 + 60; // dB range 60-80
  }

  private detectAccent(transcript: string): string {
    // Detect accent based on pronunciation patterns
    const accentPatterns = {
      'indian': /[aeiou]{2,}|[bcdfghjklmnpqrstvwxyz]{3,}/gi,
      'american': /\b(like|you know|um|uh)\b/gi,
      'british': /\b(brilliant|cheers|mate|bloody)\b/gi
    };

    for (const [accent, pattern] of Object.entries(accentPatterns)) {
      if (pattern.test(transcript)) {
        return accent;
      }
    }
    return 'neutral';
  }

  private detectLanguage(transcript: string): string {
    // Detect language based on character patterns
    const languagePatterns = {
      'hindi': /[अ-ह]/,
      'odia': /[ଅ-ହ]/,
      'bengali': /[অ-হ]/,
      'tamil': /[அ-ஹ]/,
      'telugu': /[అ-హ]/,
      'malayalam': /[അ-ഹ]/,
      'kannada': /[ಅ-ಹ]/,
      'gujarati': /[અ-હ]/,
      'marathi': /[अ-ह]/,
      'punjabi': /[ਅ-ਹ]/,
      'urdu': /[ا-ی]/
    };

    for (const [language, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(transcript)) {
        return language;
      }
    }
    return 'english';
  }

  private extractMedicalTerms(transcript: string): string[] {
    const allMedicalTerms = [
      ...this.medicalTermPatterns.doctor,
      ...this.medicalTermPatterns.patient
    ];
    
    return allMedicalTerms.filter(term => 
      transcript.toLowerCase().includes(term.toLowerCase())
    );
  }

  private analyzeSpeakingPattern(transcript: string): string {
    const words = transcript.split(' ');
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const hasMedicalTerms = this.extractMedicalTerms(transcript).length > 0;
    const isQuestion = transcript.includes('?') || /^(what|how|why|when|where|can|could|would|should)/i.test(transcript);

    if (hasMedicalTerms && avgWordLength > 8) return 'professional';
    if (isQuestion && hasMedicalTerms) return 'inquisitive';
    if (avgWordLength < 5) return 'casual';
    return 'formal';
  }

  private generateSpeakerId(): string {
    this.speakerCounter++;
    return `speaker_${this.speakerCounter}`;
  }

  private generateSpeakerName(): string {
    const names = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];
    return names[this.speakerCounter - 1] || `Guest ${this.speakerCounter}`;
  }

  // Main speaker detection function
  public detectSpeaker(transcript: string, audioData?: any): SpeakerDetectionResult {
    // First, try to match with existing speakers
    const existingMatch = this.findExistingSpeaker(transcript, audioData);
    
    if (existingMatch) {
      return {
        speaker: existingMatch.name,
        confidence: existingMatch.confidence,
        isNewSpeaker: false,
        voiceSignature: existingMatch
      };
    }

    // If no match found, create new speaker profile
    const newSignature = this.analyzeVoiceSignature(audioData || {}, transcript);
    this.voiceSignatures.set(newSignature.id, newSignature);

    return {
      speaker: newSignature.name,
      confidence: newSignature.confidence,
      isNewSpeaker: true,
      voiceSignature: newSignature
    };
  }

  private findExistingSpeaker(transcript: string, audioData?: any): VoiceSignature | null {
    let bestMatch: VoiceSignature | null = null;
    let highestConfidence = 0;

    for (const signature of this.voiceSignatures.values()) {
      const confidence = this.calculateMatchConfidence(signature, transcript, audioData);
      
      if (confidence > highestConfidence && confidence > 0.7) {
        highestConfidence = confidence;
        bestMatch = signature;
      }
    }

    if (bestMatch) {
      // Update the signature with new data
      bestMatch.lastSeen = new Date();
      bestMatch.totalUtterances++;
      bestMatch.confidence = highestConfidence;
    }

    return bestMatch;
  }

  private calculateMatchConfidence(signature: VoiceSignature, transcript: string, audioData?: any): number {
    let confidence = 0;
    let factors = 0;

    // Factor 1: Medical terminology consistency
    const currentMedicalTerms = this.extractMedicalTerms(transcript);
    const termOverlap = currentMedicalTerms.filter(term => 
      signature.features.medicalTerms.includes(term)
    ).length;
    confidence += (termOverlap / Math.max(currentMedicalTerms.length, 1)) * 0.3;
    factors++;

    // Factor 2: Language consistency
    const currentLanguage = this.detectLanguage(transcript);
    if (signature.features.language === currentLanguage) {
      confidence += 0.25;
    }
    factors++;

    // Factor 3: Speaking pattern consistency
    const currentPattern = this.analyzeSpeakingPattern(transcript);
    if (signature.features.speakingPattern === currentPattern) {
      confidence += 0.2;
    }
    factors++;

    // Factor 4: Accent consistency
    const currentAccent = this.detectAccent(transcript);
    if (signature.features.accent === currentAccent) {
      confidence += 0.15;
    }
    factors++;

    // Factor 5: Time-based confidence (recent speakers get higher confidence)
    const timeSinceLastSeen = Date.now() - signature.lastSeen.getTime();
    const timeConfidence = Math.max(0, 1 - (timeSinceLastSeen / (5 * 60 * 1000))); // 5 minutes
    confidence += timeConfidence * 0.1;
    factors++;

    return confidence / factors;
  }

  // Get all detected speakers
  public getDetectedSpeakers(): VoiceSignature[] {
    return Array.from(this.voiceSignatures.values());
  }

  // Get current speaker
  public getCurrentSpeaker(): string {
    return this.currentSpeakerId;
  }

  // Update current speaker
  public updateCurrentSpeaker(speakerId: string): void {
    this.currentSpeakerId = speakerId;
  }

  // Reset all speakers (for new session)
  public resetSpeakers(): void {
    this.voiceSignatures.clear();
    this.speakerCounter = 0;
    this.currentSpeakerId = 'doctor';
  }

  // Get speaker statistics
  public getSpeakerStats(): { totalSpeakers: number; activeSpeakers: number } {
    const now = new Date();
    const activeSpeakers = Array.from(this.voiceSignatures.values()).filter(
      signature => (now.getTime() - signature.lastSeen.getTime()) < (5 * 60 * 1000) // 5 minutes
    ).length;

    return {
      totalSpeakers: this.voiceSignatures.size,
      activeSpeakers
    };
  }
}

// Export singleton instance
export const voiceSignatureDetection = new AdvancedVoiceSignatureDetection();
