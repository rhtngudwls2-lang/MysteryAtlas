package org.mysteryatlas

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import org.mysteryatlas.data.*

class AtlasViewModel(application:Application,private val saved:SavedStateHandle):AndroidViewModel(application) {
 private val repository=ContentRepository(application)
 private val storage=ProgressRepository(application)
 val catalog=MutableStateFlow<Catalog?>(null)
 val index=MutableStateFlow<SearchManifest?>(null)
 val user=MutableStateFlow(UserState())
 val storageError=MutableStateFlow(false)
 private var userJob:Job?=null
 private var articleJob:Job?=null
 val error=MutableStateFlow(false)
 val article=MutableStateFlow<Article?>(null)
 val articleError=MutableStateFlow(false)
 val screen=saved.getStateFlow("v2:screen","home")
 val active=saved.getStateFlow("v2:active","")
 val category=saved.getStateFlow("v2:category","")
 val query=saved.getStateFlow("v2:query","")
 val path=saved.getStateFlow("v2:path",arrayListOf<String>())
 val screenFlow=saved.getStateFlow("v2:screen","home")
 private var stack:ArrayList<String>
  get()=saved.get<ArrayList<String>>("v2:stack")?:arrayListOf()
  set(value){saved["v2:stack"]=value}
 init{retryStorage();load()}
 fun retryStorage(){
  userJob?.cancel()
  storageError.value=false
  userJob=viewModelScope.launch{
   try{storage.flow.collect{user.value=it;storageError.value=false}}
   catch(c:CancellationException){throw c}
   catch(_:Exception){storageError.value=true}
  }
 }
  fun load(forceError:Boolean=false){
   viewModelScope.launch{
    error.value=false
    catalog.value=null
    if(forceError){error.value=true;return@launch}
    runCatching{repository.catalog()}.onSuccess{
      catalog.value=it
      index.value=buildSearchManifest(it)
      if(screen.value=="article"||screen.value=="preview")loadArticle(active.value)
    }.onFailure{error.value=true}
   }
  }
 fun tab(to:String){stack=arrayListOf();saved["v2:path"]=arrayListOf<String>();saved["v2:screen"]=to}
 fun openQuick(id:String){
 val data=catalog.value?:return
 if(data.cases.none{it.id==id})return
 if(screen.value=="preview"&&active.value==id)return
 push();saved["v2:active"]=id;saved["v2:screen"]="preview";loadArticle(id);write{storage.quickSeen(id)}
 }
 private fun push(){stack=ArrayList(stack+listOf("${screen.value}~${active.value}~${category.value}~${path.value.joinToString(",")}"))}
 fun open(id:String,related:Boolean=false){
  val data=catalog.value?:return
  if(data.cases.none{it.id==id})return
  if(related&&path.value.isNotEmpty()&&data.cases.firstOrNull{it.id==path.value.last()}?.related?.none{it.caseId==id}!=false)return
  if(screen.value=="article"&&active.value==id)return
  push();saved["v2:path"]=if(related)ArrayList(relatedPath(path.value,id))else arrayListOf(id)
  saved["v2:active"]=id;saved["v2:screen"]="article";loadArticle(id);write{storage.visit(id)}
 }
 fun loadArticle(id:String){
  val story=catalog.value?.cases?.find{it.id==id}?:return
  articleJob?.cancel();article.value=null;articleError.value=false
  articleJob=viewModelScope.launch{
   try{val loaded=repository.article(story);if(active.value==id)article.value=loaded}
   catch(c:CancellationException){throw c}
   catch(_:Exception){if(active.value==id)articleError.value=true}
  }
 }
 fun rabbit(){push();if(path.value.isEmpty())saved["v2:path"]=arrayListOf("cooper");saved["v2:screen"]="rabbit"}
 fun revisit(id:String){if(id !in path.value)return;push();saved["v2:path"]=ArrayList(relatedPath(path.value,id));saved["v2:active"]=id;saved["v2:screen"]="article";loadArticle(id);write{storage.visit(id)}}
 fun category(id:String){push();saved["v2:category"]=id;saved["v2:screen"]="category"}
 fun recent(){push();saved["v2:screen"]="recent"}
 fun back(){val s=stack;if(s.isEmpty()){tab("home");return};val p=s.last().split("~");stack=ArrayList(s.dropLast(1));saved["v2:active"]=p.getOrElse(1){""};saved["v2:category"]=p.getOrElse(2){""};saved["v2:path"]=ArrayList(p.getOrElse(3){""}.split(",").filter{it.isNotEmpty()});saved["v2:screen"]=p[0];if(p[0]=="article")loadArticle(active.value)}
 fun query(value:String){saved["v2:query"]=value}
 private fun write(action:suspend()->Unit){viewModelScope.launch{try{action()}catch(c:CancellationException){throw c}catch(_:Exception){storageError.value=true}}}
 fun bookmark(id:String){if(user.value.ready&&!storageError.value)write{storage.bookmark(id)}}
 fun language(){if(user.value.ready&&!storageError.value)write{storage.language(if(user.value.language=="ko")"en" else "ko")}}
 fun position(id:String,index:Int,offset:Int){write{storage.position(id,index,offset)}}
 fun complete(id:String){if(id !in user.value.completed)write{storage.complete(id)}}
 fun results():List<Story> = catalog.value?.let{
   index.value?.let { searchStories(it,query.value) } ?: searchStories(it,query.value)
 }?:emptyList()
 fun react(id:String,type:ReactionType){
  if(!user.value.ready||storageError.value)return
  write {
   val current=user.value.reactions[id] ?: ReactionType.NONE
   storage.reaction(id, if(current==type) ReactionType.NONE else type)
  }
 }
 fun reactionValue(id:String):ReactionType=user.value.reactions[id]?:ReactionType.NONE
}
