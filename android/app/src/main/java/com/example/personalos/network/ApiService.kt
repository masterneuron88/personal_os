package com.example.personalos.network

import com.example.personalos.auth.LoginRequest
import com.example.personalos.auth.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PATCH
import retrofit2.http.Path

interface ApiService {

    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("/routines")
    suspend fun getRoutineItems(
        @Header("Authorization") token: String
    ): Response<List<RoutineItem>>

    @PATCH("/routines/{itemId}")
    suspend fun updateRoutineStatus(
        @Header("Authorization") token: String,
        @Path("itemId") itemId: String,
        @Body body: StatusUpdate
    ): Response<RoutineItem>

}