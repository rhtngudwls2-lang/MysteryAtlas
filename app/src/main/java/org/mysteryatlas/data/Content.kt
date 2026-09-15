package org.mysteryatlas.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.Normalizer
import java.util.Locale

data class Copy(val translations:Map<String, String>, val markets:Map<String, Map<String, String>> = emptyMap()) {
 val ko:String get()=text("ko")
 val en:String get()=text("en")
 fun text(locale:String,market:String?=null):String {
  val language=locale.substringBefore('-')
  val variant=market?.let{markets[it]}
  return variant?.get(locale)?:variant?.get(language)?:translations[locale]?:translations[language]?:translations["en"]?:translations.values.firstOrNull().orEmpty()
 }
}
data class Category(val id:String,val name:Copy,val hook:Copy,val image:String)
data class MarketConfig(
 val publicName:Copy,
 val shortName:Copy,
 val tagline:Copy,
 val reactionLabels:Map<String, Copy>,
 val featuredCollections:List<String> = emptyList()
)
data class RelatedType(
  val id:String,
  val copy:Copy
)
enum class RelationKind(val wire:String) {
 SIMILAR_CASE("similar_case"), SAME_COUNTRY("same_country"), SAME_ERA("same_era"),
 SAME_THEME("same_theme"), RELATED_PERSON("related_person"), RELATED_PLACE("related_place"),
 DERIVED_CONSPIRACY("derived_conspiracy"), SKEPTICAL_EXPLANATION("skeptical_explanation"),
 EVIDENCE_PATTERN("evidence_pattern"), QUESTION_BASED("question_based");
 companion object {
  fun parse(value:String):RelationKind = entries.firstOrNull { it.wire == value } ?: SIMILAR_CASE
 }
}
data class Related(
 val caseId:String,
 val reason:Copy,
 val type:RelatedType = RelatedType("related_case",Copy(mapOf("ko" to "��������","en" to "Related")))
)
data class Person(val id:String,val name:String)
data class Place(val id:String,val name:String,val role:String)
data class CaseDate(val start:String,val precision:String)
data class CaseImage(
  val id:String,
  val path:String,
  val role:String = "hero",
  val provenance:String? = null,
  val caption:Copy? = null,
  val reconstruction:Boolean = false,
  val sequence:Int = 0
)
data class Story(
 val id:String,
 val canonicalTitle:String,
 val headline:Copy,
 val hook:Copy,
 val status:Copy,
 val resolutionCode:String,
 val country:Copy,
 val year:String,
 val minutesKo:Int,
 val minutesEn:Int,
 val categoryIds:List<String>,
 val tags:List<String>,
 val aliases:List<String>,
 val images:List<CaseImage>,
 val article:String,
 val publishedAt:String,
 val related:List<Related>,
 val persons:List<Person>,
 val locations:List<Place>,
 val dates:List<CaseDate>,
 val localizedYear:Copy?=null,
 val markets:Map<String, Copy>? = null
) {
 fun minutes(lang:String)=if(lang=="ko")minutesKo else minutesEn
 fun displayYear(lang:String)=localizedYear?.text(lang)?:year
 fun heroImage()=images.firstOrNull{it.role == "hero"}?.path?:images.firstOrNull()?.path
}
data class CaseIndex(
 val id:String,
 val slug:String,
 val title:String,
 val aliases:List<String>,
 val categoryIds:List<String>,
 val country:Copy,
 val tags:List<String>,
 val people:List<String>,
 val places:List<String>,
 val preview:Copy,
 val thumbnail:String?,
 val searchableText:String
)
data class Section(
  val id:String,
  val type:String,
  val title:Copy,
  val body:Copy,
  val sourceIds:List<String>,
  val image:String?=null,
  val imageRole:String?=null
)
enum class EvidenceStatus {
 CONFIRMED,
 SUPPORTED,
 DISPUTED,
 ALLEGED,
 UNVERIFIED,
 DEBUNKED,
 OUTDATED,
 CLAIM;
 companion object {
  fun parse(value:String):EvidenceStatus = when(value.uppercase()) {
   "CONFIRMED"->CONFIRMED
   "SUPPORTED"->SUPPORTED
   "DISPUTED"->DISPUTED
   "ALLEGED"->ALLEGED
   "UNVERIFIED"->UNVERIFIED
   "DEBUNKED"->DEBUNKED
   "OUTDATED"->OUTDATED
   else->CLAIM
  }
 }
}
enum class ReactionType {
 POSITIVE,
 NEGATIVE,
 NONE
}
data class Evidence(
 val id:String,
 val status:EvidenceStatus,
 val text:Copy,
 val reason:Copy?=null,
 val sourceIds:List<String>,
 val whatItEstablishes:Copy?=null,
 val whatItDoesNotEstablish:Copy?=null,
 val counterEvidence:Copy?=null,
 val counterSource:Copy?=null,
 val lastVerified:String?=null,
 val changeHistory:Copy?=null,
 val sourceType:Copy?=null,
 val sourceDate:String?=null,
 val statusQualifier:Copy?=null,
 val counterSourceIds:List<String> = emptyList()
)
data class Source(val id:String,val title:String,val publisher:String,val url:String,val accessedAt:String)
data class CaseDetail(
  val caseId:String,
  val verifiedAt:String,
  val summary:Copy,
  val sections:List<Section>,
  val evidence:List<Evidence>,
  val sources:List<Source>,
  val status:EvidenceStatus = EvidenceStatus.CLAIM,
  val provenance:Copy? = null
)
typealias Article = CaseDetail
data class Catalog(val categories:List<Category>,val cases:List<Story>)
data class SearchManifest(
 val byId:Map<String,CaseIndex>,
 val all:List<CaseIndex>,
 val tokenIndex:Map<String,List<String>>,
 val storiesById:Map<String,Story>
)
data class CollectionConfig(val id:String,val title:Copy,val subtitle:Copy,val caseIds:List<String>)
data class MarketBundle(val default:MarketConfig,val perCaseCopyOverrides:Map<String,Copy> = emptyMap())
fun marketBundle():MarketBundle = MarketBundle(
  MarketConfig(
    publicName = Copy(mapOf("ko" to "미스터리 아틀라스", "en" to "Mystery Atlas")),
    shortName = Copy(mapOf("ko" to "Mystery Atlas", "en" to "Mystery Atlas")),
    tagline = Copy(mapOf("ko" to "알려지지 않은 사건을 탐색하세요", "en" to "Explore what is still unexplained")),
    reactionLabels = mapOf(
      "positive" to Copy(mapOf("ko" to "좋아요", "en" to "Like")),
      "negative" to Copy(mapOf("ko" to "별로예요", "en" to "Nope"))
    )
  )
)
fun defaultCollections(cases:List<Story>,lang:String):List<CollectionConfig>{
 val ids = cases.map { it.id }
 return listOf(
  CollectionConfig(
   id = "core-mysteries",
   title = Copy(mapOf("ko" to "핵심 미스터리", "en" to "Core Mysteries")),
   subtitle = Copy(mapOf("ko" to "진입 장벽이 낮은 추천 사건", "en" to "Recommended starting points")),
   caseIds = ids.filter { it in setOf("cooper","mary-celeste","dyatlov","wow") }
  ),
  CollectionConfig(
   id = "archive-milestones",
   title = Copy(mapOf("ko" to "역사 기록", "en" to "Archive Classics")),
   subtitle = Copy(mapOf("ko" to "오래된 사건으로 이어지는 탐색", "en" to "Cases built from historical records")),
   caseIds = ids.filter { it in setOf("voynich","rohonc","phaistos") }
  )
 )
}

