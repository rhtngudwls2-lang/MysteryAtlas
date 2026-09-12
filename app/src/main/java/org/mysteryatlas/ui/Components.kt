package org.mysteryatlas.ui

import android.graphics.BitmapFactory
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.withContext
import org.mysteryatlas.data.Story

fun tr(lang:String,ko:String,en:String)=if(lang=="ko")ko else en
@Composable fun Glyph(name:String,color:Color=Ivory,modifier:Modifier=Modifier){Canvas(modifier.size(24.dp)) {
 val w=size.width;val h=size.height;val s=2.dp.toPx()
 when(name){
  "search"->{drawCircle(color,w*.29f,Offset(w*.42f,h*.42f),style=Stroke(s));drawLine(color,Offset(w*.65f,h*.65f),Offset(w*.92f,h*.92f),s)}
  "saved","saved_filled"->{val p=Path().apply{moveTo(w*.23f,h*.12f);lineTo(w*.77f,h*.12f);lineTo(w*.77f,h*.91f);lineTo(w*.5f,h*.7f);lineTo(w*.23f,h*.91f);close()};if(name=="saved_filled")drawPath(p,color)else drawPath(p,color,style=Stroke(s))}
  "home"->{val p=Path().apply{moveTo(w*.12f,h*.46f);lineTo(w*.5f,h*.12f);lineTo(w*.88f,h*.46f);lineTo(w*.8f,h*.46f);lineTo(w*.8f,h*.88f);lineTo(w*.57f,h*.88f);lineTo(w*.57f,h*.64f);lineTo(w*.43f,h*.64f);lineTo(w*.43f,h*.88f);lineTo(w*.2f,h*.88f);lineTo(w*.2f,h*.46f);close()};drawPath(p,color,style=Stroke(s))}
  "explore","globe"->{drawCircle(color,w*.4f,Offset(w*.5f,h*.5f),style=Stroke(s));if(name=="explore"){val p=Path().apply{moveTo(w*.7f,h*.27f);lineTo(w*.57f,h*.57f);lineTo(w*.28f,h*.73f);lineTo(w*.43f,h*.43f);close()};drawPath(p,color,style=Stroke(s))}else{drawOval(color,topLeft=Offset(w*.31f,h*.1f),size=androidx.compose.ui.geometry.Size(w*.38f,h*.8f),style=Stroke(s*.6f));drawLine(color,Offset(w*.1f,h*.5f),Offset(w*.9f,h*.5f),s*.6f)}}
  "back"->{drawLine(color,Offset(w*.8f,h*.5f),Offset(w*.2f,h*.5f),s);drawLine(color,Offset(w*.2f,h*.5f),Offset(w*.48f,h*.22f),s);drawLine(color,Offset(w*.2f,h*.5f),Offset(w*.48f,h*.78f),s)}
  "arrow"->{drawLine(color,Offset(w*.15f,h*.5f),Offset(w*.85f,h*.5f),s);drawLine(color,Offset(w*.85f,h*.5f),Offset(w*.56f,h*.21f),s);drawLine(color,Offset(w*.85f,h*.5f),Offset(w*.56f,h*.79f),s)}
  "clock"->{drawCircle(color,w*.38f,Offset(w*.5f,h*.5f),style=Stroke(s));drawLine(color,Offset(w*.5f,h*.5f),Offset(w*.5f,h*.25f),s);drawLine(color,Offset(w*.5f,h*.5f),Offset(w*.67f,h*.57f),s)}
  else->{drawCircle(color,w*.35f,Offset(w*.5f,h*.5f),style=Stroke(s));drawCircle(color,w*.17f,Offset(w*.5f,h*.5f),style=Stroke(s))}
 }
}}
private data class Artwork(val bitmap:ImageBitmap?=null,val loading:Boolean=true)
@Composable fun Art(path:String,lang:String,modifier:Modifier=Modifier,description:String?=null){
 val context=LocalContext.current
 val art by produceState(Artwork(),path){
  value=Artwork()
  val bitmap=withContext(Dispatchers.IO){try{context.assets.open(path).use{BitmapFactory.decodeStream(it)?.asImageBitmap()}}catch(c:CancellationException){throw c}catch(_:Exception){null}}
  value=Artwork(bitmap,false)
 }
 Box(modifier.background(Panel).testTag(if(art.loading)"art_loading"else if(art.bitmap==null)"art_error"else"art_ready")) {
  val bitmap=art.bitmap
  if(bitmap!=null)Image(bitmap,contentDescription=description?:tr(lang,"재구성 이미지 · 실제 사건 사진이 아닙니다","Editorial illustration, not a photograph of the event"),contentScale=ContentScale.Crop,modifier=Modifier.matchParentSize())
  else Column(Modifier.matchParentSize().padding(8.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.Center){Glyph("globe",Muted,Modifier.size(32.dp));if(!art.loading)Text(tr(lang,"이미지를 표시할 수 없어요","Image unavailable"),color=Muted,style=MaterialTheme.typography.labelSmall)}
 }
}
fun sharedImageNote(story:Story,lang:String):String?=if(story.id in listOf("rohonc","phaistos"))tr(lang,"주제 공통 이미지 · 해당 유물의 모습이 아닙니다","Shared thematic illustration · not a depiction of this artifact")else null
@Composable fun Pill(text:String,color:Color=Amber){Surface(color=color.copy(alpha=.1f),shape=RoundedCornerShape(20.dp),border=BorderStroke(1.dp,color.copy(alpha=.4f))){Text(text,color=color,style=MaterialTheme.typography.labelSmall,modifier=Modifier.padding(horizontal=10.dp,vertical=4.dp))}}
@OptIn(ExperimentalLayoutApi::class)
@Composable fun StoryMeta(story:Story,lang:String){FlowRow(horizontalArrangement=Arrangement.spacedBy(7.dp),verticalArrangement=Arrangement.spacedBy(7.dp)){Pill(story.status.text(lang),Color(0xFFE1A6A0));Pill(story.country.text(lang),Muted);Pill(story.displayYear(lang),Muted)}}
@Composable fun SaveButton(story:Story,saved:Boolean,lang:String,onClick:()->Unit){IconButton(onClick=onClick,modifier=Modifier.testTag("save_${story.id}").semantics{selected=saved;contentDescription=tr(lang,if(saved)"저장 해제" else "저장",if(saved)"Remove saved story"else"Save story")}){Glyph(if(saved)"saved_filled"else"saved",if(saved)Amber else Ivory)}}
@Composable fun ReadMeta(story:Story,lang:String){Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(6.dp)){Glyph("clock",Muted,Modifier.size(15.dp));Text(tr(lang,"${story.minutes(lang)}분 읽기","${story.minutes(lang)} min read"),color=Muted,style=MaterialTheme.typography.labelSmall)}}
@Composable fun SectionTitle(title:String,subtitle:String?=null,action:String?=null,onAction:()->Unit={}){Column(Modifier.fillMaxWidth().padding(top=28.dp,bottom=14.dp)){
 Row(verticalAlignment=Alignment.CenterVertically){Text(title,style=MaterialTheme.typography.titleLarge,modifier=Modifier.weight(1f));if(action!=null)TextButton(onClick=onAction){Text(action,color=Amber)}}
 if(subtitle!=null)Text(subtitle,color=Muted,style=MaterialTheme.typography.bodyMedium,modifier=Modifier.padding(top=5.dp))
}}
@Composable fun StoryCard(story:Story,lang:String,modifier:Modifier=Modifier,tag:String="card_${story.id}",onClick:()->Unit){
 Surface(shape=RoundedCornerShape(12.dp),color=Panel,border=BorderStroke(1.dp,Line),modifier=modifier.testTag(tag).clickable(onClick=onClick)){
  Column{Art(story.image,lang,Modifier.fillMaxWidth().height(140.dp),sharedImageNote(story,lang));Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(9.dp)){sharedImageNote(story,lang)?.let{Text(it,color=Muted,style=MaterialTheme.typography.labelSmall)};Pill(story.status.text(lang));Text(story.headline.text(lang),style=MaterialTheme.typography.titleMedium);Text(story.hook.text(lang),color=Muted,style=MaterialTheme.typography.bodyMedium);ReadMeta(story,lang)}}
 }
}
@Composable fun StoryRow(story:Story,lang:String,tag:String="card_${story.id}",readingState:String?=null,onClick:()->Unit){Column{
 BoxWithConstraints(Modifier.fillMaxWidth().testTag(tag).clickable(onClick=onClick).padding(vertical=16.dp)){
  val stacked=maxWidth<310.dp||LocalDensity.current.fontScale>1.3f
  val copy:@Composable ()->Unit={Column(verticalArrangement=Arrangement.spacedBy(8.dp)){
   Pill(story.status.text(lang));Text(story.headline.text(lang),style=MaterialTheme.typography.titleMedium)
   Text(story.hook.text(lang),color=Muted,style=MaterialTheme.typography.bodyMedium)
   Text(story.canonicalTitle,color=Amber,style=MaterialTheme.typography.labelSmall)
   sharedImageNote(story,lang)?.let{Text(it,color=Muted,style=MaterialTheme.typography.labelSmall)}
   ReadMeta(story,lang);readingState?.let{Text(it,color=Amber,style=MaterialTheme.typography.labelMedium,modifier=Modifier.testTag("reading_${story.id}"))}
  }}
  if(stacked)Column(verticalArrangement=Arrangement.spacedBy(14.dp)){Surface(shape=RoundedCornerShape(9.dp)){Art(story.image,lang,Modifier.fillMaxWidth().height(150.dp),sharedImageNote(story,lang))};copy()}
  else Row(horizontalArrangement=Arrangement.spacedBy(14.dp)){Surface(shape=RoundedCornerShape(9.dp)){Art(story.image,lang,Modifier.size(94.dp,110.dp),sharedImageNote(story,lang))};Box(Modifier.weight(1f)){copy()}}
 };HorizontalDivider(color=Line)
}}
@Composable fun Brand(){Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(9.dp)){Glyph("globe",Amber,Modifier.size(27.dp));Column{Text("MYSTERY ATLAS",fontFamily=FontFamily.Serif,fontSize=18.sp,letterSpacing=1.sp,fontWeight=FontWeight.Medium);Text("FOLLOW THE UNEXPLAINED",fontSize=14.sp,lineHeight=19.sp,color=Muted)}}}
@Composable fun EmptyMessage(title:String,body:String,tag:String){Column(Modifier.fillMaxWidth().testTag(tag).padding(vertical=36.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){Glyph("explore",Amber,Modifier.size(36.dp));Text(title,style=MaterialTheme.typography.titleLarge);Text(body,color=Muted,style=MaterialTheme.typography.bodyLarge)}}
