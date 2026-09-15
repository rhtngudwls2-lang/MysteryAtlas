package org.mysteryatlas.data

import android.content.Context
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.map

private val Context.store by preferencesDataStore("atlas_progress", corruptionHandler = ReplaceFileCorruptionHandler { emptyPreferences() })

data class UserState(
 val bookmarks: Set<String> = emptySet(),
 val language: String = "ko",
 val recent: List<String> = emptyList(),
 val positions: Map<String, Pair<Int, Int>> = emptyMap(),
 val ready: Boolean = false,
 val completed: Set<String> = emptySet(),
 val reactions: Map<String, ReactionType> = emptyMap(),
 val quickPreviews: Set<String> = emptySet()
)

class ProgressRepository(context: Context) {
 private val store = context.store
 private val marks = stringSetPreferencesKey("bookmarks")
 private val lang = stringPreferencesKey("language")
 private val recent = stringPreferencesKey("v2:recent")
 private val completed = stringSetPreferencesKey("v2:completed")
 private val reactionPrefix = "v3:reaction:"
 private val quickPrefix = "v3:quick:"

 val flow = store.data.map { p ->
  val positions = p.asMap().entries.filter { it.key.name.startsWith("v2:position:") }.associate { e ->
   val parts = e.value.toString().split(":")
   e.key.name.removePrefix("v2:position:") to (
    (parts.getOrNull(0)?.toIntOrNull() ?: 0).coerceAtLeast(0) to
     (parts.getOrNull(1)?.toIntOrNull() ?: 0).coerceAtLeast(0)
   )
  }
  val reactionEntries = p.asMap().entries
   .filter { it.key.name.startsWith(reactionPrefix) }
   .mapNotNull { entry ->
    val id = entry.key.name.removePrefix(reactionPrefix)
    val raw = entry.value.toString()
    if (id.isBlank()) return@mapNotNull null
    val type = when (raw) {
     "POSITIVE" -> ReactionType.POSITIVE
     "NEGATIVE" -> ReactionType.NEGATIVE
     else -> ReactionType.NONE
    }
    if (type == ReactionType.NONE) return@mapNotNull null
    id to type
   }.toMap()
  val quick = p.asMap().entries
   .filter { it.key.name.startsWith(quickPrefix) }
   .filter { it.value == "1" }
   .map { it.key.name.removePrefix(quickPrefix) }
   .filter { it.isNotBlank() }
   .toSet()
  UserState(
   p[marks] ?: emptySet(),
   p[lang]?.takeIf { it in setOf("ko", "en") } ?: "ko",
   p[recent]?.split("|")?.filter { it.isNotBlank() } ?: emptyList(),
   positions,
   true,
   p[completed] ?: emptySet(),
   reactionEntries,
   quick
  )
 }

 suspend fun bookmark(id: String) {
  store.edit { p ->
   val s = p[marks] ?: emptySet()
   p[marks] = if (id in s) s - id else s + id
  }
 }

 suspend fun language(value: String) {
  store.edit { it[lang] = value }
 }

 suspend fun visit(id: String) {
  store.edit { p ->
   p[recent] = (listOf(id) + (p[recent]?.split("|") ?: emptyList()).filter { it != id && it.isNotBlank() }).take(50).joinToString("|")
   p[intPreferencesKey("v2:migration")] = 2
  }
 }

 suspend fun position(id: String, index: Int, offset: Int) {
  store.edit { it[stringPreferencesKey("v2:position:$id")] = "$index:$offset" }
 }

 suspend fun complete(id: String) {
  store.edit { p -> p[completed] = (p[completed] ?: emptySet()) + id }
 }

 suspend fun reaction(id: String, value: ReactionType?) {
  store.edit {
   if (value == null || value == ReactionType.NONE) {
    it.remove(stringPreferencesKey("$reactionPrefix$id"))
   } else {
    it[stringPreferencesKey("$reactionPrefix$id")] = value.name
   }
  }
 }

 suspend fun quickSeen(id: String) {
  store.edit { it[stringPreferencesKey("$quickPrefix$id")] = "1" }
 }
}
