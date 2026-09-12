package org.mysteryatlas.ui
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.sp
val Ink=Color(0xFF0D1721)
val Panel=Color(0xFF15232E)
val Ivory=Color(0xFFF1EDE3)
val Amber=Color(0xFFD7AC65)
val Muted=Color(0xFFA2B0B7)
@Composable fun AtlasTheme(content:@Composable ()->Unit) {
 MaterialTheme(colorScheme=darkColorScheme(primary=Amber,onPrimary=Ink,background=Ink,onBackground=Ivory,surface=Panel,onSurface=Ivory,secondary=Muted),typography=Typography(
 headlineLarge=TextStyle(fontFamily=FontFamily.Serif,fontSize=34.sp,lineHeight=40.sp),
 headlineMedium=TextStyle(fontFamily=FontFamily.Serif,fontSize=27.sp,lineHeight=34.sp),
 bodyLarge=TextStyle(fontSize=18.sp,lineHeight=30.sp),
 labelSmall=TextStyle(fontFamily=FontFamily.Monospace,fontSize=11.sp,letterSpacing=1.sp)
 ),content=content)
}
