package org.mysteryatlas
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import org.mysteryatlas.ui.*
class MainActivity:ComponentActivity() {
 override fun onCreate(savedInstanceState:Bundle?) {super.onCreate(savedInstanceState);enableEdgeToEdge();setContent {AtlasTheme {AtlasApp(forceError=BuildConfig.DEBUG&&intent.getBooleanExtra("qa_error",false))}}}
}
