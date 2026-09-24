package com.heymahi.companion.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.heymahi.companion.ui.theme.BorderPurple
import com.heymahi.companion.ui.theme.NeonGreen
import com.heymahi.companion.ui.theme.NeonPink
import com.heymahi.companion.ui.theme.NeonPurple
import com.heymahi.companion.ui.theme.TextPrimary
import com.heymahi.companion.ui.theme.TextSecondary
import com.heymahi.companion.ui.theme.TextSub

@Composable
fun TranscriptionCard(
    userText: String,
    mahiText: String,
    isSpeaking: Boolean,
    isConnecting: Boolean,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0xFF0F061F).copy(alpha = 0.85f))
            .border(1.dp, BorderPurple, RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        // Status Row
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(if (isSpeaking) NeonPink else if (isConnecting) NeonPurple else NeonGreen)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isSpeaking) "Mahi is speaking..." else if (isConnecting) "Connecting to Gemini..." else "Mahi Live",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // User text if available
        if (userText.isNotBlank()) {
            Text(
                text = "You: $userText",
                color = TextSub,
                fontSize = 13.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(4.dp))
        }

        // Mahi speech text
        Text(
            text = mahiText.ifBlank { "..." },
            color = TextPrimary,
            fontSize = 15.sp,
            lineHeight = 22.sp,
            fontWeight = FontWeight.Normal,
            maxLines = 4,
            overflow = TextOverflow.Ellipsis
        )
    }
}
