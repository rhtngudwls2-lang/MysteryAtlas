package org.mysteryatlas.data

import android.content.Context
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.progressStore by preferencesDataStore(name="atlas_progress", corruptionHandler=ReplaceFileCorruptionHandler { emptyPreferences() })
data class Progress(val investigated: Set<String> = emptySet(), val theories: Map<String,String> = emptyMap(), val bookmarks: Set<String> = emptySet(), val language: String = "auto", val steps: Map<String,Int> = emptyMap(), val daily: Map<String,String> = emptyMap())
class ProgressRepository(context: Context) {
 private val store = context.progressStore
 private val done = stringSetPreferencesKey("investigated")
 private val marks = stringSetPreferencesKey("bookmarks")
 private val language = stringPreferencesKey("language")
 val flow = store.data.catch { if(it is IOException) emit(emptyPreferences()) else throw it }.map { p ->
  val values = p.asMap().entries.associate { it.key.name to it.value }
  Progress(p[done] ?: emptySet(),values.filterKeys { it.startsWith("theory:") }.mapKeys { it.key.removePrefix("theory:") }.mapValues { it.value.toString() },p[marks] ?: emptySet(),p[language] ?: "auto",values.filterKeys { it.startsWith("step:") }.mapKeys { it.key.removePrefix("step:") }.mapValues { (it.value as? Int) ?: 0 },values.filterKeys { it.startsWith("daily:") }.mapKeys { it.key.removePrefix("daily:") }.mapValues { it.value.toString() })
 }
 suspend fun theory(id: String, value: String) { store.edit { it[stringPreferencesKey("theory:$id")] = value } }
 suspend fun step(id: String, value: Int) { store.edit { it[intPreferencesKey("step:$id")] = value } }
 suspend fun complete(id: String, rank: String) { store.edit { it[done] = (it[done] ?: emptySet()) + id; it[stringPreferencesKey("rank_progress")] = rank } }
 suspend fun bookmark(id: String) { store.edit { p -> val s = p[marks] ?: emptySet(); p[marks] = if(id in s) s-id else s+id } }
 suspend fun language(value: String) { store.edit { it[language] = value } }
 suspend fun daily(date: String,id: String) { store.edit { p ->
  p[stringPreferencesKey("daily:$date")] = id
  p.asMap().keys.filter { it.name.startsWith("daily:") }.sortedByDescending { it.name }.drop(31).forEach { p.remove(it) }
 } }
}
