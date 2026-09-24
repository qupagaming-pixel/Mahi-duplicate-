package com.heymahi.companion.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.heymahi.companion.data.MahiExpression
import com.heymahi.companion.ui.theme.BorderPurple
import com.heymahi.companion.ui.theme.DarkSurface
import com.heymahi.companion.ui.theme.NeonPink
import com.heymahi.companion.ui.theme.NeonPurple
import com.heymahi.companion.ui.theme.TextPrimary
import com.heymahi.companion.ui.theme.TextSecondary
import kotlinx.coroutines.delay
import kotlin.random.Random

@Composable
fun MahiAvatar(
    expression: MahiExpression,
    imageUrl: String,
    isSpeaking: Boolean,
    outputLevel: Float,
    micLevel: Float,
    isCallActive: Boolean,
    modifier: Modifier = Modifier
) {
    // Lip-sync talking state
    var isMouthOpen by remember { mutableStateOf(false) }

    // Blink state
    var isBlinking by remember { mutableStateOf(false) }

    // Natural periodic blinking loop (every 2.5 - 5 seconds, blink for 150ms)
    LaunchedEffect(Unit) {
        while (true) {
            val waitTime = Random.nextLong(2500, 5000)
            delay(waitTime)
            isBlinking = true
            delay(150)
            isBlinking = false
        }
    }

    // Lip sync alternating mouth loop when Mahi is speaking
    LaunchedEffect(isSpeaking, outputLevel) {
        if (isSpeaking && outputLevel > 0.08f) {
            while (isSpeaking) {
                isMouthOpen = !isMouthOpen
                delay(140)
            }
        } else {
            isMouthOpen = false
        }
    }

    // Determine current visual frame
    val displayedImageUrl = when {
        isBlinking -> MahiExpression.EYES_CLOSED_URL
        isMouthOpen && isSpeaking -> MahiExpression.MOUTH_OPEN_URL
        imageUrl.isNotBlank() -> imageUrl
        else -> expression.imageUrl
    }

    // Audio reactive pulse aura scale
    val activeLevel = if (isSpeaking) outputLevel else if (isCallActive) micLevel else 0f
    val pulseScale = 1.0f + (activeLevel * 0.15f)

    // Gentle ambient breathing animation
    val infiniteTransition = rememberInfiniteTransition(label = "breathing")
    val breathingScale by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.02f,
        animationSpec = infiniteRepeatable(
            animation = tween(2800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "breathingScale"
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier.fillMaxWidth()
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .aspectRatio(0.88f)
                .scale(breathingScale * pulseScale)
        ) {
            // Neon Glow Aura
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(8.dp)
                    .clip(RoundedCornerShape(36.dp))
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                if (isSpeaking) NeonPink.copy(alpha = 0.35f) else NeonPurple.copy(alpha = 0.25f),
                                Color.Transparent
                            )
                        )
                    )
            )

            // Outer Glowing Frame
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(32.dp))
                    .border(
                        width = 2.dp,
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                if (isSpeaking) NeonPink else NeonPurple,
                                BorderPurple,
                                Color.Transparent
                            )
                        ),
                        shape = RoundedCornerShape(32.dp)
                    )
                    .background(DarkSurface)
            ) {
                // Main Anime Girl Image
                AsyncImage(
                    model = displayedImageUrl,
                    contentDescription = "Mahi AI Companion",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(32.dp))
                )

                // Talking Waveform Indicator (top right)
                if (isSpeaking) {
                    AudioWaveIndicator(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(16.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Emotion Badge Pill
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
            modifier = Modifier
                .clip(CircleShape)
                .background(Color(0xFF140826))
                .border(1.dp, BorderPurple, CircleShape)
                .padding(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Text(
                text = expression.emoji,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = expression.displayName,
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun AudioWaveIndicator(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "wave")
    val bar1 by infiniteTransition.animateFloat(
        initialValue = 6f, targetValue = 20f,
        animationSpec = infiniteRepeatable(tween(300, easing = LinearEasing), RepeatMode.Reverse),
        label = "b1"
    )
    val bar2 by infiniteTransition.animateFloat(
        initialValue = 18f, targetValue = 8f,
        animationSpec = infiniteRepeatable(tween(360, easing = LinearEasing), RepeatMode.Reverse),
        label = "b2"
    )
    val bar3 by infiniteTransition.animateFloat(
        initialValue = 10f, targetValue = 24f,
        animationSpec = infiniteRepeatable(tween(260, easing = LinearEasing), RepeatMode.Reverse),
        label = "b3"
    )

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp),
        modifier = modifier
            .clip(CircleShape)
            .background(Color.Black.copy(alpha = 0.6f))
            .padding(horizontal = 8.dp, vertical = 6.dp)
    ) {
        Box(modifier = Modifier.width(3.dp).height(bar1.dp).background(NeonPink, CircleShape))
        Box(modifier = Modifier.width(3.dp).height(bar2.dp).background(NeonPurple, CircleShape))
        Box(modifier = Modifier.width(3.dp).height(bar3.dp).background(NeonPink, CircleShape))
    }
}
