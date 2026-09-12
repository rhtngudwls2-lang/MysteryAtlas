package org.mysteryatlas.ui
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
val Ink=Color(0xFF090F13)
val Panel=Color(0xFF121D24)
val Ivory=Color(0xFFF2EEE5)
val Amber=Color(0xFFD9AF68)
val Muted=Color(0xFFB7BFC5)
val Line=Color(0xFF2A363E)
@Composable fun AtlasTheme(content:@Composable ()->Unit){MaterialTheme(colorScheme=darkColorScheme(primary=Amber,onPrimary=Ink,background=Ink,onBackground=Ivory,surface=Panel,onSurface=Ivory,secondary=Muted,outline=Line),typography=Typography(
 headlineLarge=TextStyle(fontFamily=FontFamily.SansSerif,fontWeight=FontWeight.Bold,fontSize=30.sp,lineHeight=39.sp),
 headlineMedium=TextStyle(fontFamily=FontFamily.SansSerif,fontWeight=FontWeight.Bold,fontSize=25.sp,lineHeight=34.sp),
 titleLarge=TextStyle(fontWeight=FontWeight.Bold,fontSize=21.sp,lineHeight=29.sp),
 titleMedium=TextStyle(fontWeight=FontWeight.SemiBold,fontSize=18.sp,lineHeight=26.sp),
 bodyLarge=TextStyle(fontSize=17.sp,lineHeight=28.sp),bodyMedium=TextStyle(fontSize=15.sp,lineHeight=24.sp),
 labelLarge=TextStyle(fontWeight=FontWeight.SemiBold,fontSize=15.sp,lineHeight=21.sp),labelMedium=TextStyle(fontSize=14.sp,lineHeight=21.sp),labelSmall=TextStyle(fontSize=14.sp,lineHeight=21.sp)
 ),content=content)}
