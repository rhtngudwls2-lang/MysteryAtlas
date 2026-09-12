package org.mysteryatlas.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

data class Bilingual(val en: String, val ko: String) { fun inLanguage(lang: String) = if (lang == "ko") ko else en }
data class Theory(val id: String, val label: Bilingual)
data class Evidence(val id: String, val title: Bilingual, val body: Bilingual)
data class Source(val name: String, val url: String, val description: Bilingual)
data class Myth(val myth: Bilingual, val fact: Bilingual)
data class Case(
 val id: String, val title: Bilingual, val region: Bilingual, val latitude: Double, val longitude: Double,
 val year: Bilingual, val category: String, val status: String, val evidenceScore: Int,
 val hook: Bilingual, val briefing: Bilingual, val theories: List<Theory>, val evidence: List<Evidence>,
 val assessment: Bilingual, val conclusion: Bilingual, val sources: List<Source>, val facts: List<Bilingual>,
 val myths: List<Myth>, val related: List<String>, val coordinateNote: Bilingual
)
data class Content(val cases: List<Case>, val ui: JSONObject, val ranks: List<Pair<Int,String>>, val polygons: List<List<Pair<Double,Double>>>, val rejected: Int)
private fun JSONObject.bi(key: String) = getJSONObject(key).let { Bilingual(it.getString("en"), it.getString("ko")) }
private fun JSONObject.pair(key: String) = Bilingual(getString(key+"_en"), getString(key+"_ko"))
private fun <T> JSONArray.items(f: (JSONObject)->T): List<T> = (0 until length()).map { f(getJSONObject(it)) }
class ContentRepository(private val context: Context) {
 suspend fun load(): Content = withContext(Dispatchers.IO) {
  fun text(name: String) = context.assets.open(name).bufferedReader().use { it.readText() }
  var rejected = 0
  val root = runCatching { JSONArray(text("cases.json")) }.getOrElse { rejected++; JSONArray() }
  val cases = (0 until root.length()).mapNotNull { index ->
   runCatching {
    val o = root.getJSONObject(index)
    val c = Case(o.getString("id"),o.pair("title"),o.pair("region"),o.getDouble("latitude"),o.getDouble("longitude"),o.pair("year_label"),o.getString("primary_category"),o.getString("status"),o.getInt("evidence_score"),o.pair("hook"),o.pair("briefing"),
     o.getJSONArray("theory_choices").items { Theory(it.getString("id"),it.bi("label")) },
     o.getJSONArray("evidence_cards").items { Evidence(it.getString("id"),it.bi("title"),it.bi("body")) },
     o.pair("assessment"),o.bi("evidence_conclusion"),o.getJSONArray("source_records").items { Source(it.getString("name"),it.getString("url"),it.bi("description")) },
     o.getJSONArray("verified_facts").items { Bilingual(it.getString("en"),it.getString("ko")) },o.getJSONArray("myth_vs_fact").items { Myth(it.bi("myth"),it.bi("fact")) },
     o.getJSONArray("related_case_ids").let { a -> (0 until a.length()).map { a.getString(it) } },o.bi("coordinate_note"))
    require(c.id.isNotBlank() && c.latitude.isFinite() && c.longitude.isFinite() && c.latitude in -90.0..90.0 && c.longitude in -180.0..180.0)
    require(c.evidenceScore in 1..4 && c.status in setOf("UNSOLVED","PARTLY_EXPLAINED","EXPLAINED","LEGEND"))
    require(c.theories.size >= 2 && c.theories.map { it.id }.distinct().size == c.theories.size && c.evidence.isNotEmpty() && c.sources.isNotEmpty())
    require(listOf(c.title,c.hook,c.briefing,c.assessment).all { it.en.isNotBlank() && it.ko.isNotBlank() })
    c
   }.getOrElse { rejected++; null }
  }.distinctBy { it.id }
  val ui = runCatching { JSONObject(text("ui.json")) }.getOrElse { JSONObject() }
  val ranks = runCatching { JSONArray(text("ranks.json")).items { it.getInt("minimum") to it.getString("key") }.sortedBy { it.first } }.getOrDefault(listOf(0 to "observer",3 to "investigator"))
  val polygons = runCatching {
   val a = JSONArray(text("world.json")); (0 until a.length()).map { i ->
    val points = a.getJSONArray(i); require(points.length() % 2 == 0)
    (0 until points.length() step 2).map { points.getDouble(it) to points.getDouble(it+1) }
   }
  }.getOrDefault(emptyList())
  Content(cases,ui,ranks,polygons,rejected)
 }
}
