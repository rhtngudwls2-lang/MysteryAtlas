package org.mysteryatlas.data

import org.junit.Test
import kotlin.system.measureNanoTime

data class SyntheticCaseIndex(val id:String,val slug:String,val title:String,val country:String,val category:String,val relationIds:List<String>)
data class ScaleMeasurement(val size:Int,val searchNanos:Long,val slugLookupNanos:Long,val saveLookupNanos:Long,val reactionLookupNanos:Long,val relationLookupNanos:Long,val facetLookupNanos:Long)

object ContentScaleFixture {
 val sizes=listOf(100,1_000,10_000,50_000)
 fun generate(size:Int):List<SyntheticCaseIndex> = List(size) { index ->
  val id="synthetic-$index"
  SyntheticCaseIndex(id,id,"Synthetic mystery $index","country-${index%24}","category-${index%12}",if(index==0) emptyList() else listOf("synthetic-${index-1}"))
 }
 fun measure(size:Int):ScaleMeasurement {
  val records=generate(size)
  val bySlug=records.associateBy{it.slug}; val relations=records.associate{it.id to it.relationIds}
  val countries=records.groupBy{it.country}; val categories=records.groupBy{it.category}
  val saved=setOf("synthetic-1","synthetic-${size-1}"); val reactions=mapOf("synthetic-1" to "positive")
  var hits=0
  val search=measureNanoTime { hits=records.count{it.title.contains("mystery ${size-1}",ignoreCase=true)} }; check(hits==1)
  val slug=measureNanoTime { check(bySlug["synthetic-${size-1}"]?.id=="synthetic-${size-1}") }
  val save=measureNanoTime { check("synthetic-1" in saved) }
  val reaction=measureNanoTime { check(reactions["synthetic-1"]=="positive") }
  val relation=measureNanoTime { check(relations["synthetic-${size-1}"]==listOf("synthetic-${size-2}")) }
  val facet=measureNanoTime { check(countries["country-0"].orEmpty().isNotEmpty() && categories["category-0"].orEmpty().isNotEmpty()) }
  return ScaleMeasurement(size,search,slug,save,reaction,relation,facet)
 }
 fun runAll():List<ScaleMeasurement> = sizes.map(::measure)
}

class ContentScaleFixtureTest {
 @Test fun validates100To50000Indexes() {
  ContentScaleFixture.runAll().forEach { println("SCALE_RESULT=$it") }
 }
}
