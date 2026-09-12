plugins {
 id("com.android.application")
 id("org.jetbrains.kotlin.android")
 id("org.jetbrains.kotlin.plugin.compose")
}
android {
 namespace = "org.mysteryatlas"
 compileSdk = 36
 defaultConfig {
  applicationId = "org.mysteryatlas.prototype"
  minSdk = 26
  targetSdk = 36
  versionCode = 2
  versionName = "0.2.0"
  testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
 }
 buildFeatures { compose = true; buildConfig = true }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
 kotlinOptions { jvmTarget = "17" }
 buildTypes {
  debug { applicationIdSuffix = ".v2" }
  release { applicationIdSuffix = ".v2"; isMinifyEnabled = false }
 }
}
dependencies {
 implementation(platform("androidx.compose:compose-bom:2025.08.01"))
 implementation("androidx.activity:activity-compose:1.10.1")
 implementation("androidx.compose.material3:material3")
 implementation("androidx.compose.ui:ui-tooling-preview")
 implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.2")
 implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.2")
 implementation("androidx.datastore:datastore-preferences:1.1.7")
 debugImplementation("androidx.compose.ui:ui-tooling")
 androidTestImplementation(platform("androidx.compose:compose-bom:2025.08.01"))
 androidTestImplementation("androidx.compose.ui:ui-test-junit4")
 androidTestImplementation("androidx.test:runner:1.6.2")
 androidTestImplementation("androidx.test.ext:junit:1.2.1")
 debugImplementation("androidx.compose.ui:ui-test-manifest")
}
