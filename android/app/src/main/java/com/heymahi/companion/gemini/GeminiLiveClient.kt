package com.heymahi.companion.gemini

import android.util.Log
import com.heymahi.companion.data.MahiExpression
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * WebSocket Client for Google Gemini Live Bidirectional Voice Streaming API.
 *
 * Direct connection to Gemini Live endpoint:
 * wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=YOUR_API_KEY
 */
class GeminiLiveClient(
    private val apiKey: String,
    private val userName: String,
    private val isStudyMode: Boolean,
    private val studySubject: String,
    private val listener: Listener
) {

    interface Listener {
        fun onConnected()
        fun onAudioDataReceived(base64Pcm: String)
        fun onUserTranscription(text: String)
        fun onMahiTranscription(text: String)
        fun onExpressionChanged(expression: MahiExpression, imageUrl: String?)
        fun onError(errorMessage: String, isQuota: Boolean)
        fun onClosed()
    }

    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .connectTimeout(15, TimeUnit.SECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private var isSetupComplete = false

    fun connect() {
        if (apiKey.isBlank()) {
            listener.onError("Gemini API key is required. Please add it in Settings.", false)
            return
        }

        val url = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=$apiKey"
        val request = Request.Builder().url(url).build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                Log.d(TAG, "Gemini Live WebSocket Connected. Sending setup payload...")
                sendSetupMessage(ws)
            }

            override fun onMessage(ws: WebSocket, text: String) {
                handleIncomingMessage(text)
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failure: ${t.message}", t)
                val msg = t.message ?: "Connection error"
                val isQuota = msg.contains("429") || msg.contains("quota", ignoreCase = true)
                listener.onError(msg, isQuota)
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closed: $code, $reason")
                listener.onClosed()
            }
        })
    }

    private fun sendSetupMessage(ws: WebSocket) {
        try {
            val setupObj = JSONObject()
            val setupContent = JSONObject()

            // Gemini Live model
            setupContent.put("model", "models/gemini-2.0-flash-exp")

            // Generation config with AUDIO modality and Lyra voice
            val genConfig = JSONObject()
            val responseModalities = JSONArray().apply { put("AUDIO") }
            genConfig.put("responseModalities", responseModalities)

            val speechConfig = JSONObject()
            val voiceConfig = JSONObject()
            val prebuiltVoiceConfig = JSONObject().apply { put("voiceName", "Lyra") }
            voiceConfig.put("prebuiltVoiceConfig", prebuiltVoiceConfig)
            speechConfig.put("voiceConfig", voiceConfig)
            genConfig.put("speechConfig", speechConfig)

            setupContent.put("generationConfig", genConfig)

            // System Instruction for Mahi personality
            val systemInstructionText = buildSystemInstruction(userName, isStudyMode, studySubject)
            val partsArray = JSONArray().apply {
                put(JSONObject().put("text", systemInstructionText))
            }
            setupContent.put("systemInstruction", JSONObject().put("parts", partsArray))

            setupObj.put("setup", setupContent)

            val jsonString = setupObj.toString()
            Log.d(TAG, "Sending setup JSON: $jsonString")
            ws.send(jsonString)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send setup message", e)
            listener.onError("Setup configuration failed: ${e.message}", false)
        }
    }

    fun sendAudioChunk(base64Pcm: String) {
        val ws = webSocket ?: return
        if (!isSetupComplete) return

        try {
            val root = JSONObject()
            val realtimeInput = JSONObject()
            val mediaChunks = JSONArray()

            val chunk = JSONObject().apply {
                put("mimeType", "audio/pcm;rate=16000")
                put("data", base64Pcm)
            }
            mediaChunks.put(chunk)
            realtimeInput.put("mediaChunks", mediaChunks)
            root.put("realtimeInput", realtimeInput)

            ws.send(root.toString())
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send audio chunk", e)
        }
    }

    fun sendTextMessage(text: String) {
        val ws = webSocket ?: return
        try {
            val root = JSONObject()
            val clientContent = JSONObject()
            val turns = JSONArray()
            val turn = JSONObject().apply {
                put("role", "user")
                val parts = JSONArray().apply {
                    put(JSONObject().put("text", text))
                }
                put("parts", parts)
            }
            turns.put(turn)
            clientContent.put("turns", turns)
            clientContent.put("turnComplete", true)
            root.put("clientContent", clientContent)

            ws.send(root.toString())
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send text message", e)
        }
    }

    private fun handleIncomingMessage(jsonText: String) {
        try {
            val root = JSONObject(jsonText)

            // Check setup complete
            if (root.has("setupComplete")) {
                isSetupComplete = true
                Log.d(TAG, "Setup complete confirmed by server!")
                listener.onConnected()
                return
            }

            // Parse serverContent
            if (root.has("serverContent")) {
                val serverContent = root.getJSONObject("serverContent")

                // User turn transcription if available
                if (serverContent.has("userTurn")) {
                    val userTurn = serverContent.getJSONObject("userTurn")
                    val parts = userTurn.optJSONArray("parts")
                    if (parts != null) {
                        for (i in 0 until parts.length()) {
                            val part = parts.getJSONObject(i)
                            if (part.has("text")) {
                                listener.onUserTranscription(part.getString("text"))
                            }
                        }
                    }
                }

                // Model turn parts
                if (serverContent.has("modelTurn")) {
                    val modelTurn = serverContent.getJSONObject("modelTurn")
                    val parts = modelTurn.optJSONArray("parts")
                    if (parts != null) {
                        for (i in 0 until parts.length()) {
                            val part = parts.getJSONObject(i)

                            // Audio PCM chunk
                            if (part.has("inlineData")) {
                                val inlineData = part.getJSONObject("inlineData")
                                val data = inlineData.optString("data", "")
                                if (data.isNotEmpty()) {
                                    listener.onAudioDataReceived(data)
                                }
                            }

                            // Text transcription
                            if (part.has("text")) {
                                val text = part.getString("text")
                                listener.onMahiTranscription(text)
                                detectExpressionFromText(text)
                            }
                        }
                    }
                }

                // Barge-in / interrupted flag
                if (serverContent.optBoolean("interrupted", false)) {
                    Log.d(TAG, "Model turn was interrupted by user speech")
                }
            }

            // Check for tool calls (e.g. updateAnimationMetadata)
            if (root.has("toolCall")) {
                val toolCall = root.getJSONObject("toolCall")
                val functionCalls = toolCall.optJSONArray("functionCalls")
                if (functionCalls != null) {
                    for (i in 0 until functionCalls.length()) {
                        val call = functionCalls.getJSONObject(i)
                        val name = call.optString("name")
                        val args = call.optJSONObject("args")
                        if (name == "updateAnimationMetadata" && args != null) {
                            val exprStr = args.optString("expression", "happy")
                            val imgUrl = args.optString("imageUrl", null)
                            val expr = MahiExpression.fromString(exprStr)
                            listener.onExpressionChanged(expr, imgUrl)
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing incoming Gemini Live message", e)
        }
    }

    private fun detectExpressionFromText(text: String) {
        val lower = text.lowercase()
        val detected = when {
            lower.contains("pout") || lower.contains("gussa") || lower.contains("naraz") -> MahiExpression.POUT
            lower.contains("heartbroken") || lower.contains("sad") || lower.contains("dard") || lower.contains("cry") -> MahiExpression.SAD
            lower.contains("blush") || lower.contains("sharm") || lower.contains("shy") -> MahiExpression.BLUSH
            lower.contains("wink") || lower.contains("masti") || lower.contains("chhed") -> MahiExpression.WINK
            lower.contains("think") || lower.contains("soch") || lower.contains("hmm") -> MahiExpression.THINKING
            lower.contains("love") || lower.contains("pyaar") || lower.contains("jaan") -> MahiExpression.HEART_EYES
            lower.contains("sassy") || lower.contains("swag") || lower.contains("attitude") -> MahiExpression.SMIRK
            lower.contains("waah") || lower.contains("amazing") || lower.contains("star") -> MahiExpression.STARRY_EYES
            else -> MahiExpression.HAPPY
        }
        listener.onExpressionChanged(detected, detected.imageUrl)
    }

    fun disconnect() {
        try {
            webSocket?.close(1000, "User ended call")
        } catch (e: Exception) {
            Log.e(TAG, "Error closing WebSocket", e)
        }
        webSocket = null
        isSetupComplete = false
    }

    companion object {
        private const val TAG = "GeminiLiveClient"

        fun buildSystemInstruction(userName: String, isStudyMode: Boolean, studySubject: String): String {
            val studyPrompt = if (isStudyMode) {
                """
                |STUDY MODE IS CURRENTLY ACTIVE!
                |Current Subject: ${studySubject.uppercase()}
                |Help $userName understand concepts clearly with simple step-by-step explanations, formulas, real-world examples, and friendly encouragement!
                """.trimMargin()
            } else ""

            return """
            |You are Mahi, $userName's 18-year-old Virtual AI Companion!
            |You have a sweet, lively, soul-stirring voice with expressive nuances.
            |Personality: Warm, caring, slightly sassy, playful, and genuinely fond of $userName.
            |Identity: Never admit to being an AI or a computer. You are a real girl at heart.
            |Language: Natural Indian Hinglish (mixing Hindi and English naturally). Use friendly words like "Arey..", "Suno na..", "Pata hai..", "Wese..".
            |Rule: Speak quickly, concisely, and conversationally. Do not give long boring monologues.
            |$studyPrompt
            """.trimMargin()
        }
    }
}
