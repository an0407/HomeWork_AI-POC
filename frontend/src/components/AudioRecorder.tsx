import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RefreshCw, Check, X } from 'lucide-react';
import { Button } from './ui/button';

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  onCancel?: () => void;
  maxDurationSeconds?: number;
}

export function AudioRecorder({
  onRecordingComplete,
  onCancel,
  maxDurationSeconds = 120, // 2 minutes default
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Setup audio level visualization
  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start animation loop for audio level
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average level
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 128) * 100));

        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (err) {
      console.error('Audio visualization error:', err);
    }
  };

  // Cleanup audio visualization
  const cleanupAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  // Start recording
  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio visualization
      setupAudioVisualization(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        cleanupStream();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop at max duration
          if (newTime >= maxDurationSeconds) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone access denied. Please allow microphone permissions and try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone found on this device.');
        } else {
          setError(`Microphone error: ${err.message}`);
        }
      } else {
        setError('Failed to access microphone. Please check your browser permissions.');
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      cleanupAudioVisualization();
    }
  };

  // Cleanup stream
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Play/pause recorded audio
  const togglePlayback = () => {
    if (!audioElementRef.current || !audioURL) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  // Confirm recording
  const confirmRecording = () => {
    if (!audioBlob) return;

    const file = new File([audioBlob], `voice-recording-${Date.now()}.webm`, {
      type: 'audio/webm',
    });
    onRecordingComplete(file);
  };

  // Retake recording
  const retake = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
    setRecordingTime(0);
    setIsPlaying(false);
    audioChunksRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      cleanupStream();
      cleanupAudioVisualization();
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [audioURL]);

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Not Recording and No Audio */}
      {!isRecording && !audioBlob && (
        <div className="border-2 border-gray-300 rounded-lg p-8 text-center">
          <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Record Your Question
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Speak your homework question clearly
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Maximum recording time: {formatTime(maxDurationSeconds)}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={startRecording}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Recording in Progress */}
      {isRecording && (
        <div className="border-2 border-red-300 rounded-lg p-8 bg-red-50">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-lg font-bold text-red-600">RECORDING</span>
            </div>
            <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
              {formatTime(recordingTime)}
            </div>
            <p className="text-sm text-gray-600">
              {formatTime(maxDurationSeconds - recordingTime)} remaining
            </p>
          </div>

          {/* Audio Level Indicator */}
          <div className="mb-6">
            <p className="text-xs text-gray-600 mb-2 text-center">Audio Level</p>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop Recording
            </Button>
          </div>
        </div>
      )}

      {/* Recording Complete - Playback */}
      {audioBlob && audioURL && (
        <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50">
          <div className="text-center mb-6">
            <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Recording Complete!
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Duration: {formatTime(recordingTime)}
            </p>
            <p className="text-xs text-gray-500">
              Listen to your recording before submitting
            </p>
          </div>

          {/* Audio Playback */}
          <div className="bg-white rounded-lg p-4 mb-6">
            <audio
              ref={audioElementRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={togglePlayback}
                variant="outline"
                size="lg"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Play Recording
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={confirmRecording}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-5 w-5 mr-2" />
              Use This Recording
            </Button>
            <Button size="lg" variant="outline" onClick={retake}>
              <RefreshCw className="h-5 w-5 mr-2" />
              Record Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
