
import { useCallback, useRef } from 'react';

export interface SpeakerDetectionConfig {
  currentSpeaker: 'doctor' | 'patient' | 'person1' | 'person2' | 'person3';
  detectedSpeakers: Set<string>;
  lastSpeechEndRef: React.MutableRefObject<number>;
  silenceThresholdRef: React.MutableRefObject<number>;
}

export const useSpeakerDetection = () => {
  const lastSpeechEndRef = useRef<number>(0);
  const silenceThresholdRef = useRef<number>(2000); // 2 seconds of silence indicates speaker change
  const speechPatternsRef = useRef<Map<string, { avgPitch: number; avgVolume: number; speechRate: number }>>(new Map());

  const detectSpeaker = useCallback((
    text: string, 
    confidence: number, 
    currentSpeaker: 'doctor' | 'patient' | 'person1' | 'person2' | 'person3',
    detectedSpeakers: Set<string>
  ): string => {
    const now = Date.now();
    const timeSinceLastSpeech = now - lastSpeechEndRef.current;
    
    // If there's been a pause > 2 seconds, likely a new speaker
    if (timeSinceLastSpeech > silenceThresholdRef.current) {
      // Simple heuristic: alternate between speakers based on conversation flow
      const speakers = Array.from(detectedSpeakers);
      const currentIndex = speakers.indexOf(currentSpeaker);
      const nextSpeaker = speakers[(currentIndex + 1) % speakers.length] || 'patient';
      
      console.log(`Speaker change detected after ${timeSinceLastSpeech}ms silence. Switching from ${currentSpeaker} to ${nextSpeaker}`);
      return nextSpeaker;
    }
    
    // Detect question patterns (likely doctor asking)
    const questionWords = ['क्या', 'कैसे', 'कब', 'कहाँ', 'what', 'how', 'when', 'where', 'why'];
    const isQuestion = questionWords.some(word => text.toLowerCase().includes(word.toLowerCase())) || text.includes('?');
    
    // Detect medical terminology (likely doctor)
    const medicalTerms = ['दवा', 'इलाज', 'बीमारी', 'दर्द', 'medicine', 'treatment', 'pain', 'symptoms', 'diagnosis'];
    const hasMedicalTerms = medicalTerms.some(term => text.toLowerCase().includes(term.toLowerCase()));
    
    // Personal responses (likely patient)
    const personalResponses = ['मेरा', 'मुझे', 'मैं', 'my', 'me', 'i am', 'i have'];
    const isPersonalResponse = personalResponses.some(response => text.toLowerCase().includes(response.toLowerCase()));
    
    if (isQuestion && hasMedicalTerms) {
      return 'doctor';
    } else if (isPersonalResponse) {
      return 'patient';
    }
    
    return currentSpeaker; // Keep current speaker if unclear
  }, []);

  const updateLastSpeechTime = useCallback(() => {
    lastSpeechEndRef.current = Date.now();
  }, []);

  return {
    detectSpeaker,
    updateLastSpeechTime,
    lastSpeechEndRef,
    silenceThresholdRef,
    speechPatternsRef
  };
};
