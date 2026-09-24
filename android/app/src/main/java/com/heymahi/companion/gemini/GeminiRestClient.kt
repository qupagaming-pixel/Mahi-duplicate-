package com.heymahi.companion.gemini

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * REST Client for Gemini text generation and key validation.
 */
class GeminiRestClient(private val apiKey: String) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    suspend fun generateReply(
        prompt: String,
        userName: String,
        isStudyMode: Boolean,
        studySubject: String
    ): Result<String> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Result.failure(Exception("Gemini API key is required."))
        }

        val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey"
        val systemInstruction = GeminiLiveClient.buildSystemInstruction(userName, isStudyMode, studySubject)

        try {
            val root = JSONObject()

            val sysInstructionObj = JSONObject()
            val sysParts = JSONArray().apply {
                put(JSONObject().put("text", systemInstruction))
            }
            sysInstructionObj.put("parts", sysParts)
            root.put("systemInstruction", sysInstructionObj)

            val contentsArray = JSONArray()
            val userTurn = JSONObject()
            userTurn.put("role", "user")
            val userParts = JSONArray().apply {
                put(JSONObject().put("text", prompt))
            }
            userTurn.put("parts", userParts)
            contentsArray.put(userTurn)
            root.put("contents", contentsArray)

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val body = root.toString().toRequestBody(mediaType)
            val request = Request.Builder().url(url).post(body).build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string().orEmpty()

            if (!response.isSuccessful) {
                val isQuota = response.code == 429 || responseBody.contains("quota", ignoreCase = true)
                val errMsg = if (isQuota) {
                    "⚠️ API Quota limit exceeded. Please try another key."
                } else {
                    "Error: ${response.code} - ${response.message}"
                }
                return@withContext Result.failure(Exception(errMsg))
            }

            val respJson = JSONObject(responseBody)
            val candidates = respJson.optJSONArray("candidates")
            if (candidates != null && candidates.length() > 0) {
                val candidate = candidates.getJSONObject(0)
                val content = candidate.optJSONObject("content")
                val parts = content?.optJSONArray("parts")
                if (parts != null && parts.length() > 0) {
                    val reply = parts.getJSONObject(0).optString("text", "")
                    return@withContext Result.success(reply)
                }
            }
            Result.success("Arey... mujhe theek se samajh nahi aaya! Phir se bologe?")
        } catch (e: Exception) {
            Log.e(TAG, "Error calling Gemini REST API", e)
            Result.failure(e)
        }
    }

    suspend fun validateApiKey(keyToTest: String): Result<Boolean> = withContext(Dispatchers.IO) {
        val testUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=$keyToTest"
        try {
            val request = Request.Builder().url(testUrl).get().build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(true)
            } else {
                val body = response.body?.string().orEmpty()
                val isQuota = response.code == 429 || body.contains("quota", ignoreCase = true)
                if (isQuota) {
                    Result.failure(Exception("Quota limit exceeded on this key."))
                } else {
                    Result.failure(Exception("Invalid API key (Status ${response.code})."))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    companion object {
        private const val TAG = "GeminiRestClient"
    }
}