fun defaultReadingTime(locale:String,text:String,languageHint:String?=null):Int{
 return if((languageHint?:locale).startsWith("ko")) {
  val normalized = text.filter{it.isLetterOrDigit()}
  ((normalized.length / 550) + 1).coerceAtLeast(1)
 } else {
  val words = text.trim().split(Regex("\\s+")).count { it.isNotBlank() }
  ((words / 225) + 1).coerceAtLeast(1)
 }
}
// Returning to an earlier node truncates the route, preserving actual graph edges.
fun relatedPath(path:List<String>,id:String):List<String>{val prior=path.indexOf(id);return if(prior>=0)path.take(prior+1)else path+id}
private fun normalizedSearch(value:String)=Normalizer.normalize(value,Normalizer.Form.NFKC).lowercase(Locale.ROOT).filter{it.isLetterOrDigit()}

private fun normalizeCopy(copy:Copy?):String = listOfNotNull(copy?.ko,copy?.en).joinToString(" ").lowercase().trim()
fun buildSearchManifest(data:Catalog):SearchManifest{
 val tokenBuckets=mutableMapOf<String,MutableList<String>>()
 val allStories=data.cases
 val indexes=data.cases.map { s ->
  val categoryText=data.categories.filter { it.id in s.categoryIds }.flatMap { listOf(it.name.ko,it.name.en,it.hook.ko,it.hook.en) }
  val searchable=(listOf(s.canonicalTitle,s.headline.ko,s.headline.en,s.hook.ko,s.hook.en,s.country.ko,s.country.en,s.year)+s.aliases+s.tags+s.persons.map{it.name}+s.locations.map{it.name}+categoryText).joinToString(" ")
  CaseIndex(s.id,s.id,s.canonicalTitle,s.aliases,s.categoryIds,s.country,s.tags,s.persons.map{it.name},s.locations.map{it.name},s.hook,s.heroImage(),searchable)
 }
 indexes.forEach { s ->
  val tokens=mutableSetOf<String>()
  (listOf(s.title,s.preview.ko,s.preview.en)+s.aliases).forEach { tokens.add(normalizedSearch(it)) }
  tokens.add(normalizedSearch(normalizeCopy(s.country))); tokens.addAll(s.tags.map(::normalizedSearch))
  tokens.addAll(s.people.map(::normalizedSearch))
  tokens.addAll(s.places.map(::normalizedSearch))
  tokens.filter { it.isNotBlank() }.forEach { token ->
   if(token.length>=2) tokenBuckets.getOrPut(token){mutableListOf()}.add(s.id)
  }
  normalizedSearch(s.title).takeIf{it.length>=2}?.let{tokenBuckets.getOrPut(it){mutableListOf()}.add(s.id)}
 }
 return SearchManifest(indexes.associateBy { it.id },indexes,tokenBuckets.mapValues{it.value.distinct()},allStories.associateBy{it.id})
}
fun searchStories(index:SearchManifest,query:String):List<Story>{
 val q=normalizedSearch(query)
 if(q.isEmpty())return index.all.mapNotNull{index.storiesById[it.id]}
 val ranked=index.all.mapNotNull{story->
   val names=(listOf(story.title)+story.aliases).map(::normalizedSearch)
   val preview=listOf(story.preview.ko,story.preview.en).map(::normalizedSearch)
   val metadata=normalizedSearch(story.searchableText)
   val rank=when {
    names.any{it==q}->0
    names.any{it.contains(q)}->1
    preview.any{it.contains(q)}->2
    metadata.contains(q)->3
    else->return@mapNotNull null
   }
   story.id to rank
  }.sortedWith(compareBy<Pair<String,Int>>{it.second}.thenBy{it.first}).mapNotNull{index.storiesById[it.first]}
 return ranked.distinctBy { it.id }
}
fun searchStories(data:Catalog,query:String):List<Story> = searchStories(buildSearchManifest(data),query)
fun localizedEvidenceLabel(status:EvidenceStatus,lang:String)=when(status){
 EvidenceStatus.CONFIRMED->if(lang=="ko")"������"else"Confirmed"
 EvidenceStatus.SUPPORTED->if(lang=="ko")"지지됨"else"Supported"
 EvidenceStatus.DISPUTED->if(lang=="ko")"논란"else"Disputed"
 EvidenceStatus.ALLEGED->if(lang=="ko")"주장"else"Alleged"
 EvidenceStatus.UNVERIFIED->if(lang=="ko")"미검증"else"Unverified"
 EvidenceStatus.DEBUNKED->if(lang=="ko")"반박됨"else"Debunked"
 EvidenceStatus.OUTDATED->if(lang=="ko")"구시대"else"Outdated"
 EvidenceStatus.CLAIM->if(lang=="ko")"사실 주장"else"Claim"
}
private fun JSONObject.copy(key:String)=getJSONObject(key).let { o->
 val translations=o.keys().asSequence().filter{it!="markets"}.associateWith{o.getString(it)}
 val variants=o.optJSONObject("markets")
 val markets=variants?.let { v->v.keys().asSequence().associateWith{market->val obj=v.getJSONObject(market);obj.keys().asSequence().associateWith{obj.getString(it)}} }?:emptyMap()
 require(translations["ko"].orEmpty().isNotBlank()&&translations["en"].orEmpty().isNotBlank())
 Copy(translations,markets)
}
private fun JSONObject.optCopy(key:String):Copy?{
 if(!has(key)||isNull(key))return null
 return optJSONObject(key)?.let{ obj ->
  val translations=obj.keys().asSequence().filter{it!="markets"}.associateWith{obj.getString(it)}
  val variants=obj.optJSONObject("markets")
  val markets=variants?.let { v->v.keys().asSequence().associateWith{market->val source=v.getJSONObject(market);source.keys().asSequence().associateWith{source.getString(it)}} }?:emptyMap()
  if(translations.isEmpty()&&markets.isEmpty())null else Copy(translations.ifEmpty{mapOf("en" to obj.getString(obj.keys().asSequence().first()) )},markets)
 }
}
private fun JSONObject.optStringList(key:String):List<String> = optJSONArray(key).strings()
private fun JSONArray?.strings():List<String> = if(this==null)emptyList() else (0 until length()).map{getString(it)}
private fun <T> JSONArray?.objects(f:(JSONObject)->T):List<T> = if(this==null)emptyList() else (0 until length()).map{f(getJSONObject(it))}

