package com.example.personalos.ui.today

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.personalos.auth.AuthRepository
import com.example.personalos.network.RetrofitInstance
import com.example.personalos.network.RoutineItem
import com.example.personalos.network.StatusUpdate
import kotlinx.coroutines.launch

@Composable
fun RoutineItemCard(
    item: RoutineItem,
    onStatusChanged: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    fun updateStatus(newStatus: String) {
        android.util.Log.d("PersonalOS", "Button tapped: $newStatus for item ${item.id}")
        scope.launch {
            val token = AuthRepository.ensureLoggedIn(context)
            android.util.Log.d("PersonalOS", "Token: $token")
            if (token == null) return@launch

            try {
                val response = RetrofitInstance.api.updateRoutineStatus(
                    "Bearer $token",
                    item.id,
                    StatusUpdate(newStatus)
                )
                android.util.Log.d("PersonalOS", "Response code: ${response.code()}")
                if (response.isSuccessful) {
                    onStatusChanged()
                }
            } catch (e: Exception) {
                android.util.Log.e("PersonalOS", "Update failed", e)
            }
        }
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(1.dp, Color.LightGray)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {

            Text(text = item.title)
            Text(text = item.domain)
            Text(text = "Status: ${item.status}")

            item.scheduledTime?.let { time ->
                Text(text = time)
            }

            item.comments?.let { comment ->
                Text(text = comment)
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                OutlinedButton(onClick = { updateStatus("done") }) {
                    Text("Done")
                }
                OutlinedButton(onClick = { updateStatus("postponed") }) {
                    Text("Postpone")
                }
            }
        }
    }
}