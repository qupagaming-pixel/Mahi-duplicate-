package com.heymahi.companion

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.heymahi.companion.ui.screens.ChatDrawer
import com.heymahi.companion.ui.screens.MahiCompanionScreen
import com.heymahi.companion.ui.screens.OnboardingScreen
import com.heymahi.companion.ui.screens.SettingsDialog
import com.heymahi.companion.ui.screens.StudyHubDialog
import com.heymahi.companion.ui.theme.DarkBackground
import com.heymahi.companion.ui.theme.HeyMahiTheme
import com.heymahi.companion.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            HeyMahiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkBackground
                ) {
                    val isOnboardingCompleted by viewModel.isOnboardingCompleted.collectAsState()
                    val isSettingsOpen by viewModel.isSettingsOpen.collectAsState()
                    val isStudyHubOpen by viewModel.isStudyHubOpen.collectAsState()
                    val isChatDrawerOpen by viewModel.isChatDrawerOpen.collectAsState()
                    val userName by viewModel.userName.collectAsState()
                    val apiKey by viewModel.apiKey.collectAsState()
                    val isStudyMode by viewModel.isStudyMode.collectAsState()
                    val selectedSubject by viewModel.selectedSubject.collectAsState()
                    val chatMessages by viewModel.chatMessages.collectAsState()

                    // Permission launcher for RECORD_AUDIO
                    val permissionLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.RequestPermission()
                    ) { isGranted ->
                        if (!isGranted) {
                            Toast.makeText(
                                this,
                                "Microphone permission is required for voice calls with Mahi.",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }

                    fun requestMicPermission() {
                        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                            != PackageManager.PERMISSION_GRANTED
                        ) {
                            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                        }
                    }

                    if (!isOnboardingCompleted) {
                        OnboardingScreen(
                            onComplete = { name, key ->
                                viewModel.completeOnboarding(name, key)
                            }
                        )
                    } else {
                        MahiCompanionScreen(
                            viewModel = viewModel,
                            onRequestMicrophonePermission = { requestMicPermission() }
                        )
                    }

                    // Settings Bottom Sheet
                    if (isSettingsOpen) {
                        SettingsDialog(
                            userName = userName,
                            apiKey = apiKey,
                            onSaveName = { viewModel.saveUserName(it) },
                            onSaveApiKey = { viewModel.saveApiKey(it) },
                            onClearMemory = { viewModel.clearMemory() },
                            onResetOnboarding = { viewModel.resetOnboarding() },
                            onDismiss = { viewModel.setSettingsOpen(false) }
                        )
                    }

                    // Study Hub Bottom Sheet
                    if (isStudyHubOpen) {
                        StudyHubDialog(
                            isStudyMode = isStudyMode,
                            selectedSubject = selectedSubject,
                            onToggleStudyMode = { viewModel.toggleStudyMode(it) },
                            onSelectSubject = { viewModel.selectStudySubject(it) },
                            onSendPrompt = { prompt ->
                                viewModel.sendTextMessage(prompt)
                                viewModel.setChatDrawerOpen(true)
                            },
                            onDismiss = { viewModel.setStudyHubOpen(false) }
                        )
                    }

                    // Chat Drawer Bottom Sheet
                    if (isChatDrawerOpen) {
                        ChatDrawer(
                            messages = chatMessages,
                            onSendMessage = { viewModel.sendTextMessage(it) },
                            onClearChat = { viewModel.clearMemory() },
                            onDismiss = { viewModel.setChatDrawerOpen(false) }
                        )
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        viewModel.endCall()
    }
}
