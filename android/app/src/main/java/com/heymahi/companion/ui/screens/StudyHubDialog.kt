package com.heymahi.companion.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.heymahi.companion.data.FlashcardItem
import com.heymahi.companion.data.StudySubject
import com.heymahi.companion.ui.theme.BorderPurple
import com.heymahi.companion.ui.theme.DarkBackground
import com.heymahi.companion.ui.theme.DarkSurface
import com.heymahi.companion.ui.theme.DarkSurfaceVariant
import com.heymahi.companion.ui.theme.NeonGreen
import com.heymahi.companion.ui.theme.NeonPink
import com.heymahi.companion.ui.theme.NeonPurple
import com.heymahi.companion.ui.theme.NeonPurpleLight
import com.heymahi.companion.ui.theme.TextPrimary
import com.heymahi.companion.ui.theme.TextSecondary
import com.heymahi.companion.ui.theme.TextSub
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyHubDialog(
    isStudyMode: Boolean,
    selectedSubject: StudySubject,
    onToggleStudyMode: (Boolean) -> Unit,
    onSelectSubject: (StudySubject) -> Unit,
    onSendPrompt: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scrollState = rememberScrollState()

    // Pomodoro Timer State (25 mins = 1500 secs)
    var timerSeconds by remember { mutableIntStateOf(1500) }
    var isTimerRunning by remember { mutableStateOf(false) }

    LaunchedEffect(isTimerRunning) {
        while (isTimerRunning && timerSeconds > 0) {
            delay(1000)
            timerSeconds--
        }
        if (timerSeconds == 0) {
            isTimerRunning = false
        }
    }

    // Flashcards State
    val flashcards = remember(selectedSubject) {
        getSampleFlashcards(selectedSubject)
    }
    var cardIndex by remember { mutableIntStateOf(0) }
    var isAnswerRevealed by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = DarkBackground,
        dragHandle = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
                .background(DarkBackground)
                .padding(20.dp)
                .verticalScroll(scrollState)
        ) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(NeonPurple.copy(alpha = 0.2f))
                            .border(1.dp, NeonPurple, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.School, contentDescription = "Study", tint = NeonPurpleLight)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Mahi Study Hub",
                            color = TextPrimary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "AI Powered Learning Companion",
                            color = TextSub,
                            fontSize = 12.sp
                        )
                    }
                }

                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = TextPrimary)
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Study Mode Switch Banner
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(DarkSurface)
                    .border(1.dp, if (isStudyMode) NeonPurple else BorderPurple, RoundedCornerShape(20.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Active Study Mode",
                        color = TextPrimary,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Mahi focuses 100% on concepts, formulas & homework",
                        color = TextSub,
                        fontSize = 12.sp
                    )
                }
                Switch(
                    checked = isStudyMode,
                    onCheckedChange = { onToggleStudyMode(it) },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = NeonPurple,
                        uncheckedTrackColor = Color.DarkGray
                    )
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Subject Selector Tabs
            Text(
                text = "Select Your Focus Subject",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(10.dp))

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(StudySubject.values()) { subject ->
                    val isSelected = subject == selectedSubject
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (isSelected) NeonPurple.copy(alpha = 0.25f) else DarkSurface)
                            .border(1.dp, if (isSelected) NeonPurple else BorderPurple, RoundedCornerShape(16.dp))
                            .clickable {
                                onSelectSubject(subject)
                                cardIndex = 0
                                isAnswerRevealed = false
                            }
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = subject.icon, fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = subject.name.lowercase().replaceFirstChar { it.uppercase() },
                                color = if (isSelected) TextPrimary else TextSecondary,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Pomodoro Focus Timer Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(DarkSurface)
                    .border(1.dp, BorderPurple, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Timer, contentDescription = "Timer", tint = NeonPink, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Pomodoro Study Sprint",
                            color = TextPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Text(
                        text = "%02d:%02d".format(timerSeconds / 60, timerSeconds % 60),
                        color = NeonPink,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isTimerRunning) Color(0xFF3B132C) else Color(0xFF1B0F33))
                            .border(1.dp, if (isTimerRunning) NeonPink else NeonPurple, RoundedCornerShape(12.dp))
                            .clickable { isTimerRunning = !isTimerRunning }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                if (isTimerRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = "Start/Pause",
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isTimerRunning) "Pause" else "Start Sprint",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(DarkSurfaceVariant)
                            .border(1.dp, BorderPurple, RoundedCornerShape(12.dp))
                            .clickable {
                                isTimerRunning = false
                                timerSeconds = 1500
                            }
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = TextSub, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Interactive Flashcard Carousel
            if (flashcards.isNotEmpty()) {
                val currentCard = flashcards[cardIndex % flashcards.size]

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(DarkSurface)
                        .border(1.dp, BorderPurple, RoundedCornerShape(20.dp))
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Flashcard ${cardIndex + 1}/${flashcards.size} • ${currentCard.topic}",
                            color = NeonPurpleLight,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Tap to Flip",
                            color = TextSub,
                            fontSize = 11.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Card Body
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(130.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF1B0B33))
                            .border(1.dp, BorderPurple, RoundedCornerShape(14.dp))
                            .clickable { isAnswerRevealed = !isAnswerRevealed }
                            .padding(14.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        if (!isAnswerRevealed) {
                            Text(
                                text = "Q: ${currentCard.question}",
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                textAlign = TextAlign.Center
                            )
                        } else {
                            Text(
                                text = "A: ${currentCard.answer}",
                                color = NeonGreen,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Normal,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Next / Prev buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        IconButton(
                            onClick = {
                                if (cardIndex > 0) cardIndex--
                                isAnswerRevealed = false
                            },
                            enabled = cardIndex > 0
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Prev", tint = if (cardIndex > 0) TextPrimary else TextSub)
                        }

                        IconButton(
                            onClick = {
                                if (cardIndex < flashcards.size - 1) cardIndex++
                                isAnswerRevealed = false
                            },
                            enabled = cardIndex < flashcards.size - 1
                        ) {
                            Icon(Icons.Default.ArrowForward, contentDescription = "Next", tint = if (cardIndex < flashcards.size - 1) TextPrimary else TextSub)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Quick Ask Mahi Prompt Actions
            Text(
                text = "Ask Mahi Directly",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(10.dp))

            selectedSubject.topics.forEach { topic ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(DarkSurface)
                        .border(1.dp, BorderPurple, RoundedCornerShape(14.dp))
                        .clickable {
                            onSendPrompt("Mahi, please teach me about $topic with clear examples and formulas!")
                            onDismiss()
                        }
                        .padding(14.dp)
                ) {
                    Text(
                        text = "Teach me: $topic",
                        color = TextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

private fun getSampleFlashcards(subject: StudySubject): List<FlashcardItem> {
    return when (subject) {
        StudySubject.SCHOOL -> listOf(
            FlashcardItem("s1", "Physics", "What is Newton's Second Law?", "F = ma (Force = mass * acceleration). Rate of change of momentum is proportional to applied force."),
            FlashcardItem("s2", "Maths", "What is the quadratic formula?", "x = (-b ± √(b² - 4ac)) / (2a) for ax² + bx + c = 0."),
            FlashcardItem("s3", "Chemistry", "What is Avogadro's Number?", "6.022 × 10²³ particles per mole of substance.")
        )
        StudySubject.COMPETITIVE -> listOf(
            FlashcardItem("c1", "Physics", "What is Escape Velocity of Earth?", "ve = √(2gR) ≈ 11.2 km/s."),
            FlashcardItem("c2", "Chemistry", "What is Heisenberg Uncertainty Principle?", "Δx · Δp ≥ h / (4π). Position and momentum cannot be measured simultaneously with infinite precision."),
            FlashcardItem("c3", "Reasoning", "If today is Monday, what day is 61 days later?", "61 mod 7 = 5 days ahead of Monday = Saturday.")
        )
        StudySubject.CODING -> listOf(
            FlashcardItem("d1", "DSA", "What is time complexity of QuickSort?", "Average: O(N log N). Worst case: O(N²) when already sorted with bad pivot."),
            FlashcardItem("d2", "Java", "Difference between == and .equals()?", "== compares memory references. .equals() compares value equality."),
            FlashcardItem("d3", "System Design", "What is the CAP Theorem?", "A distributed system can only provide 2 of 3 guarantees: Consistency, Availability, and Partition Tolerance.")
        )
        StudySubject.LANGUAGES -> listOf(
            FlashcardItem("l1", "Vocabulary", "What does 'Ubiquitous' mean?", "Present, appearing, or found everywhere (e.g. smartphones are ubiquitous)."),
            FlashcardItem("l2", "Grammar", "Difference between 'Their', 'There', and 'They're'?", "'Their' = possession, 'There' = place, 'They're' = they are."),
            FlashcardItem("l3", "Idiom", "What does 'Bite the bullet' mean?", "To face a difficult situation with courage and fortitude.")
        )
        StudySubject.GENERAL -> listOf(
            FlashcardItem("g1", "Cosmology", "What is an Event Horizon?", "The boundary around a black hole beyond which nothing, not even light, can escape."),
            FlashcardItem("g2", "Economics", "What is Inflation?", "The rate at which the general level of prices for goods and services is rising."),
            FlashcardItem("g3", "History", "When was the Constitution of India adopted?", "Adopted on 26 Nov 1949 and came into effect on 26 Jan 1950.")
        )
    }
}
