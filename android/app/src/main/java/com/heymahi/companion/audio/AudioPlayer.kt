package com.heymahi.companion.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Base64
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.concurrent.LinkedBlockingQueue
import kotlin.math.sqrt

/**
 * Real-time Streaming Audio Player for Gemini Live Voice output.
 *
 * Plays 24,000 Hz, 16-bit Linear PCM, Mono received from Gemini Live API.
 * Calculates output volume levels to drive the talking animation (lip-sync and aura).
 */
class AudioPlayer {

    private var audioTrack: AudioTrack? = null
    private val audioQueue = LinkedBlockingQueue<ByteArray>()
    private var playbackJob: Job? = null
    private var isPlaying = false

    fun startPlayback(
        scope: CoroutineScope,
        onLevelUpdate: (Float) -> Unit,
        onSpeakingStateChanged: (Boolean) -> Unit
    ) {
        if (isPlaying) return

        val sampleRate = 24000
        val channelConfig = AudioFormat.CHANNEL_OUT_MONO
        val audioFormat = AudioFormat.ENCODING_PCM_16BIT

        val minBufferSize = AudioTrack.getMinBufferSize(sampleRate, channelConfig, audioFormat)
        val bufferSize = (minBufferSize * 4).coerceAtLeast(8192)

        try {
            audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(audioFormat)
                        .setSampleRate(sampleRate)
                        .setChannelMask(channelConfig)
                        .build()
                )
                .setBufferSizeInBytes(bufferSize)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()

            audioTrack?.play()
            isPlaying = true

            playbackJob = scope.launch(Dispatchers.IO) {
                var wasSpeaking = false

                while (isActive && isPlaying) {
                    val chunk = audioQueue.poll()
                    if (chunk != null && chunk.isNotEmpty()) {
                        if (!wasSpeaking) {
                            wasSpeaking = true
                            onSpeakingStateChanged(true)
                        }

                        // Calculate RMS level for avatar lip sync
                        var sum = 0.0
                        val sampleCount = chunk.size / 2
                        for (i in 0 until sampleCount) {
                            val low = chunk[i * 2].toInt() and 0xFF
                            val high = chunk[i * 2 + 1].toInt()
                            val sample = (high shl 8) or low
                            sum += sample * sample
                        }

                        val rms = if (sampleCount > 0) sqrt(sum / sampleCount) else 0.0
                        val level = (rms / 9000.0).coerceIn(0.0, 1.0).toFloat()
                        onLevelUpdate(level)

                        audioTrack?.write(chunk, 0, chunk.size)
                    } else {
                        if (wasSpeaking && audioQueue.isEmpty()) {
                            wasSpeaking = false
                            onSpeakingStateChanged(false)
                            onLevelUpdate(0f)
                        }
                        Thread.sleep(15)
                    }
                }
                onSpeakingStateChanged(false)
                onLevelUpdate(0f)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error starting AudioTrack", e)
            stopPlayback()
        }
    }

    fun queueBase64Audio(base64Data: String) {
        try {
            val bytes = Base64.decode(base64Data, Base64.DEFAULT)
            if (bytes.isNotEmpty()) {
                audioQueue.offer(bytes)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to decode base64 audio chunk", e)
        }
    }

    fun clearQueue() {
        audioQueue.clear()
        try {
            audioTrack?.flush()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to flush AudioTrack", e)
        }
    }

    fun stopPlayback() {
        isPlaying = false
        playbackJob?.cancel()
        playbackJob = null
        audioQueue.clear()
        try {
            audioTrack?.stop()
            audioTrack?.release()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping AudioTrack", e)
        }
        audioTrack = null
    }

    companion object {
        private const val TAG = "MahiAudioPlayer"
    }
}
