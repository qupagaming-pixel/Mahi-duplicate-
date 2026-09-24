package com.heymahi.companion.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.CallEnd
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Sparkles
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.heymahi.companion.ui.components.MahiAvatar
import com.heymahi.companion.ui.components.TranscriptionCard
import com.heymahi.companion.ui.theme.BorderPurple
import com.heymahi.companion.ui.theme.DarkBackground
import com.heymahi.companion.ui.theme.DarkSurface
import com.heymahi.companion.ui.theme.NeonGreen
import com.heymahi.companion.ui.theme.NeonPink
import com.heymahi.companion.ui.theme.NeonPurple
import com.heymahi.companion.ui.theme.NeonRed
import com.heymahi.companion.ui.theme.TextPrimary
import com.heymahi.companion.ui.theme.TextSecondary
import com.heymahi.companion.ui.theme.TextSub
import com.heymahi.companion.viewmodel.MainViewModel

@Composable
fun MahiCompanionScreen(
    viewModel: MainViewModel,
    onRequestMicrophonePermission: () -> Unit
) {
    val isCallActive by viewModel.isCallActive.collectAsState()
    val isConnecting by viewModel.isConnecting.collectAsState()
    val isMuted by viewModel.isMuted.collectAsState()
    val isSpeaking by viewModel.isSpeaking.collectAsState()
    val micLevel by viewModel.micLevel.collectAsState()
    val outputLevel by viewModel.outputLevel.collectAsState()
    val currentExpression by viewModel.currentExpression.collectAsState()
    val currentImageUrl by viewModel.currentImageUrl.collectAsState()
    val userTranscription by viewModel.userTranscription.collectAsState()
    val mahiTranscription by viewModel.mahiTranscription.collectAsState()
    val isStudyMode by viewModel.isStudyMode.collectAsState()
    val selectedSubject by viewModel.selectedSubject.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.dismissError()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // TOP BAR
            TopAppBar(
                isStudyMode = isStudyMode,
                subjectIcon = selectedSubject.icon,
                onToggleStudyMode = { viewModel.toggleStudyMode(!isStudyMode) },
                onOpenStudyHub = { viewModel.setStudyHubOpen(true) },
                onOpenChat = { viewModel.setChatDrawerOpen(true) },
                onOpenSettings = { viewModel.setSettingsOpen(true) }
            )

            // AVATAR & TRANSCRIPTION CENTER STAGE
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                MahiAvatar(
                    expression = currentExpression,
                    imageUrl = currentImageUrl,
                    isSpeaking = isSpeaking,
                    outputLevel = outputLevel,
                    micLevel = micLevel,
                    isCallActive = isCallActive
                )

                Spacer(modifier = Modifier.height(18.dp))

                TranscriptionCard(
                    userText = userTranscription,
                    mahiText = mahiTranscription,
                    isSpeaking = isSpeaking,
                    isConnecting = isConnecting
                )
            }

            // BOTTOM CONTROLS SECTION
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Quick Suggestion Chips (one-tap voice prompts)
                QuickPromptChips(
                    isStudyMode = isStudyMode,
                    onPromptSelected = { prompt ->
                        if (!isCallActive) {
                            viewModel.sendTextMessage(prompt)
                            viewModel.setChatDrawerOpen(true)
                        } else {
                            viewModel.sendTextMessage(prompt)
                        }
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Action Buttons Row
                ControlsBar(
                    isCallActive = isCallActive,
                    isConnecting = isConnecting,
                    isMuted = isMuted,
                    onCallToggle = {
                        if (isCallActive) {
                            viewModel.endCall()
                        } else {
                            onRequestMicrophonePermission()
                            viewModel.startCall()
                        }
                    },
                    onMuteToggle = { viewModel.toggleMute() },
                    onStudyHubClick = { viewModel.setStudyHubOpen(true) }
                )
            }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 80.dp)
        )
    }
}

