package com.heymahi.companion.data

import android.content.Context
import android.content.SharedPreferences

/**
 * Manages local persistent settings and credentials for Hey Mahi
 */
class PreferencesManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var userName: String
        get() = prefs.getString(KEY_USER_NAME, "Dost") ?: "Dost"
        set(value) = prefs.edit().putString(KEY_USER_NAME, value.ifBlank { "Dost" }).apply()

    var geminiApiKey: String
        get() = prefs.getString(KEY_API_KEY, "") ?: ""
        set(value) = prefs.edit().putString(KEY_API_KEY, value.trim()).apply()

    var isOnboardingCompleted: Boolean
        get() = prefs.getBoolean(KEY_ONBOARDING_COMPLETED, false) && geminiApiKey.isNotBlank()
        set(value) = prefs.edit().putBoolean(KEY_ONBOARDING_COMPLETED, value).apply()

    var isStudyMode: Boolean
        get() = prefs.getBoolean(KEY_STUDY_MODE, false)
        set(value) = prefs.edit().putBoolean(KEY_STUDY_MODE, value).apply()

    var studySubject: String
        get() = prefs.getString(KEY_STUDY_SUBJECT, StudySubject.SCHOOL.id) ?: StudySubject.SCHOOL.id
        set(value) = prefs.edit().putString(KEY_STUDY_SUBJECT, value).apply()

    var isWakeWordEnabled: Boolean
        get() = prefs.getBoolean(KEY_WAKE_WORD, true)
        set(value) = prefs.edit().putBoolean(KEY_WAKE_WORD, value).apply()

    fun clearAll() {
        prefs.edit().clear().apply()
    }

    fun clearApiKey() {
        prefs.edit().remove(KEY_API_KEY).putBoolean(KEY_ONBOARDING_COMPLETED, false).apply()
    }

    companion object {
        private const val PREFS_NAME = "hey_mahi_prefs"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_API_KEY = "gemini_api_key"
        private const val KEY_ONBOARDING_COMPLETED = "onboarding_completed"
        private const val KEY_STUDY_MODE = "study_mode"
        private const val KEY_STUDY_SUBJECT = "study_subject"
        private const val KEY_WAKE_WORD = "wake_word_enabled"
    }
}
