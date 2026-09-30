package com.example.personalos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.example.personalos.ui.theme.PersonalOSTheme
import com.example.personalos.ui.today.TodayScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PersonalOSTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    TodayScreen(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}