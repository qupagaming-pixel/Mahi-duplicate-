package com.heymahi.companion.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.heymahi.companion.gemini.GeminiRestClient
import com.heymahi.companion.ui.theme.BorderPurple
import com.heymahi.companion.ui.theme.DarkBackground
import com.heymahi.companion.ui.theme.DarkSurface
import com.heymahi.companion.ui.theme.DarkSurfaceVariant
import com.heymahi.companion.ui.theme.NeonGreen
import com.heymahi.companion.ui.theme.NeonPink
import com.heymahi.companion.ui.theme.NeonPurple
import com.heymahi.companion.ui.theme.NeonPurpleLight
import com.heymahi.companion.ui.theme.NeonRed
import com.heymahi.companion.ui.theme.TextPrimary
import com.heymahi.companion.ui.theme.TextSecondary
import com.heymahi.companion.ui.theme.TextSub
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsDialog(
    userName: String,
    apiKey: String,
    onSaveName: (String) -> Unit,
    onSaveApiKey: (String) -> Unit,
    onClearMemory: () -> Unit,
    onResetOnboarding: () -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scrollState = rememberScrollState()

    var editableName by remember { mutableStateOf(userName) }
    var editableKey by remember { mutableStateOf(apiKey) }
    var isKeyVisible by remember { mutableStateOf(false) }

    var isVerifyingKey by remember { mutableStateOf(false) }
    var verificationStatus by remember { mutableStateOf<String?>(null) }
    var isKeyValid by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = DarkBackground,
        dragHandle = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f)
                .background(DarkBackground)
                .padding(20.dp)
                .verticalScroll(scrollState)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(NeonPurple.copy(alpha = 0.2f))
                            .border(1.dp, NeonPurple, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = NeonPurpleLight)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "Settings",
                        color = TextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = TextPrimary)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // User Name Section
            Text(
                text = "Your Profile",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = editableName,
                onValueChange = {
                    editableName = it
                    onSaveName(it)
                },
                placeholder = { Text("Your nickname", color = TextSub) },
                leadingIcon = {
                    Icon(Icons.Default.Person, contentDescription = "Name", tint = NeonPurpleLight)
                },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = NeonPurple,
                    unfocusedBorderColor = BorderPurple,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Gemini API Key Section
            Text(
                text = "Gemini API Key",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = editableKey,
                onValueChange = {
                    editableKey = it
                    verificationStatus = null
                    onSaveApiKey(it)
                },
                placeholder = { Text("Paste AIzaSy... API key here", color = TextSub) },
                leadingIcon = {
                    Icon(Icons.Default.Key, contentDescription = "API Key", tint = NeonPurpleLight)
                },
                trailingIcon = {
                    IconButton(onClick = { isKeyVisible = !isKeyVisible }) {
                        Icon(
                            imageVector = if (isKeyVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Toggle Visibility",
                            tint = TextSub
                        )
                    }
                },
                visualTransformation = if (isKeyVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = NeonPurple,
                    unfocusedBorderColor = BorderPurple,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            )

            if (verificationStatus != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (isKeyValid) {
                        Icon(Icons.Default.CheckCircle, contentDescription = "Valid", tint = NeonGreen, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = verificationStatus ?: "", color = NeonGreen, fontSize = 12.sp)
                    } else {
                        Text(text = verificationStatus ?: "", color = NeonRed, fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Verify Key Button
            Button(
                onClick = {
                    if (editableKey.isBlank()) {
                        verificationStatus = "Please enter an API Key first."
                        isKeyValid = false
                        return@Button
                    }
                    isVerifyingKey = true
                    verificationStatus = null
                    scope.launch {
                        val client = GeminiRestClient(editableKey)
                        val res = client.validateApiKey(editableKey)
                        isVerifyingKey = false
                        res.onSuccess {
                            isKeyValid = true
                            verificationStatus = "API Key is valid and active!"
                            onSaveApiKey(editableKey)
                        }.onFailure {
                            isKeyValid = false
                            verificationStatus = it.message ?: "Verification failed."
                        }
                    }
                },
                enabled = !isVerifyingKey,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DarkSurfaceVariant),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, BorderPurple, RoundedCornerShape(12.dp))
            ) {
                if (isVerifyingKey) {
                    CircularProgressIndicator(color = NeonPurpleLight, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Verifying Key...", color = NeonPurpleLight, fontSize = 13.sp)
                } else {
                    Text("Test & Verify API Key", color = NeonPurpleLight, fontSize = 13.sp)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Useful Links
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(DarkSurface)
                        .border(1.dp, BorderPurple, RoundedCornerShape(12.dp))
                        .clickable {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://aistudio.google.com/app/apikey"))
                            context.startActivity(intent)
                        }
                        .padding(10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Get Free Key", color = NeonPurpleLight, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.OpenInNew, contentDescription = "Open", tint = NeonPurpleLight, modifier = Modifier.size(13.dp))
                    }
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(DarkSurface)
                        .border(1.dp, BorderPurple, RoundedCornerShape(12.dp))
                        .clickable {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://youtube.com/shorts/vOtGNDhPNC0?si=wzqaazklivRhdbnG"))
                            context.startActivity(intent)
                        }
                        .padding(10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Watch", tint = NeonPink, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Setup Video", color = NeonPink, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Actions: Clear Memory & Reset Onboarding
            Text(
                text = "Data & Privacy",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurface)
                    .border(1.dp, BorderPurple, RoundedCornerShape(14.dp))
                    .clickable {
                        onClearMemory()
                        onDismiss()
                    }
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.DeleteOutline, contentDescription = "Clear", tint = TextSub, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Clear Conversation Memory", color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    Text("Clears recent chat transcriptions and restarts conversation", color = TextSub, fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurface)
                    .border(1.dp, BorderPurple, RoundedCornerShape(14.dp))
                    .clickable { onResetOnboarding() }
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = NeonRed, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Reset App Setup", color = NeonRed, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    Text("Clears stored credentials and opens welcome screen", color = TextSub, fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // App Version & About
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Hey Mahi Native Android • v1.0.0",
                    color = TextSub,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Pure Kotlin • Jetpack Compose • Gemini Live Voice",
                    color = TextSub.copy(alpha = 0.7f),
                    fontSize = 11.sp
                )
            }
        }
    }
}
