package org.mysteryatlas
import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import org.mysteryatlas.data.*
import org.mysteryatlas.domain.AtlasRules
import org.mysteryatlas.metrics.*
import java.time.LocalDate
import java.util.Random

class AtlasViewModel(application: Application, private val saved: SavedStateHandle): AndroidViewModel(application) {
 private val repository=ContentRepository(application)
 private val storage=ProgressRepository(application)
 val content=MutableStateFlow<Content?>(null)
 val progress=MutableStateFlow<Progress?>(null)
 val error=MutableStateFlow<String?>(null)
 val busy=MutableStateFlow(false)
 val screen=saved.getStateFlow("screen","map")
 val active=saved.getStateFlow<String?>("active",null)
 val preview=saved.getStateFlow<String?>("preview",null)
 val focus=saved.getStateFlow<String?>("focus",null)
 val metrics=SessionMetrics()
 private val exitPolicy=CaseExitPolicy { /* intentionally no advertising */ }
 init {
  load()
  viewModelScope.launch { storage.flow.collect { progress.value=it } }
 }
 fun load() { viewModelScope.launch { runCatching { repository.load() }.onSuccess { content.value=it }.onFailure { error.value="error" } } }
 fun rank(n:Int)=content.value?.ranks?.lastOrNull { n>=it.first }?.second ?: "observer"
 fun route(to:String) { if(to=="archive")metrics.session.archiveOpened++;saved["screen"]=to }
 fun select(id:String,entry:String="map") {
  if(content.value?.cases?.none { it.id==id }!=false)return
  if(entry=="map")metrics.marker()
  saved["entry"]=entry;saved["preview"]=id;saved["focus"]=id
 }
 fun dismiss() {saved["preview"]=null}
 fun begin(id:String) {
  val p=progress.value ?: return
  metrics.start(id,saved.get<String>("entry") ?: "archive")
  saved["active"]=id;saved["preview"]=null
  saved["screen"]=if(id in p.investigated)"verdict" else "investigation"
 }
 private fun write(action:suspend ()->Unit, after:()->Unit={}) {
  if(busy.value)return
  busy.value=true
  viewModelScope.launch {
   try {action();error.value=null;after()}catch(_:Exception){error.value="save_error"}finally{busy.value=false}
  }
 }
 fun theory(id:String,value:String) = write({storage.theory(id,value)})
 fun step(id:String,n:Int)=write({storage.step(id,n)})
 fun bookmark(id:String)=write({storage.bookmark(id)})
 fun language(value:String)=write({storage.language(value)})
 fun reveal(c:Case) {
  val p=progress.value ?: return
  if(p.theories[c.id]==null||(p.steps[c.id]?:0)<c.evidence.size+1)return
  write({storage.complete(c.id,rank((p.investigated+c.id).size))}) {metrics.complete(c.id);saved["screen"]="verdict"}
 }
 fun exit(id:String,to:String="map") {exitPolicy.onExit(id);saved["screen"]=to}
 fun random() {
  val p=progress.value ?: return;val ids=content.value?.cases?.map {it.id} ?: return
  metrics.session.randomUsed++
  AtlasRules.random(ids,p.investigated,Random())?.let {select(it,"random")}
 }
 fun daily() {
  val p=progress.value ?: return;val ids=content.value?.cases?.map {it.id} ?: return
  val date=LocalDate.now().toString()
  AtlasRules.daily(date,ids,p.investigated,p.daily[date])?.let {id->write({storage.daily(date,id)}) {select(id,"daily")}}
 }
 fun related(c:Case) {
  val all=content.value?.cases ?: return;val p=progress.value ?: return
  val related=c.related.mapNotNull {id->all.find {it.id==id}}
  val next=related.firstOrNull {it.id !in p.investigated} ?: related.firstOrNull() ?: return
  exit(c.id);select(next.id,"related")
 }
}
