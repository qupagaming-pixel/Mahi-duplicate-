package com.heymahi.companion.data

/**
 * Mahi's emotional spectrum and visual expressions
 */
enum class MahiExpression(
    val id: String,
    val displayName: String,
    val emoji: String,
    val imageUrl: String
) {
    HAPPY("happy", "Happy", "😊", "https://i.ibb.co/WWHh1m2V/hay.jpg"),
    THINKING("thinking", "Thinking", "💭", "https://i.ibb.co/Mx8HBnh3/thinking.jpg"),
    WINK("wink", "Playful", "😉", "https://i.ibb.co/fzg90pKT/wink.jpg"),
    BLUSH("blush", "Shy", "😳", "https://i.ibb.co/k6zJ0Rby/blush.jpg"),
    SAD("sad", "Sad", "🥺", "https://i.ibb.co/rK9HRgg5/nervous2.jpg"),
    HEARTBROKEN("heartbroken", "Heartbroken", "💔", "https://i.ibb.co/rK9HRgg5/nervous2.jpg"),
    POUT("pout", "Pouting", "😤", "https://i.ibb.co/rBPqMhQ/pout.jpg"),
    SMIRK("smirk", "Sassy", "😏", "https://i.ibb.co/VWnmW51k/smirk.jpg"),
    HEART_EYES("heart_eyes", "In Love", "😍", "https://i.ibb.co/mVMvKSpt/heart-eyes.jpg"),
    STARRY_EYES("starry_eyes", "Amazed", "🤩", "https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg"),
    CONFUSED("confused", "Confused", "🤔", "https://i.ibb.co/LX29jXmW/nervous1.jpg"),
    ANGRY("angry", "Angry", "😡", "https://i.ibb.co/23v3Jh0y/angry.jpg"),
    CHILL("chill", "Relaxed", "✨", "https://i.ibb.co/BVSHQHBB/hair-swirl.jpg");

    companion object {
        const val DEFAULT_IMAGE_URL = "https://i.ibb.co/WWHh1m2V/hay.jpg"
        const val MOUTH_OPEN_URL = "https://i.ibb.co/8DftmPBR/mouth-open.jpg"
        const val EYES_CLOSED_URL = "https://i.ibb.co/3gGMyVH/eyes-closed.jpg"

        fun fromString(value: String): MahiExpression {
            val normalized = value.lowercase().trim()
            return values().firstOrNull { it.id == normalized || it.name.lowercase() == normalized }
                ?: HAPPY
        }
    }
}

/**
 * Study subjects supported by Mahi's Study Mode
 */
enum class StudySubject(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: String,
    val topics: List<String>
) {
    SCHOOL(
        id = "school",
        title = "School & Boards (Class 1-12)",
        subtitle = "CBSE, ICSE, State Boards - Maths, Science, English",
        icon = "🏫",
        topics = listOf("Class 10/12 Board Exam Tips", "Calculus & Algebra", "NCERT Science Breakdown", "English Grammar & Essays")
    ),
    COMPETITIVE(
        id = "competitive",
        title = "Competitive Exams (JEE / NEET / UPSC)",
        subtitle = "Formulas, Problem Solving & Exam Shortcuts",
        icon = "⚡",
        topics = listOf("JEE Physics & Physical Chem", "NEET Biology Tricks", "UPSC General Studies", "Aptitude & Logical Reasoning")
    ),
    CODING(
        id = "coding",
        title = "CS & Software Engineering",
        subtitle = "Python, Java, DSA, Web Dev, AI & System Design",
        icon = "💻",
        topics = listOf("Data Structures & Algorithms", "Python for Beginners", "Full Stack Web Dev", "AI & Machine Learning")
    ),
    LANGUAGES(
        id = "languages",
        title = "Languages & Soft Skills",
        subtitle = "Fluent English Speaking, Vocab, Public Speaking",
        icon = "🗣️",
        topics = listOf("Daily English Conversation", "Grammar Correction", "Job Interview Prep", "Vocabulary Builder")
    ),
    GENERAL(
        id = "general",
        title = "Curiosity & General Knowledge",
        subtitle = "Astronomy, Quantum Physics, World History & Economics",
        icon = "🌍",
        topics = listOf("Quantum Mechanics Simple", "World History Timeline", "Financial Literacy", "Cosmology & Black Holes")
    );

    companion object {
        fun fromId(id: String): StudySubject {
            return values().firstOrNull { it.id == id } ?: SCHOOL
        }
    }
}

/**
 * Interactive Study Flashcard
 */
data class FlashcardItem(
    val id: String,
    val topic: String,
    val question: String,
    val answer: String
)

/**
 * In-memory and persistent chat message
 */
data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val sender: String, // "user" or "mahi"
    val text: String,
    val time: String,
    val isAudio: Boolean = false
)
