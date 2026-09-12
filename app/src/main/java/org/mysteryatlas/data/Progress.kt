package org.mysteryatlas.data

import android.content.Context
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.map

private val Context.store by preferencesDataStore("atlas_progress",corruptionHandler=ReplaceFileCorruptionHandler{emptyPreferences()})
data class UserState(val bookmarks:Set<String> = emptySet(),val language:String="ko",val recent:List<String> = emptyList(),val positions:Map<String,Pair<Int,Int>> = emptyMap(),val ready:Boolean=false,val completed:Set<String> = emptySet())
class ProgressRepository(context:Context) {
 private val store=context.store
 private val marks=stringSetPreferencesKey("bookmarks")
 private val lang=stringPreferencesKey("language")
 private val recent=stringPreferencesKey("v2:recent")
 private val completed=stringSetPreferencesKey("v2:completed")
 // Read failures propagate to the ViewModel; an error is never an empty saved list.
 val flow=store.data.map{p->
  val positions=p.asMap().entries.filter{it.key.name.startsWith("v2:position:")}.associate {e->
   val parts=e.value.toString().split(":");e.key.name.removePrefix("v2:position:") to ((parts.getOrNull(0)?.toIntOrNull()?:0).coerceAtLeast(0) to (parts.getOrNull(1)?.toIntOrNull()?:0).coerceAtLeast(0))
  }
   UserState(p[marks]?:emptySet(),p[lang]?.takeIf{it in setOf("ko","en")}?:"ko",p[recent]?.split("|")?.filter{it.isNotBlank()}?:emptyList(),positions,true,p[completed]?:emptySet())
 }
 suspend fun bookmark(id:String){store.edit{p->val s=p[marks]?:emptySet();p[marks]=if(id in s)s-id else s+id}}
 suspend fun language(value:String){store.edit{it[lang]=value}}
 suspend fun visit(id:String){store.edit{p->p[recent]=(listOf(id)+(p[recent]?.split("|")?:emptyList()).filter{it!=id&&it.isNotBlank()}).take(50).joinToString("|");p[intPreferencesKey("v2:migration")]=2}}
 suspend fun position(id:String,index:Int,offset:Int){store.edit{it[stringPreferencesKey("v2:position:$id") ]="$index:$offset"}}
 suspend fun complete(id:String){store.edit{p->p[completed]=(p[completed]?:emptySet())+id}}
}
