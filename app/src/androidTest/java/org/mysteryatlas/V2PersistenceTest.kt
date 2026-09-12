package org.mysteryatlas

import android.graphics.Bitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.test.platform.app.InstrumentationRegistry
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Rule
import org.junit.Test
import java.io.File
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.mysteryatlas.data.ProgressRepository

/** Run as a NEW instrumentation process after am force-stop, without pm clear. */
class V2PersistenceTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun node(tag: String) = compose.onAllNodesWithTag(tag).onFirst()
    private fun await(tag: String) {
        compose.waitUntil(12_000) { compose.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
        node(tag).assertIsDisplayed()
    }
    private fun tap(tag: String) { await(tag); node(tag).performClick(); compose.waitForIdle() }

    @Test fun forceStoppedAppRetainsSavedLocaleAndRecent() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val checks = JSONArray()
        fun record(name: String, action: () -> Unit) {
            try { action(); checks.put(JSONObject().put("check", name).put("status", "PASS")) }
            catch (failure: Throwable) {
                checks.put(JSONObject().put("check", name).put("status", "FAIL").put("detail", failure.toString()))
                throw failure
            } finally {
                val dir = File(context.getExternalFilesDir(null), "screenshots").apply { mkdirs() }
                File(dir, "cold-start-persistence.json").writeText(JSONObject()
                    .put("testClass", javaClass.name)
                    .put("precondition", "CI force-stopped app between independent instrumentation processes; data was not cleared")
                    .put("checks", checks).toString(2))
            }
        }
        record("Cold app launch") { await("hero_open") }
        record("Saved Cooper survives force-stop and new process") {
            tap("nav_saved"); await("saved_list"); node("card_cooper").assertIsDisplayed()
        }
        record("Reading completion and actual Article scroll position survive force-stop") {
            val expectedFile = File(context.getExternalFilesDir(null), "screenshots/reading-position-expected.json")
            check(expectedFile.isFile) { "Previous-process reading-position evidence missing" }
            val expected = JSONObject(expectedFile.readText())
            val restored = runBlocking { withTimeout(12_000) { ProgressRepository(context).flow.first { it.ready } } }
            check("cooper" in restored.completed) { "Read completion did not persist" }
            check(restored.positions["cooper"] == (expected.getInt("index") to expected.getInt("offset"))) { "Saved reading position changed across processes" }
            tap("card_cooper"); await("article_list")
            compose.waitUntil(12_000) {
                val actual = node("article_list").fetchSemanticsNode().config[SemanticsProperties.VerticalScrollAxisRange].value()
                kotlin.math.abs(actual - expected.getDouble("scrollRange").toFloat()) < 0.01f
            }
            node("section_money").assertIsDisplayed()
            tap("nav_saved"); await("saved_list")
        }
        record("Korean locale persists independently of navigation") {
            tap("card_cooper"); await("article_list")
            node("article_list").performScrollToNode(hasTestTag("article_title"))
            await("article_title")
            node("article_title").assertTextEquals("20만 달러를 들고 비행기에서 뛰어내린 남자는 어디로 사라졌나")
        }
        record("Recent history retains the previously read related case") {
            val catalog = JSONObject(context.assets.open("v2/catalog.json").bufferedReader().use { it.readText() })
            val cases = catalog.getJSONArray("cases")
            val cooper = (0 until cases.length()).map { cases.getJSONObject(it) }.first { it.getString("id") == "cooper" }
            val relatedId = cooper.getJSONArray("related").getJSONObject(0).getString("caseId")
            tap("nav_saved"); tap("recent_open"); await("recent_list")
            node("recent_list").performScrollToNode(hasTestTag("card_$relatedId"))
            node("card_$relatedId").assertIsDisplayed()
        }
        record("All four destinations still respond after restart") {
            tap("nav_explore"); await("explore_list")
            tap("nav_search"); await("search_input")
            tap("nav_saved"); await("saved_list")
            tap("nav_home"); await("hero_open")
        }
        record("Set nondefault English locale for an independent next-process check") {
            tap("lang_toggle")
            compose.waitUntil(12_000) { runCatching { node("nav_home").assertTextEquals("Home") }.isSuccess }
        }
    }
}