@Composable
private fun TopAppBar(
    isStudyMode: Boolean,
    subjectIcon: String,
    onToggleStudyMode: () -> Unit,
    onOpenStudyHub: () -> Unit,
    onOpenChat: () -> Unit,
    onOpenSettings: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Logo & Status Dot
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .clip(CircleShape)
                .background(DarkSurface)
                .border(1.dp, BorderPurple, CircleShape)
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(NeonGreen)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Mahi AI",
                color = TextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // Center: Study Mode Pill
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .clip(CircleShape)
                .background(if (isStudyMode) NeonPurple.copy(alpha = 0.25f) else DarkSurface)
                .border(1.dp, if (isStudyMode) NeonPurple else BorderPurple, CircleShape)
                .clickable { onToggleStudyMode() }
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Text(text = subjectIcon, fontSize = 13.sp)
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (isStudyMode) "Study ON" else "Normal Mode",
                color = if (isStudyMode) NeonPurpleLight else TextSecondary,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        // Right Actions: Chat & Settings
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(
                onClick = onOpenChat,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(DarkSurface)
                    .border(1.dp, BorderPurple, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.Chat,
                    contentDescription = "Chat",
                    tint = TextPrimary,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = onOpenSettings,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(DarkSurface)
                    .border(1.dp, BorderPurple, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = TextPrimary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
private fun QuickPromptChips(
    isStudyMode: Boolean,
    onPromptSelected: (String) -> Unit
) {
    val prompts = if (isStudyMode) {
        listOf(
            "Explain this concept simply 💡",
            "Quiz me with 3 questions 🎯",
            "Give me formula cheat sheet ⚡",
            "Solve step-by-step 📝"
        )
    } else {
        listOf(
            "Hey Mahi, kaise ho? 😊",
            "Tell me a fun story ✨",
            "Sing a song for me 🎵",
            "What can you do? 💫"
        )
    }

    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        items(prompts) { prompt ->
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(DarkSurface)
                    .border(1.dp, BorderPurple.copy(alpha = 0.6f), RoundedCornerShape(16.dp))
                    .clickable { onPromptSelected(prompt) }
                    .padding(horizontal = 14.dp, vertical = 8.dp)
            ) {
                Text(
                    text = prompt,
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
private fun ControlsBar(
    isCallActive: Boolean,
    isConnecting: Boolean,
    isMuted: Boolean,
    onCallToggle: () -> Unit,
    onMuteToggle: () -> Unit,
    onStudyHubClick: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val glowScale by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.04f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glowScale"
    )

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Mute Microphone Button
        IconButton(
            onClick = onMuteToggle,
            enabled = isCallActive,
            modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(if (isMuted) NeonRed.copy(alpha = 0.2f) else DarkSurface)
                .border(1.dp, if (isMuted) NeonRed else BorderPurple, CircleShape)
        ) {
            Icon(
                imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                contentDescription = if (isMuted) "Unmute" else "Mute",
                tint = if (isMuted) NeonRed else TextPrimary,
                modifier = Modifier.size(24.dp)
            )
        }

        // Main Glow Call Button (Call Start / Call End)
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .scale(if (isCallActive || isConnecting) glowScale else 1f)
                .clip(RoundedCornerShape(32.dp))
                .background(
                    if (isCallActive) {
                        Brush.horizontalGradient(listOf(NeonRed, Color(0xFFDC2626)))
                    } else {
                        Brush.horizontalGradient(listOf(NeonPurple, NeonPink))
                    }
                )
                .clickable { onCallToggle() }
                .padding(horizontal = 28.dp, vertical = 16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                if (isConnecting) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Connecting...",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                } else if (isCallActive) {
                    Icon(
                        imageVector = Icons.Default.CallEnd,
                        contentDescription = "End Call",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "End Call",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = "Start Voice Call",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Start Voice Call",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Study Hub Dialog Button
        IconButton(
            onClick = onStudyHubClick,
            modifier = Modifier
                .size(54.dp)
                .clip(CircleShape)
                .background(DarkSurface)
                .border(1.dp, BorderPurple, CircleShape)
        ) {
            Icon(
                imageVector = Icons.Default.School,
                contentDescription = "Study Hub",
                tint = NeonPurpleLight,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
