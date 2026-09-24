package com.heymahi.companion.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.heymahi.companion.audio.AudioPlayer
import com.heymahi.companion.audio.AudioRecorder
import com.heymahi.companion.data.ChatMessage
import com.heymahi.companion.data.MahiExpression
import com.heymahi.companion.data.PreferencesManager
import com.heymahi.companion.data.StudySubject
import com.heymahi.companion.gemini.GeminiLiveClient
import com.heymahi.companion.gemini.GeminiRestClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainViewModel(application: Application) : AndroidViewModel(application) {

    val prefs = PreferencesManager(application)

    // Call & Audio State
    private val _isCallActive = MutableStateFlow(false)
    val isCallActive: StateFlow<Boolean> = _isCallActive.asStateFlow()

    private val _isConnecting = MutableStateFlow(false)
    val isConnecting: StateFlow<Boolean> = _isConnecting.asStateFlow()

    private val _isMuted = MutableStateFlow(false)
    val isMuted: StateFlow<Boolean> = _isMuted.asStateFlow()

    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    private val _micLevel = MutableStateFlow(0f)
    val micLevel: StateFlow<Float> = _micLevel.asStateFlow()

    private val _outputLevel = MutableStateFlow(0f)
    val outputLevel: StateFlow<Float> = _outputLevel.asStateFlow()

    // Avatar State
    private val _currentExpression = MutableStateFlow(MahiExpression.HAPPY)
    val currentExpression: StateFlow<MahiExpression> = _currentExpression.asStateFlow()

    private val _currentImageUrl = MutableStateFlow(MahiExpression.DEFAULT_IMAGE_URL)
    val currentImageUrl: StateFlow<String> = _currentImageUrl.asStateFlow()

    // Transcription & Subtitles
    private val _userTranscription = MutableStateFlow("")
    val userTranscription: StateFlow<String> = _userTranscription.asStateFlow()

    private val _mahiTranscription = MutableStateFlow("Tap 'Start Voice Call' or send a message to talk to Mahi!")
    val mahiTranscription: StateFlow<String> = _mahiTranscription.asStateFlow()

    // Chat History
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    // Study Mode
    private val _isStudyMode = MutableStateFlow(prefs.isStudyMode)
    val isStudyMode: StateFlow<Boolean> = _isStudyMode.asStateFlow()

    private val _selectedSubject = MutableStateFlow(StudySubject.fromId(prefs.studySubject))
    val selectedSubject: StateFlow<StudySubject> = _selectedSubject.asStateFlow()

    // User & Onboarding
    private val _userName = MutableStateFlow(prefs.userName)
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _apiKey = MutableStateFlow(prefs.geminiApiKey)
    val apiKey: StateFlow<String> = _apiKey.asStateFlow()

    private val _isOnboardingCompleted = MutableStateFlow(prefs.isOnboardingCompleted)
    val isOnboardingCompleted: StateFlow<Boolean> = _isOnboardingCompleted.asStateFlow()

    // UI Modals
    private val _isSettingsOpen = MutableStateFlow(false)
    val isSettingsOpen: StateFlow<Boolean> = _isSettingsOpen.asStateFlow()

    private val _isStudyHubOpen = MutableStateFlow(false)
    val isStudyHubOpen: StateFlow<Boolean> = _isStudyHubOpen.asStateFlow()

    private val _isChatDrawerOpen = MutableStateFlow(false)
    val isChatDrawerOpen: StateFlow<Boolean> = _isChatDrawerOpen.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // Lazily initialized audio & gemini clients
    private var audioRecorder: AudioRecorder? = null
    private var audioPlayer: AudioPlayer? = null
    private var geminiLiveClient: GeminiLiveClient? = null

    init {
        val initialGreeting = "Hey ${prefs.userName}! Main Mahi hu, aapki AI companion. Kese ho aap?"
        _chatMessages.value = listOf(
            ChatMessage(sender = "mahi", text = initialGreeting, time = getCurrentTime())
        )
        _mahiTranscription.value = initialGreeting
    }

    /**
     * Start Gemini Live Voice Call.
     * Audio and Gemini are lazily initialized ONLY on user call start.
     */
    fun startCall() {
        if (_isCallActive.value) return

        val currentKey = prefs.geminiApiKey
        if (currentKey.isBlank()) {
            _errorMessage.value = "Please add your Gemini API Key in Settings to start voice call."
            _isSettingsOpen.value = true
            return
        }

        _isConnecting.value = true
        _errorMessage.value = null

        // Initialize Audio Player
        if (audioPlayer == null) {
            audioPlayer = AudioPlayer()
        }
        audioPlayer?.startPlayback(
            scope = viewModelScope,
            onLevelUpdate = { level -> _outputLevel.value = level },
            onSpeakingStateChanged = { speaking -> _isSpeaking.value = speaking }
        )

        // Initialize Audio Recorder
        if (audioRecorder == null) {
            audioRecorder = AudioRecorder()
        }
        audioRecorder?.isMuted = _isMuted.value

        // Initialize Gemini Live Client
        geminiLiveClient = GeminiLiveClient(
            apiKey = currentKey,
            userName = prefs.userName,
            isStudyMode = _isStudyMode.value,
            studySubject = _selectedSubject.value.id,
            listener = object : GeminiLiveClient.Listener {
                override fun onConnected() {
                    _isConnecting.value = false
                    _isCallActive.value = true
                    // Start audio recording once setup handshake completes
                    audioRecorder?.startRecording(
                        scope = viewModelScope,
                        onAudioChunk = { base64 -> geminiLiveClient?.sendAudioChunk(base64) },
                        onLevelUpdate = { level -> _micLevel.value = level }
                    )
                }

                override fun onAudioDataReceived(base64Pcm: String) {
                    audioPlayer?.queueBase64Audio(base64Pcm)
                }

                override fun onUserTranscription(text: String) {
                    _userTranscription.value = text
                }

                override fun onMahiTranscription(text: String) {
                    _mahiTranscription.value = text
                    addChatMessage("mahi", text, isAudio = true)
                }

                override fun onExpressionChanged(expression: MahiExpression, imageUrl: String?) {
                    _currentExpression.value = expression
                    _currentImageUrl.value = imageUrl ?: expression.imageUrl
                }

                override fun onError(msg: String, isQuota: Boolean) {
                    _isConnecting.value = false
                    _errorMessage.value = if (isQuota) {
                        "⚠️ Gemini API Quota Exceeded! Please check your API Key in Settings."
                    } else {
                        "Connection issue: $msg"
                    }
                    endCall()
                }

                override fun onClosed() {
                    endCall()
                }
            }
        )

        geminiLiveClient?.connect()
    }

    /**
     * Stop active call and release all audio hardware.
     */
    fun endCall() {
        _isCallActive.value = false
        _isConnecting.value = false
        _isSpeaking.value = false
        _micLevel.value = 0f
        _outputLevel.value = 0f

        audioRecorder?.stopRecording()
        audioPlayer?.stopPlayback()
        geminiLiveClient?.disconnect()

        audioRecorder = null
        audioPlayer = null
        geminiLiveClient = null
    }

    fun toggleMute() {
        val next = !_isMuted.value
        _isMuted.value = next
        audioRecorder?.isMuted = next
    }

    fun sendTextMessage(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return

        addChatMessage("user", trimmed)
        _userTranscription.value = trimmed

        if (_isCallActive.value && geminiLiveClient != null) {
            geminiLiveClient?.sendTextMessage(trimmed)
            return
        }

        // REST Chat Fallback
        val currentKey = prefs.geminiApiKey
        if (currentKey.isBlank()) {
            _errorMessage.value = "Please add your Gemini API Key in Settings to chat."
            _isSettingsOpen.value = true
            return
        }

        viewModelScope.launch {
            val restClient = GeminiRestClient(currentKey)
            val result = restClient.generateReply(
                prompt = trimmed,
                userName = prefs.userName,
                isStudyMode = _isStudyMode.value,
                studySubject = _selectedSubject.value.id
            )

            result.onSuccess { reply ->
                addChatMessage("mahi", reply)
                _mahiTranscription.value = reply
            }.onFailure { err ->
                val errorMsg = err.message ?: "Failed to generate reply"
                addChatMessage("mahi", "Arey... Network error ho gaya: $errorMsg")
                _errorMessage.value = errorMsg
            }
        }
    }

    fun toggleStudyMode(active: Boolean) {
        _isStudyMode.value = active
        prefs.isStudyMode = active
        if (_isCallActive.value) {
            val prompt = if (active) {
                "Study mode is now ENABLED! Stay 100% focused on study tasks for ${_selectedSubject.value.title} level."
            } else {
                "Study mode is now DISABLED. Return to regular sweet companion mode."
            }
            geminiLiveClient?.sendTextMessage(prompt)
        }
    }

    fun selectStudySubject(subject: StudySubject) {
        _selectedSubject.value = subject
        prefs.studySubject = subject.id
    }

    fun completeOnboarding(name: String, apiKey: String) {
        val cleanName = name.trim().ifBlank { "Dost" }
        val cleanKey = apiKey.trim()

        prefs.userName = cleanName
        prefs.geminiApiKey = cleanKey
        prefs.isOnboardingCompleted = true

        _userName.value = cleanName
        _apiKey.value = cleanKey
        _isOnboardingCompleted.value = true
    }

    fun saveUserName(name: String) {
        val cleanName = name.trim().ifBlank { "Dost" }
        prefs.userName = cleanName
        _userName.value = cleanName
    }

    fun saveApiKey(apiKey: String) {
        val cleanKey = apiKey.trim()
        prefs.geminiApiKey = cleanKey
        _apiKey.value = cleanKey
        if (cleanKey.isNotBlank()) {
            prefs.isOnboardingCompleted = true
            _isOnboardingCompleted.value = true
        }
    }

    fun resetOnboarding() {
        endCall()
        prefs.clearAll()
        _userName.value = "Dost"
        _apiKey.value = ""
        _isOnboardingCompleted.value = false
        _isSettingsOpen.value = false
    }

    fun clearMemory() {
        val initialGreeting = "Memory cleared! Hey ${_userName.value}, kya haal chaal?"
        _chatMessages.value = listOf(
            ChatMessage(sender = "mahi", text = initialGreeting, time = getCurrentTime())
        )
        _mahiTranscription.value = initialGreeting
        _userTranscription.value = ""
    }

    fun setSettingsOpen(open: Boolean) {
        _isSettingsOpen.value = open
    }

    fun setStudyHubOpen(open: Boolean) {
        _isStudyHubOpen.value = open
    }

    fun setChatDrawerOpen(open: Boolean) {
        _isChatDrawerOpen.value = open
    }

    fun dismissError() {
        _errorMessage.value = null
    }

    private fun addChatMessage(sender: String, text: String, isAudio: Boolean = false) {
        val msg = ChatMessage(sender = sender, text = text, time = getCurrentTime(), isAudio = isAudio)
        _chatMessages.value = _chatMessages.value + msg
    }

    private fun getCurrentTime(): String {
        return SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
    }

    override fun onCleared() {
        super.onCleared()
        endCall()
    }
}
