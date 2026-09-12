package org.mysteryatlas.map

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.*
import org.mysteryatlas.data.Case
import org.mysteryatlas.domain.AtlasRules
import org.mysteryatlas.ui.*
import kotlin.math.roundToInt

data class MapScene(val cases:List<Case>,val polygons:List<List<Pair<Double,Double>>>,val done:Set<String>,val focus:String?)
/** Replace only this renderer to adopt a tile provider; content and progress remain independent. */
interface MapRenderer {
 @Composable fun Render(scene:MapScene, t:(String)->String, title:(Case)->String, onSelect:(String)->Unit)
}
class OfflineMapRenderer:MapRenderer {
 @Composable override fun Render(scene:MapScene,t:(String)->String,title:(Case)->String,onSelect:(String)->Unit) {
  var zoom by rememberSaveable { mutableFloatStateOf(1f) }
  var centerLon by rememberSaveable { mutableFloatStateOf(0f) }
  var centerLat by rememberSaveable { mutableFloatStateOf(5f) }
  var clusterIds by remember { mutableStateOf<List<String>>(emptyList()) }
  val density=LocalDensity.current
  BoxWithConstraints(Modifier.fillMaxSize().clipToBounds().background(Ink)) {
   val width=constraints.maxWidth.toFloat();val height=constraints.maxHeight.toFloat()
   fun project(lon:Double,lat:Double):Offset {val scale=width/360f*zoom;return Offset(width/2+(lon.toFloat()-centerLon)*scale,height/2-(lat.toFloat()-centerLat)*scale)}
   LaunchedEffect(scene.focus) {
    val c=scene.cases.find {it.id==scene.focus} ?: return@LaunchedEffect
    val oldLon=centerLon;val oldLat=centerLat;val oldZoom=zoom
    Animatable(0f).animateTo(1f,tween(420)) {
     centerLon=oldLon+(c.longitude.toFloat()-oldLon)*value
     centerLat=oldLat+(c.latitude.toFloat()-oldLat)*value
     zoom=oldZoom+(4f-oldZoom)*value
    }
   }
   val pins=remember(scene.cases,width,height,zoom,centerLon,centerLat) {scene.cases.map {c->val p=project(c.longitude,c.latitude);AtlasRules.Pin(c.id,p.x,p.y)}}
   val clusters=remember(pins,density) {AtlasRules.cluster(pins,with(density){52.dp.toPx()})}
   Canvas(Modifier.fillMaxSize().pointerInput(width,height) {
    detectTransformGestures {centroid,pan,factor,_->
     val old=zoom;val next=(zoom*factor).coerceIn(1f,24f)
     val oldScale=width/360f*old;val scale=width/360f*next
     centerLon=(centerLon+(centroid.x-width/2)/oldScale-(centroid.x-width/2+pan.x)/scale).coerceIn(-180f,180f)
     centerLat=(centerLat-(centroid.y-height/2)/oldScale+(centroid.y-height/2+pan.y)/scale).coerceIn(-80f,80f)
     zoom=next
    }
   }) {
    for(lon in -180..180 step 30) drawLine(Muted.copy(alpha=.12f),project(lon.toDouble(),-90.0),project(lon.toDouble(),90.0),1f)
    for(lat in -90..90 step 30) drawLine(Muted.copy(alpha=.12f),project(-180.0,lat.toDouble()),project(180.0,lat.toDouble()),1f)
    scene.polygons.forEach {polygon->
     val path=Path();polygon.forEachIndexed {i,point->val p=project(point.first,point.second);if(i==0)path.moveTo(p.x,p.y)else path.lineTo(p.x,p.y)};path.close()
     drawPath(path,Panel);drawPath(path,Muted.copy(alpha=.45f),style=Stroke(1.2f))
    }
   }
   clusters.filter {it.x in -24f..width+24f && it.y in -24f..height+24f}.forEach {cluster->
    val c=scene.cases.first {it.id==cluster.pins[0].id};val grouped=cluster.pins.size>1
    val label=if(grouped)"${t("cluster")} (${cluster.pins.size})" else title(c)
    val selected=cluster.pins.any {it.id==scene.focus}
    FilledTonalButton(onClick={
     if(grouped && zoom>=20f){clusterIds=cluster.pins.map{it.id}} else if(grouped){
      centerLon=cluster.pins.map {pin->scene.cases.first {it.id==pin.id}.longitude}.average().toFloat()
      centerLat=cluster.pins.map {pin->scene.cases.first {it.id==pin.id}.latitude}.average().toFloat()
      zoom=(zoom*2.5f).coerceAtMost(24f)
     } else onSelect(c.id)
    },modifier=Modifier.offset {IntOffset((cluster.x-with(density){24.dp.toPx()}).roundToInt(),(cluster.y-with(density){24.dp.toPx()}).roundToInt())}.size(48.dp).semantics {contentDescription=label},shape=CircleShape,contentPadding=PaddingValues(0.dp),colors=ButtonDefaults.filledTonalButtonColors(containerColor=if(selected)Amber else Panel,contentColor=if(selected)Ink else Amber)) {
     Text(if(grouped)cluster.pins.size.toString()else if(c.id in scene.done)"✓"else when(c.category){"ocean"->"≈";"space"->"✦";else->"≡"})
    }
   }
   if(clusterIds.isNotEmpty())AlertDialog(onDismissRequest={clusterIds=emptyList()},title={Text(t("cluster"))},text={Column {scene.cases.filter{it.id in clusterIds}.forEach {file->TextButton(onClick={clusterIds=emptyList();onSelect(file.id)}){Text(title(file))}}}},confirmButton={TextButton(onClick={clusterIds=emptyList()}){Text(t("close"))}})
   Column(Modifier.align(Alignment.CenterEnd).padding(10.dp)) {
    FilledTonalIconButton(onClick={zoom=(zoom*1.6f).coerceAtMost(24f)},modifier=Modifier.semantics{contentDescription=t("zoom_in")}){Text("+")}
    FilledTonalIconButton(onClick={zoom=(zoom/1.6f).coerceAtLeast(1f)},modifier=Modifier.semantics{contentDescription=t("zoom_out")}){Text("−")}
   }
   Column(Modifier.align(Alignment.BottomStart).background(Ink.copy(alpha=.9f)).padding(8.dp)) {
    Text(t("map_help"),style=MaterialTheme.typography.labelSmall,color=Muted)
    Text(t("map_credit"),style=MaterialTheme.typography.labelSmall,color=Muted)
   }
  }
 }
}
