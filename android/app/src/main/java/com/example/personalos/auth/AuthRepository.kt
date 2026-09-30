package com.example.personalos.auth

import android.content.Context
import com.example.personalos.network.RetrofitInstance
import com.example.personalos.BuildConfig

object AuthRepository {


    private val EMAIL = BuildConfig.PERSONALOS_EMAIL
    private val PASSWORD = BuildConfig.PERSONALOS_PASSWORD

    suspend fun ensureLoggedIn(context: Context): String? {
        val existingToken = TokenManager.getToken(context)
        if (existingToken != null) {
            return existingToken
        }

        return try {
            val response = RetrofitInstance.api.login(LoginRequest(EMAIL, PASSWORD))
            if (response.isSuccessful) {
                val token = response.body()?.accessToken
                if (token != null) {
                    TokenManager.saveToken(context, token)
                }
                token
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}