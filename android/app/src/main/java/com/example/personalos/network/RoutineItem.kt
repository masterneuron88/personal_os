package com.example.personalos.network

import com.google.gson.annotations.SerializedName

data class RoutineItem(
    val id: String,
    val title: String,
    val domain: String,
    val status: String,
    val comments: String?,
    @SerializedName("scheduled_time")
    val scheduledTime: String?,
    @SerializedName("alarm_lead_minutes")
    val alarmLeadMinutes: Int?
)

data class StatusUpdate(
    val status: String
)