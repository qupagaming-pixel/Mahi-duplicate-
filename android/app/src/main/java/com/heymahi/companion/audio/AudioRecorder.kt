package com.heymahi.companion.audio

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Base64
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.sqrt

/**
 * High-performance PCM Audio Recorder for Gemini Live Voice Chat.
 *
 * Configured for 16,000 Hz, 16-bit Linear PCM, Mono.
 * Calculates real-time microphone RMS volume levels for UI pulsation.
 */
class AudioRecorder {

    private var audioRecord: AudioRecord? = null
    private var recordingJob: Job? = null
    private var isRecording = false
    var isMuted = false

    @SuppressLint("MissingPermission")
    fun startRecording(
        scope: CoroutineScope,
        onAudioChunk: (String) -> Unit,
        onLevelUpdate: (Float) -> Unit
    ) {
        if (isRecording) return

        val sampleRate = 16000
        val channelConfig = AudioFormat.CHANNEL_IN_MONO
        val audioFormat = AudioFormat.ENCODING_PCM_16BIT

        val minBufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
        val bufferSize = (minBufferSize * 2).coerceAtLeast(4096)

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                sampleRate,
                channelConfig,
                audioFormat,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "AudioRecord initialization failed")
                return
            }

            audioRecord?.startRecording()
            isRecording = true

            recordingJob = scope.launch(Dispatchers.IO) {
                val buffer = ShortArray(2048)
                val byteBuffer = ByteArray(4096)

                while (isActive && isRecording) {
                    val readCount = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (readCount > 0) {
                        if (isMuted) {
                            onLevelUpdate(0f)
                            continue
                        }

                        // Calculate RMS level
                        var sum = 0.0
                        for (i in 0 until readCount) {
                            val sample = buffer[i]
                            sum += sample * sample

                            // Convert short to little-endian bytes
                            byteBuffer[i * 2] = (sample.toInt() and 0xFF).toByte()
                            byteBuffer[i * 2 + 1] = ((sample.toInt() shr 8) and 0xFF).toByte()
                        }

                        val rms = sqrt(sum / readCount)
                        val normalizedLevel = (rms / 8000.0).coerceIn(0.0, 1.0).toFloat()
                        onLevelUpdate(normalizedLevel)

                        // Base64 encode for Gemini Live PCM payload
                        val chunkBytes = byteBuffer.copyOfRange(0, readCount * 2)
                        val base64 = Base64.encodeToString(chunkBytes, Base64.NO_WRAP)
                        onAudioChunk(base64)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception starting audio recording", e)
            stopRecording()
        }
    }

    fun stopRecording() {
        isRecording = false
        recordingJob?.cancel()
        recordingJob = null
        try {
            audioRecord?.stop()
            audioRecord?.release()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping AudioRecord", e)
        }
        audioRecord = null
    }

    companion object {
        private const val TAG = "MahiAudioRecorder"
    }
}
