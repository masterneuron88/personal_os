package com.example.personalos.auth

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    @com.google.gson.annotations.SerializedName("access_token")
    val accessToken: String
)