/** English differs from the default Korean, so this proves persistence rather than fallback. */
class V2LocalePersistenceTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private fun node(tag: String) = compose.onAllNodesWithTag(tag).onFirst()
    private fun await(tag: String) {
        compose.waitUntil(12_000) { compose.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
        node(tag).assertIsDisplayed()
    }
    private fun tap(tag: String) { await(tag); node(tag).performClick(); compose.waitForIdle() }

    @Test fun nondefaultLocaleSurvivesNewProcessAndReturnToKorean() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val directory = File(context.getExternalFilesDir(null), "screenshots").apply { mkdirs() }
        val proof = JSONObject().put("testClass", javaClass.name)
            .put("precondition", "Previous independent test selected English; CI force-stopped app before this new process")
        try {
            await("nav_home")
            compose.waitUntil(12_000) { runCatching { node("nav_home").assertTextEquals("Home") }.isSuccess }
            tap("hero_open"); await("article_list")
            node("article_list").performScrollToNode(hasTestTag("article_title"))
            val catalog = JSONObject(context.assets.open("v2/catalog.json").bufferedReader().use { it.readText() })
            val stories = catalog.getJSONArray("cases")
            val cooper = (0 until stories.length()).map { stories.getJSONObject(it) }.first { it.getString("id") == "cooper" }
            node("article_title").assertTextEquals(cooper.getJSONObject("headline").getString("en"))
            proof.put("nondefaultLocaleAcrossProcess", "PASS")
            tap("nav_home"); tap("lang_toggle")
            compose.waitUntil(12_000) { runCatching { node("nav_home").assertTextEquals("홈") }.isSuccess }
            tap("hero_open"); await("article_list")
            node("article_list").performScrollToNode(hasTestTag("article_title"))
            node("article_title").assertTextEquals(cooper.getJSONObject("headline").getString("ko"))
            tap("nav_home")
            proof.put("restoredKorean", "PASS")
        } catch (failure: Throwable) {
            proof.put("status", "FAIL").put("detail", failure.toString())
            throw failure
        } finally {
            File(directory, "nondefault-locale-persistence.json").writeText(proof.toString(2))
        }
    }
}

/** CI runs this independently at narrow width, 1.3x and 2.0x system font scales. */
class V2DisplayTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private val instrumentation get() = InstrumentationRegistry.getInstrumentation()
    private val context get() = instrumentation.targetContext
    private val variant get() = InstrumentationRegistry.getArguments().getString("qa_variant")
        ?.takeIf { it in setOf("narrow", "font130", "font200") }
        ?: error("Explicit qa_variant is required; test must run under the matching CI display configuration")
    private val proofDir get() = File(context.getExternalFilesDir(null), "screenshots").apply { mkdirs() }
    private fun node(tag: String) = compose.onAllNodesWithTag(tag).onFirst()
    private fun await(tag: String) {
        compose.waitUntil(12_000) { compose.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
        node(tag).assertIsDisplayed()
    }
    private fun tap(tag: String) { await(tag); node(tag).performClick(); compose.waitForIdle() }
    private fun scroll(list: String, tag: String) {
        node(list).performScrollToNode(hasTestTag(tag)); compose.waitForIdle(); await(tag)
    }
    private fun screenshot(name: String) {
        compose.waitUntil(12_000) {
            compose.onAllNodesWithTag("art_loading", useUnmergedTree = true).fetchSemanticsNodes().isEmpty()
        }
        compose.waitForIdle(); instrumentation.waitForIdleSync()
        compose.waitUntil(12_000) {
            instrumentation.uiAutomation.rootInActiveWindow?.packageName?.toString() == context.packageName
        }
        val bitmap = checkNotNull(instrumentation.uiAutomation.takeScreenshot())
        File(proofDir, "20-$variant-$name.png").outputStream().use {
            check(bitmap.compress(Bitmap.CompressFormat.PNG, 100, it))
        }
        bitmap.recycle()
    }

    @Test fun displayConfigurationStillSupportsDiscoveryAndReading() {
        val configuration = context.resources.configuration
        when (variant) {
            "narrow" -> check(configuration.screenWidthDp in 350..370) { "Expected 360dp display, got ${configuration.screenWidthDp}" }
            "font130" -> check(configuration.fontScale in 1.29f..1.31f) { "Expected font scale 1.3, got ${configuration.fontScale}" }
            "font200" -> check(configuration.fontScale in 1.99f..2.01f) { "Expected font scale 2.0, got ${configuration.fontScale}" }
        }
        val checks = JSONArray()
        fun record(name: String, action: () -> Unit) {
            try { action(); checks.put(JSONObject().put("check", name).put("status", "PASS")) }
            catch (failure: Throwable) {
                checks.put(JSONObject().put("check", name).put("status", "FAIL").put("detail", failure.toString()))
                throw failure
            } finally {
                File(proofDir, "display-$variant.json").writeText(JSONObject()
                    .put("renderType", "REAL ANDROID RENDER")
                    .put("variant", variant)
                    .put("widthDp", configuration.screenWidthDp)
                    .put("fontScale", configuration.fontScale)
                    .put("checks", checks).toString(2))
            }
        }
        record("Home renders at requested display configuration") {
            await("home_list"); screenshot("home")
            listOf("nav_home", "nav_explore", "nav_saved", "nav_search").forEach {
                node(it).assertIsDisplayed().assertWidthIsAtLeast(48.dp).assertHeightIsAtLeast(48.dp)
            }
        }
        record("Explore remains reachable and scrollable") {
            tap("nav_explore"); await("explore_list"); screenshot("explore")
            scroll("explore_list", "category_hidden")
            tap("category_hidden"); await("category_list")
        }
        record("Hero remains reachable; Korean headline is readable by Android semantics") {
            tap("nav_home"); await("home_list"); scroll("home_list", "hero_open"); tap("hero_open")
            await("article_list"); scroll("article_list", "article_title")
            node("article_title").assertTextEquals("20만 달러를 들고 비행기에서 뛰어내린 남자는 어디로 사라졌나")
            screenshot("article")
        }
        record("Evidence remains reachable through actual scrolling") {
            scroll("article_list", "evidence_section"); screenshot("evidence")
            tap("nav_saved"); await("saved_list")
            tap("nav_home"); await("home_list")
        }
    }
}
