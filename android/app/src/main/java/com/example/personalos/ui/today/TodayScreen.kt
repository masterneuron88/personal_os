package com.example.personalos.ui.today

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.personalos.auth.AuthRepository
import com.example.personalos.network.RetrofitInstance
import com.example.personalos.network.RoutineItem

@Composable
fun TodayScreen(modifier: Modifier = Modifier) {
    var items by remember { mutableStateOf<List<RoutineItem>>(emptyList()) }
    var statusMessage by remember { mutableStateOf("Loading...") }
    val context = LocalContext.current

    var refreshTrigger by remember { mutableStateOf(0) }

    LaunchedEffect(refreshTrigger) {
        val token = AuthRepository.ensureLoggedIn(context)
        if (token == null) {
            statusMessage = "Login failed"
            return@LaunchedEffect
        }

        try {
            val response = RetrofitInstance.api.getRoutineItems("Bearer $token")
            if (response.isSuccessful) {
                items = response.body() ?: emptyList()
                statusMessage = if (items.isEmpty()) "No items for today" else ""
            } else {
                statusMessage = "Server error: ${response.code()}"
            }
        } catch (e: Exception) {
            statusMessage = "Failed to connect: ${e.message}"
        }
    }

    if (statusMessage.isNotEmpty()) {
        Text(text = statusMessage, modifier = modifier.padding(16.dp))
    } else {
        LazyColumn(
            modifier = modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(items) { item ->
                RoutineItemCard(
                    item = item,
                    onStatusChanged = { refreshTrigger++ },
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
            }
        }
    }
}