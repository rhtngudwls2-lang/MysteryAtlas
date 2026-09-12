package org.mysteryatlas.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.Normalizer
import java.util.Locale

data class Copy(val translations:Map<String,String>,val markets:Map<String,Map<String,String>> = emptyMap()) {
 val ko:String get()=text("ko")
 val en:String get()=text("en")
 fun text(locale:String,market:String?=null):String {
  val language=locale.substringBefore('-')
  val variant=market?.let{markets[it]}
  return variant?.get(locale)?:variant?.get(language)?:translations[locale]?:translations[language]?:translations["en"]?:translations.values.firstOrNull().orEmpty()
 }
}
data class Category(val id:String,val name:Copy,val hook:Copy,val image:String)
data class Related(val caseId:String,val reason:Copy)
data class Person(val id:String,val name:String)
data class Place(val id:String,val name:String,val role:String)
data class CaseDate(val start:String,val precision:String)
data class Story(val id:String,val canonicalTitle:String,val headline:Copy,val hook:Copy,val status:Copy,
 val resolutionCode:String,val country:Copy,val year:String,val minutesKo:Int,val minutesEn:Int,
 val categoryIds:List<String>,val tags:List<String>,val aliases:List<String>,val image:String,val article:String,
 val publishedAt:String,val related:List<Related>,val persons:List<Person>,val locations:List<Place>,val dates:List<CaseDate>,val localizedYear:Copy?=null) {
 fun minutes(lang:String)=if(lang=="ko")minutesKo else minutesEn
 fun displayYear(lang:String)=localizedYear?.text(lang)?:year
}
data class Section(val id:String,val type:String,val title:Copy,val body:Copy,val sourceIds:List<String>,val image:String?)
enum class Epistemic { CONFIRMED,DISPUTED,CLAIM,LEGEND,DEBUNKED }
data class Evidence(val id:String,val status:Epistemic,val text:Copy,val sourceIds:List<String>)
data class Source(val id:String,val title:String,val publisher:String,val url:String,val accessedAt:String)
data class Article(val caseId:String,val verifiedAt:String,val summary:Copy,val sections:List<Section>,val evidence:List<Evidence>,val sources:List<Source>)
data class Catalog(val categories:List<Category>,val cases:List<Story>)
// Returning to an earlier node truncates the route, preserving actual graph edges.
fun relatedPath(path:List<String>,id:String):List<String>{val prior=path.indexOf(id);return if(prior>=0)path.take(prior+1)else path+id}
private fun normalizedSearch(value:String)=Normalizer.normalize(value,Normalizer.Form.NFKC).lowercase(Locale.ROOT).filter{it.isLetterOrDigit()}
fun searchStories(data:Catalog,query:String):List<Story>{
 val q=normalizedSearch(query);if(q.isEmpty())return data.cases
 return data.cases.mapNotNull{s->
  val names=(listOf(s.canonicalTitle)+s.aliases).map(::normalizedSearch)
  val headlines=listOf(s.headline.ko,s.headline.en).map(::normalizedSearch)
  val metadata=(listOf(s.hook.ko,s.hook.en,s.country.ko,s.country.en)+s.tags+s.persons.map{it.name}+s.locations.map{it.name}+data.categories.filter{it.id in s.categoryIds}.flatMap{listOf(it.name.ko,it.name.en)}).map(::normalizedSearch)
  val rank=when{q in names->0;names.any{it.contains(q)}->1;headlines.any{it.contains(q)}->2;metadata.any{it.contains(q)}->3;else->return@mapNotNull null}
  s to rank
 }.sortedWith(compareBy<Pair<Story,Int>>{it.second}.thenBy{it.first.id}).map{it.first}
}
private fun JSONObject.copy(key:String)=getJSONObject(key).let { o->
 val translations=o.keys().asSequence().filter{it!="markets"}.associateWith{o.getString(it)}
 val variants=o.optJSONObject("markets")
 val markets=variants?.let { v->v.keys().asSequence().associateWith{market->val obj=v.getJSONObject(market);obj.keys().asSequence().associateWith{obj.getString(it)}} }?:emptyMap()
 require(translations["ko"].orEmpty().isNotBlank()&&translations["en"].orEmpty().isNotBlank())
 Copy(translations,markets)
}
private fun JSONArray?.strings():List<String> = if(this==null)emptyList() else (0 until length()).map{getString(it)}
private fun <T> JSONArray?.objects(f:(JSONObject)->T):List<T> = if(this==null)emptyList() else (0 until length()).map{f(getJSONObject(it))}
class ContentRepository(private val context:Context) {
 private fun json(path:String)=context.assets.open(path).bufferedReader().use{JSONObject(it.readText())}
 suspend fun catalog():Catalog=withContext(Dispatchers.IO) {
  val root=json("v2/catalog.json");require(root.getInt("schemaVersion")==2)
  val categories=root.getJSONArray("categories").objects{Category(it.getString("id"),it.copy("name"),it.copy("hook"),it.getString("image"))}
  val stories=root.getJSONArray("cases").objects {o->
   Story(o.getString("id"),o.getString("canonicalTitle"),o.copy("headline"),o.copy("hook"),o.copy("status"),o.getString("resolutionCode"),o.copy("country"),o.getString("year"),o.getJSONObject("minutes").getInt("ko"),o.getJSONObject("minutes").getInt("en"),o.getJSONArray("categoryIds").strings(),o.optJSONArray("tags").strings(),o.optJSONArray("aliases").strings(),o.getString("image"),o.getString("article"),o.getString("publishedAt"),o.getJSONArray("related").objects{Related(it.getString("caseId"),it.copy("reason"))},o.optJSONArray("persons").objects{Person(it.getString("id"),it.getString("name"))},o.optJSONArray("locations").objects{Place(it.getString("id"),it.getString("name"),it.getString("role"))},o.optJSONArray("dates").objects{CaseDate(it.getString("start"),it.getString("precision"))},if(o.has("localizedYear"))o.copy("localizedYear")else null)
  }
  require(stories.map{it.id}.distinct().size==stories.size)
  require(stories.all{s->s.related.all{r->r.caseId!=s.id&&stories.any{it.id==r.caseId}}})
  Catalog(categories,stories)
 }
 suspend fun article(story:Story):Article=withContext(Dispatchers.IO) {
  val o=json(story.article);require(o.getString("caseId")==story.id)
  val sources=o.getJSONArray("sources").objects{Source(it.getString("id"),it.getString("title"),it.getString("publisher"),it.getString("url"),it.getString("accessedAt"))}
  val sections=o.getJSONArray("sections").objects{Section(it.getString("id"),it.getString("type"),it.copy("title"),it.copy("body"),it.optJSONArray("sourceIds").strings(),it.optString("image").takeIf{v->v.isNotBlank()})}
  val evidence=o.getJSONArray("evidence").objects{Evidence(it.getString("id"),Epistemic.valueOf(it.getString("status")),it.copy("text"),it.getJSONArray("sourceIds").strings())}
  require(evidence.all{e->e.sourceIds.isNotEmpty()&&e.sourceIds.all{id->sources.any{it.id==id}}})
  Article(story.id,o.getString("verifiedAt"),o.copy("summary"),sections,evidence,sources)
 }
}
