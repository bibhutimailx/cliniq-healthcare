// Minimal Google Cloud Speech streaming proxy with diarization & language hints
// Usage:
// 1) Install deps: npm i express ws @google-cloud/speech
// 2) Ensure GOOGLE_APPLICATION_CREDENTIALS env points to service account JSON
// 3) Run: node server/google-stt-proxy.js (defaults to port 3001)

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Transform } = require('stream');
const speech = require('@google-cloud/speech');

const PORT = process.env.GOOGLE_STT_PROXY_PORT || 3001;

// PCM16 raw transformer from incoming binary frames (assumed Int16LE already)
class PassThroughPCM extends Transform {
  _transform(chunk, enc, cb) {
    // Expect raw PCM 16-bit mono 16kHz frames from client
    this.push(chunk);
    cb();
  }
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/stt' });

const client = new speech.SpeechClient();

app.get('/', (_req, res) => {
  res.send('Google STT proxy running');
});

wss.on('connection', async (ws) => {
  let recognizeStream = null;
  let pcmStream = null;
  let sessionConfig = null;

  const startStream = async (cfg) => {
    if (recognizeStream) return;
    sessionConfig = cfg || {};

    const {
      languageCode = 'en-IN',
      alternativeLanguageCodes = [
        'hi-IN','bn-IN','ta-IN','te-IN','mr-IN','gu-IN','kn-IN','ml-IN','pa-IN','ur-IN'
      ],
      diarization = { enableSpeakerDiarization: true, minSpeakerCount: 2, maxSpeakerCount: 2 },
      sampleRateHertz = 16000,
      encoding = 'LINEAR16'
    } = sessionConfig;

    const request = {
      config: {
        encoding,
        sampleRateHertz,
        languageCode,
        alternativeLanguageCodes,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        model: 'default',
        useEnhanced: true,
        diarizationConfig: {
          enableSpeakerDiarization: diarization.enableSpeakerDiarization !== false,
          minSpeakerCount: diarization.minSpeakerCount || 2,
          maxSpeakerCount: diarization.maxSpeakerCount || 2,
        },
      },
      interimResults: true,
      singleUtterance: false,
    };

    pcmStream = new PassThroughPCM();

    recognizeStream = client
      .streamingRecognize(request)
      .on('error', (err) => {
        try { ws.send(JSON.stringify({ type: 'error', message: err.message })); } catch {}
        stopStream();
      })
      .on('data', (data) => {
        // Extract transcript
        const result = data.results?.[0];
        if (!result) return;
        const alt = result.alternatives?.[0];
        if (!alt) return;

        // Speaker diarization tags (if available)
        let speakerTag = null;
        const words = alt.words || [];
        if (words.length > 0) {
          speakerTag = words[words.length - 1].speakerTag || null;
        }

        ws.send(JSON.stringify({
          type: 'transcript',
          transcript: alt.transcript || '',
          isFinal: !!result.isFinal,
          confidence: alt.confidence || 0.9,
          languageCode: result.languageCode || languageCode,
          speakerTag, // numeric tag from Google
        }));
      })
      .on('end', () => {
        try { ws.send(JSON.stringify({ type: 'end' })); } catch {}
      });

    pcmStream.pipe(recognizeStream);
  };

  const stopStream = () => {
    try { if (pcmStream) pcmStream.unpipe(); } catch {}
    try { if (recognizeStream) recognizeStream.end(); } catch {}
    recognizeStream = null;
    pcmStream = null;
  };

  ws.on('message', (msg) => {
    // First JSON config message or binary PCM frames
    if (typeof msg === 'string') {
      try {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'config') {
          startStream(parsed.config || {});
        } else if (parsed.type === 'stop') {
          stopStream();
        }
      } catch {
        // ignore malformed text
      }
    } else if (Buffer.isBuffer(msg)) {
      if (!recognizeStream) startStream({});
      if (pcmStream) pcmStream.write(msg);
    }
  });

  ws.on('close', () => {
    stopStream();
  });
});

server.listen(PORT, () => {
  console.log(`Google STT proxy listening on http://localhost:${PORT}`);
});