private fun evidenceStatus(raw:String?):EvidenceStatus = EvidenceStatus.parse(raw.orEmpty())
private fun relationType(raw:JSONObject?):RelatedType{
 if(raw==null)return RelatedType("related_case",Copy(mapOf("ko" to "��������","en" to "Related")))
 val parsed=raw.keys().asSequence().firstOrNull { it!="reason" && it!="markets" }?.let { raw.getString(it) } ?: "similar_case"
 val value=RelationKind.parse(parsed).wire
 val label= when(value){
  "similar_case"->Copy(mapOf("ko" to "비슷한 사건", "en" to "Similar case"))
  "skeptical_explanation"->Copy(mapOf("ko" to "회의적 설명", "en" to "Skeptical explanation"))
  "same_country"->Copy(mapOf("ko" to "같은 국가", "en" to "Same country"))
  "same_era"->Copy(mapOf("ko" to "같은 시대", "en" to "Same era"))
  "same_theme"->Copy(mapOf("ko" to "동일 주제", "en" to "Same theme"))
  "related_person"->Copy(mapOf("ko" to "관련 인물", "en" to "Related person"))
  "related_place"->Copy(mapOf("ko" to "관련 장소", "en" to "Related place"))
  "derived_conspiracy"->Copy(mapOf("ko" to "파생 음모론", "en" to "Derived theory"))
  "evidence_pattern"->Copy(mapOf("ko" to "증거 패턴", "en" to "Evidence pattern"))
  "question_based"->Copy(mapOf("ko" to "질문 기반", "en" to "Question based"))
  else->Copy(mapOf("ko" to "연결", "en" to "Related"))
 }
 return RelatedType(value,label)
}
private fun JSONObject.parseRelation():Related{
 val reason=this.copy("reason")
 val type=relationType(optJSONObject("type") ?: JSONObject().put("similar_case","similar_case"))
 val target=getString("caseId")
 return Related(target,reason,type)
}
class ContentRepository(private val context:Context) {
 private fun json(path:String)=context.assets.open(path).bufferedReader().use{JSONObject(it.readText())}
 fun marketConfig():MarketBundle = marketBundle()
 suspend fun caseIndexes():List<CaseIndex> = buildSearchManifest(catalog()).all
 suspend fun catalog():Catalog=withContext(Dispatchers.IO) {
  val root=json("v2/catalog.json");require(root.getInt("schemaVersion")==2)
  val categories=root.getJSONArray("categories").objects{Category(it.getString("id"),it.copy("name"),it.copy("hook"),it.getString("image"))}
  val stories=root.getJSONArray("cases").objects {o->
   val imageRefs = o.optJSONArray("images")?.objects{ it ->
    CaseImage(
     id = it.optString("id",o.getString("id")),
     path = it.optString("path",o.getString("image")),
     role = it.optString("role","hero"),
     provenance = it.optString("provenance", ""),
     caption = if(it.optJSONObject("caption")!=null) it.copy("caption") else null,
     reconstruction = it.optBoolean("reconstruction", false),
     sequence = it.optInt("sequence", 0)
    )
   }?.ifEmpty { listOf(CaseImage(id = o.getString("id"), path = o.getString("image"))) } ?: listOf(CaseImage(id = o.getString("id"), path = o.getString("image")))
   Story(
    id=o.getString("id"),
    canonicalTitle=o.getString("canonicalTitle"),
    headline=o.copy("headline"),
    hook=o.copy("hook"),
    status=o.copy("status"),
    resolutionCode=o.getString("resolutionCode"),
    country=o.copy("country"),
    year=o.getString("year"),
    minutesKo=o.getJSONObject("minutes").getInt("ko"),
    minutesEn=o.getJSONObject("minutes").getInt("en"),
    categoryIds=o.getJSONArray("categoryIds").strings(),
    tags=o.optJSONArray("tags").strings(),
    aliases=o.optJSONArray("aliases").strings(),
    images=imageRefs,
    article=o.getString("article"),
    publishedAt=o.getString("publishedAt"),
    related=o.optJSONArray("related").objects{it.parseRelation()},
    persons=o.optJSONArray("persons").objects{Person(it.getString("id"),it.getString("name"))},
    locations=o.optJSONArray("locations").objects{Place(it.getString("id"),it.getString("name"),it.getString("role"))},
    dates=o.optJSONArray("dates").objects{CaseDate(it.getString("start"),it.getString("precision"))},
    localizedYear=o.optCopy("localizedYear")
   )
  }
  require(stories.map{it.id}.distinct().size==stories.size)
  val ids=stories.map{it.id}.toSet()
  require(stories.all{ s-> s.related.all{ r-> r.caseId!=s.id && r.caseId in ids } })
  Catalog(categories,stories)
 }
 suspend fun caseDetail(story:Story):CaseDetail=withContext(Dispatchers.IO) {
  val o=json(story.article);require(o.getString("caseId")==story.id)
  val sources=o.getJSONArray("sources").objects{Source(it.getString("id"),it.getString("title"),it.getString("publisher"),it.getString("url"),it.getString("accessedAt"))}
  val sections=o.getJSONArray("sections").objects {
    Section(
      it.getString("id"),
      it.getString("type"),
      it.copy("title"),
      it.copy("body"),
      it.optJSONArray("sourceIds").strings(),
      it.optString("image").takeIf{v->v.isNotBlank()},
      it.optString("imageRole").takeIf{v->v.isNotBlank()}
    )
  }
  val evidence=o.getJSONArray("evidence").objects{
   Evidence(
     it.getString("id"),
     evidenceStatus(it.optString("status", "CLAIM")),
     it.copy("text"),
     if(it.optJSONObject("reason") != null) it.copy("reason") else null,
     it.optJSONArray("sourceIds").strings(),
     it.optCopy("whatItEstablishes"),
     it.optCopy("whatItDoesNotEstablish"),
     it.optCopy("counterEvidence"),
     it.optCopy("counterSource"),
     it.optString("lastVerified").takeIf { v -> v.isNotBlank() },
     it.optCopy("changeHistory"),
     it.optCopy("sourceType"),
     it.optString("sourceDate").takeIf { v -> v.isNotBlank() },
     it.optCopy("statusQualifier"),
     it.optJSONArray("counterSourceIds").strings()
   )
  }
  require(evidence.all{e->e.sourceIds.isNotEmpty()&&(e.sourceIds+e.counterSourceIds).all{id->sources.any{it.id==id}}})
  CaseDetail(story.id,o.getString("verifiedAt"),o.copy("summary"),sections,evidence,sources,status = evidenceStatus(o.optString("status")), provenance = o.optJSONObject("provenance")?.let { o.copy("provenance")})
 }
 suspend fun article(story:Story):Article = caseDetail(story)
}
