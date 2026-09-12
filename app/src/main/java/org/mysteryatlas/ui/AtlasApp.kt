package org.mysteryatlas.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import org.mysteryatlas.AtlasViewModel
import org.mysteryatlas.data.*
import org.mysteryatlas.map.*

@OptIn(ExperimentalMaterial3Api::class,ExperimentalFoundationApi::class)
@Composable fun AtlasApp(vm:AtlasViewModel=viewModel()) {
 val content by vm.content.collectAsStateWithLifecycle()
 val progress by vm.progress.collectAsStateWithLifecycle()
 val screen by vm.screen.collectAsStateWithLifecycle()
 val active by vm.active.collectAsStateWithLifecycle()
 val preview by vm.preview.collectAsStateWithLifecycle()
 val focus by vm.focus.collectAsStateWithLifecycle()
 val busy by vm.busy.collectAsStateWithLifecycle()
 val error by vm.error.collectAsStateWithLifecycle()
 val device=LocalConfiguration.current.locales[0].language
 val lang=progress?.language?.takeUnless {it=="auto"} ?: if(device=="ko")"ko" else "en"
 val t:(String)->String={key->content?.ui?.optJSONObject(key)?.optString(lang)?.takeIf{it.isNotEmpty()} ?: key}
 val renderer=remember {OfflineMapRenderer()}
 var sources by rememberSaveable {mutableStateOf(false)}
 BackHandler(screen!="map"||preview!=null) {
  when {preview!=null->vm.dismiss();screen=="investigation"->{val c=content?.cases?.find{it.id==active};val step=progress?.steps?.get(active)?:0;if(c!=null&&step>0)vm.step(c.id,step-1)else vm.route("map")};else->vm.route("map")}
 }
 Surface(Modifier.fillMaxSize(),color=Ink) {
  if(content==null||progress==null) {
   Box(Modifier.fillMaxSize().safeDrawingPadding(),contentAlignment=Alignment.Center) {
    if(error!=null)Button(onClick={vm.load()}){Text(t("retry"))}else CircularProgressIndicator(color=Amber)
   }
  } else {
   val data=content!!;val p=progress!!;val total=data.cases.size
   val done=p.investigated.intersect(data.cases.map{it.id}.toSet())
   val c=data.cases.find{it.id==active}
   Column(Modifier.fillMaxSize().safeDrawingPadding()) {
    Row(Modifier.fillMaxWidth().padding(horizontal=20.dp,vertical=12.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween) {
     Text(t("brand"),style=MaterialTheme.typography.labelLarge,letterSpacing=2.sp,modifier=Modifier.combinedClickable(onClick={vm.route("map")},onLongClick={if(BuildConfigDebug())vm.route("debug")}))
     TextButton(onClick={vm.route(if(screen=="settings")"map" else "settings")}){Text(t(if(screen=="settings")"map" else "settings"),style=MaterialTheme.typography.labelSmall)}
    }
    error?.let{Text(t(it),color=Amber,modifier=Modifier.padding(horizontal=20.dp))}
    if(data.rejected>0)Text(t("error"),color=Amber,modifier=Modifier.padding(horizontal=20.dp))
    Box(Modifier.weight(1f)) {
     when(screen) {
      "map"->Column(Modifier.fillMaxSize()) {
       Row(Modifier.fillMaxWidth().padding(horizontal=20.dp),horizontalArrangement=Arrangement.SpaceBetween) {
        Text(t(vm.rank(done.size)),color=Amber,style=MaterialTheme.typography.labelSmall)
        Text("${done.size} / $total ${t("investigated")}",style=MaterialTheme.typography.labelSmall,modifier=Modifier.testTag("progress"))
       }
       Text(t(if(total>0&&done.size==total)"all_done" else "start_hint"),color=Muted,style=MaterialTheme.typography.bodySmall,modifier=Modifier.padding(20.dp,8.dp))
       Box(Modifier.weight(1f)) {renderer.Render(MapScene(data.cases,data.polygons,done,focus),t,{it.title.inLanguage(lang)}){vm.select(it)}}
       Column(Modifier.padding(16.dp,8.dp)) {
        Action(t("random"),"random",enabled=total>0&&!busy){vm.random()}
        TextButton(onClick={vm.daily()},enabled=total>0&&!busy,modifier=Modifier.fillMaxWidth()){Text(t("daily"))}
       }
      }
      "investigation"->if(c!=null) {
       val step=(p.steps[c.id]?:0).coerceIn(0,c.evidence.size+1)
       key(c.id,step,lang) {
        Reading {
         Label("${t("stage")} ${step+1} / ${c.evidence.size+2}")
         LinearProgressIndicator(progress={(step+1f)/(c.evidence.size+2f)},modifier=Modifier.fillMaxWidth(),color=Amber,trackColor=Panel)
         when(step) {
          0->{Label(t("briefing"));Heading(c.title.inLanguage(lang));Body(c.briefing.inLanguage(lang));Action(t("next"),"next",!busy){vm.step(c.id,1)}}
          1->{Label(t("theory"));Heading(c.hook.inLanguage(lang));Text(t("theory_hint"),color=Muted)
           c.theories.forEach {choice->val selected=p.theories[c.id]==choice.id
            OutlinedButton(onClick={vm.theory(c.id,choice.id)},enabled=!busy,modifier=Modifier.fillMaxWidth().testTag("theory_${choice.id}"),shape=RoundedCornerShape(8.dp),border=BorderStroke(1.dp,if(selected)Amber else Muted.copy(alpha=.35f)),contentPadding=PaddingValues(16.dp)) {
             Text((if(selected)"◉  "else"○  ")+choice.label.inLanguage(lang),modifier=Modifier.fillMaxWidth(),color=if(selected)Amber else Ivory)
            }
           };Action(t("next"),"next",!busy&&p.theories[c.id]!=null){vm.step(c.id,2)}
          }
          else->{val e=c.evidence[step-2];Label("${t("evidence")} ${(step-1).toString().padStart(2,'0')}");Heading(e.title.inLanguage(lang));Label(t("fact"));Body(e.body.inLanguage(lang))
           Spacer(Modifier.height(20.dp))
           if(step==c.evidence.size+1)Action(t("reveal"),"reveal",!busy){vm.reveal(c)} else Action(t("next"),"next",!busy){vm.step(c.id,step+1)}
          }
         }
         TextButton(onClick={if(step>0)vm.step(c.id,step-1)else vm.route("map")},enabled=!busy){Text(t("back"))}
        }
       }
      }
      "verdict"->if(c!=null&&c.id in done) {
       key(c.id,lang) {Reading {
        Label(t("verdict"));Heading(c.title.inLanguage(lang));Text(t(c.status),color=Amber,style=MaterialTheme.typography.headlineMedium,modifier=Modifier.testTag("verdict_status"));Body(c.assessment.inLanguage(lang))
        HorizontalDivider(color=Muted.copy(alpha=.25f));Label(t("guessed"));Text(c.theories.find{it.id==p.theories[c.id]}?.label?.inLanguage(lang)?:t("unknown"),style=MaterialTheme.typography.titleMedium)
        Label(t("points"));Text(c.conclusion.inLanguage(lang),color=Amber,style=MaterialTheme.typography.titleMedium)
        Text(t("complete"),color=Amber,modifier=Modifier.testTag("completed"));Text("${done.size} / $total",style=MaterialTheme.typography.labelLarge)
        Action(t("return"),"return"){vm.exit(c.id)}
        OutlinedButton(onClick={vm.related(c)},modifier=Modifier.fillMaxWidth()){Text(t("related"))}
        TextButton(onClick={vm.bookmark(c.id)},enabled=!busy){Text(t(if(c.id in p.bookmarks)"unbookmark"else"bookmark"))}
        OutlinedButton(onClick={sources=true},modifier=Modifier.fillMaxWidth().testTag("sources")){Text(t("sources"))}
        c.myths.forEach {Label(t("myth"));Text(it.myth.inLanguage(lang),color=Muted);Label(t("fact_label"));Text(it.fact.inLanguage(lang))}
       }}
      } else Reading{Text(t("save_wait"))}
      "archive"->Reading {
       Label(t(vm.rank(done.size)));Heading(t("archive"));Text("${done.size} / $total ${t("investigated")}",modifier=Modifier.testTag("archive_progress"))
       Label(t("categories"))
       data.cases.groupBy{it.category}.forEach{(category,cases)->Text("${t(category)}   ${cases.count{it.id in done}} / ${cases.size}")}
       Label(t("discoveries"))
       data.cases.filter{it.id in done}.groupBy{it.status}.forEach{(status,cases)->Text("${t(status)}   ${cases.size}",color=Amber)}
       data.cases.forEach{file->TextButton(onClick={vm.select(file.id,"archive")},modifier=Modifier.fillMaxWidth()){Text((if(file.id in done)"✓  "else"○  ")+file.title.inLanguage(lang),modifier=Modifier.fillMaxWidth())}}
       Label(t("bookmarks"))
       val marked=data.cases.filter{it.id in p.bookmarks}
       if(marked.isEmpty())Text(t("empty_bookmarks"),color=Muted)
       marked.forEach{file->TextButton(onClick={vm.select(file.id,"archive")}){Text(file.title.inLanguage(lang))}}
      }
      "settings"->Reading {
       Heading(t("settings"));Label(t("language"))
       listOf("auto" to t("auto"),"ko" to t("ko"),"en" to t("en")).forEach{(value,label)->
        OutlinedButton(onClick={vm.language(value)},enabled=!busy,modifier=Modifier.fillMaxWidth().testTag("lang_$value")){Text((if(p.language==value)"◉  "else"○  ")+label)}
       }
       Spacer(Modifier.height(20.dp));Text(t("privacy"),color=Muted);Text(t("local_metrics"),color=Muted)
      }
      "debug"->Reading {
       Heading(t("report"));Text(t("report_note"),color=Muted)
       var tick by remember{mutableIntStateOf(0)}
       val report=remember(tick){vm.metrics.report()}
       Text(report,fontFamily=FontFamily.Monospace,fontSize=13.sp,modifier=Modifier.testTag("session_report"))
       TextButton(onClick={tick++}){Text(t("refresh"))}
      }
     }
    }
    if(screen in listOf("map","archive","settings")) {
     HorizontalDivider(color=Muted.copy(alpha=.15f))
     Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceEvenly) {
      listOf("map","archive").forEach{destination->TextButton(onClick={vm.route(destination)},modifier=Modifier.testTag("nav_$destination")){Text(t(destination),color=if(screen==destination)Amber else Muted)}}
     }
    }
   }
   data.cases.find{it.id==preview}?.let {file->
    ModalBottomSheet(onDismissRequest={vm.dismiss()},sheetState=rememberModalBottomSheetState(skipPartiallyExpanded=true),containerColor=Panel) {
     Column(Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal=24.dp).padding(bottom=24.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
      Label("${file.region.inLanguage(lang)} · ${file.year.inLanguage(lang)} · ${t(file.category)}")
      Heading(file.title.inLanguage(lang));Body(file.hook.inLanguage(lang))
      Text("${t("evidence")}  ${"●".repeat(file.evidenceScore)}${"○".repeat(4-file.evidenceScore)}",color=Amber)
      Text(t("evidence_help"),style=MaterialTheme.typography.bodySmall,color=Muted)
      Text("${t("verdict")}: ${if(file.id in done)t(file.status)else"???"}",style=MaterialTheme.typography.labelLarge)
      Text(file.coordinateNote.inLanguage(lang),style=MaterialTheme.typography.bodySmall,color=Muted)
      Action(t(if(file.id in done)"review"else if((p.steps[file.id]?:0)>0)"resume"else"investigate"),"investigate",!busy){vm.begin(file.id)}
      TextButton(onClick={vm.bookmark(file.id)},enabled=!busy){Text(t(if(file.id in p.bookmarks)"unbookmark"else"bookmark"))}
     }
    }
   }
   if(sources&&c!=null&&c.id in done)ModalBottomSheet(onDismissRequest={sources=false},sheetState=rememberModalBottomSheetState(skipPartiallyExpanded=true),containerColor=Panel) {
    Column(Modifier.verticalScroll(rememberScrollState()).padding(24.dp),verticalArrangement=Arrangement.spacedBy(14.dp)) {
     Heading(t("sources"))
     c.sources.forEach {source->Text(source.name,color=Amber);Text(source.description.inLanguage(lang));Text(source.url,style=MaterialTheme.typography.bodySmall,color=Muted);HorizontalDivider()}
     TextButton(onClick={sources=false}){Text(t("close"))}
    }
   }
  }
 }
}
private fun BuildConfigDebug()=org.mysteryatlas.BuildConfig.DEBUG
@Composable private fun Reading(content:@Composable ColumnScope.()->Unit) {
 Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal=24.dp,vertical=16.dp),verticalArrangement=Arrangement.spacedBy(18.dp),content=content)
}
@Composable private fun Label(text:String){Text(text,color=Amber,style=MaterialTheme.typography.labelSmall)}
@Composable private fun Heading(text:String){Text(text,style=MaterialTheme.typography.headlineMedium)}
@Composable private fun Body(text:String){Text(text,style=MaterialTheme.typography.bodyLarge)}
@Composable private fun Action(text:String,tag:String,enabled:Boolean=true,onClick:()->Unit) {
 Button(onClick=onClick,enabled=enabled,shape=RoundedCornerShape(8.dp),contentPadding=PaddingValues(16.dp),modifier=Modifier.fillMaxWidth().heightIn(min=52.dp).testTag(tag)){Text(text)}
}
