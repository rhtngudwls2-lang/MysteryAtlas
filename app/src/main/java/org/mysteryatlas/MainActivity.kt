package org.mysteryatlas
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.SystemBarStyle
import org.mysteryatlas.ui.*
class MainActivity:ComponentActivity() {
 override fun onCreate(savedInstanceState:Bundle?) {super.onCreate(savedInstanceState);enableEdgeToEdge(statusBarStyle=SystemBarStyle.dark(android.graphics.Color.TRANSPARENT),navigationBarStyle=SystemBarStyle.dark(android.graphics.Color.TRANSPARENT));setContent {AtlasTheme {AtlasApp(forceError=BuildConfig.DEBUG&&intent.getBooleanExtra("qa_error",false))}}}
}
