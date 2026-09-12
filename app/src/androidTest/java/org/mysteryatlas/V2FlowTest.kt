package org.mysteryatlas

import android.graphics.Bitmap
import android.view.KeyEvent
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.test.platform.app.InstrumentationRegistry
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import java.io.File
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.mysteryatlas.data.ProgressRepository

/** Real Android instrumentation. Run on the disposable emulator after pm clear. */
class V2FlowTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()
    private val instrumentation get() = InstrumentationRegistry.getInstrumentation()
    private val context get() = instrumentation.targetContext
    private val results = JSONArray()
    private val proofDir get() = File(context.getExternalFilesDir(null), "screenshots").apply { mkdirs() }
    private val catalog by lazy { JSONObject(context.assets.open("v2/catalog.json").bufferedReader().use { it.readText() }) }
    private val cases by lazy { catalog.getJSONArray("cases") }

    private fun node(tag: String) = compose.onAllNodesWithTag(tag).onFirst()
    private fun await(tag: String) {
        compose.waitUntil(12_000) { compose.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
        node(tag).assertIsDisplayed()
    }
    private fun tap(tag: String) { await(tag); node(tag).performClick(); compose.waitForIdle() }
    private fun scroll(list: String, tag: String) {
        node(list).performScrollToNode(hasTestTag(tag))
        compose.waitForIdle()
        await(tag)
    }
    private fun back() {
        instrumentation.sendKeyDownUpSync(KeyEvent.KEYCODE_BACK)
        compose.waitForIdle()
    }
    private fun case(id: String): JSONObject = (0 until cases.length())
        .map { cases.getJSONObject(it) }.first { it.getString("id") == id }
    private fun headline(id: String, language: String = "ko") = case(id).getJSONObject("headline").getString(language)
    private fun article(id: String, language: String = "ko") {
        await("article_list")
        if (runCatching { node("article_title").assertIsDisplayed() }.isFailure) {
            scroll("article_list", "article_title")
        }
        compose.waitUntil(12_000) {
            runCatching { node("article_title").assertTextEquals(headline(id, language)) }.isSuccess
        }
        node("article_title").assertTextEquals(headline(id, language))
    }
    private fun saveCooper() { scroll("article_list", "save_cooper"); tap("save_cooper") }
    private fun screenshot(name: String) {
        compose.waitUntil(12_000) {
            compose.onAllNodesWithTag("art_loading", useUnmergedTree = true).fetchSemanticsNodes().isEmpty()
        }
        compose.waitForIdle()
        instrumentation.waitForIdleSync()
        compose.waitUntil(12_000) {
            instrumentation.uiAutomation.rootInActiveWindow?.packageName?.toString() == context.packageName
        }
        // Allow the compositor to present the final image frame after semantic readiness.
        android.os.SystemClock.sleep(300)
        compose.waitForIdle()
        compose.onAllNodesWithTag("art_loading", useUnmergedTree = true).assertCountEquals(0)
        compose.onAllNodesWithTag("art_error", useUnmergedTree = true).assertCountEquals(0)
        val bitmap = checkNotNull(instrumentation.uiAutomation.takeScreenshot()) { "Android screenshot unavailable: $name" }
        assertTrue("Real Android screenshot width", bitmap.width >= 320)
        assertTrue("Real Android screenshot height", bitmap.height >= 600)
        File(proofDir, name).outputStream().use { assertTrue(bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)) }
        bitmap.recycle()
    }
    private fun checkStep(name: String, action: () -> Unit) {
        try {
            action()
            results.put(JSONObject().put("check", name).put("status", "PASS").put("executedAt", System.currentTimeMillis()))
        } catch (failure: Throwable) {
            results.put(JSONObject().put("check", name).put("status", "FAIL").put("detail", failure.toString()))
            throw failure
        } finally {
            File(proofDir, "functional-flow.json").writeText(JSONObject()
                .put("renderType", "REAL ANDROID RENDER")
                .put("testClass", javaClass.name)
                .put("packageName", context.packageName)
                .put("checks", results).toString(2))
        }
    }

    @Test fun completeDiscoveryReadingAndPersistenceSetup() {
        checkStep("App launch; Home; Hero; four bottom navigation destinations") {
            await("hero_open")
            listOf("nav_home", "nav_explore", "nav_saved", "nav_search").forEach { node(it).assertIsDisplayed() }
            screenshot("01-home.png")
            node("home_list").performScrollToIndex(2); screenshot("22-home-picks.png")
            node("home_list").performScrollToIndex(3); screenshot("23-home-connections.png")
            node("home_list").performScrollToIndex(5); screenshot("24-home-categories.png")
            node("home_list").performScrollToIndex(0); await("hero_open")
        }
        checkStep("Saved empty state on fresh app") {
            tap("nav_saved"); await("saved_empty"); screenshot("08-saved-empty.png")
        }
        checkStep("Search empty state and keyboard text input") {
            tap("nav_search"); await("search_input")
            node("search_input").performTextInput("zzzz-no-matching-case-93821")
            await("search_empty")
            screenshot("09-search-empty.png")
            node("search_input").performTextClearance()
        }
        checkStep("Hero opens complete Korean D.B. Cooper article") {
            tap("nav_home"); tap("hero_open"); article("cooper")
            screenshot("03-cooper.png")
            scroll("article_list", "article_summary")
            screenshot("17-article-summary.png")
            scroll("article_list", "section_money")
            screenshot("18-article-body.png")
        }
        checkStep("Article scroll; Evidence Layer; source section") {
            scroll("article_list", "evidence_section")
            screenshot("04-evidence.png")
            scroll("article_list", "article_sources")
            screenshot("13-sources.png")
            val detail = JSONObject(context.assets.open("v2/articles/cooper.json").bufferedReader().use { it.readText() })
            val evidence = detail.getJSONArray("evidence")
            for (index in 0 until evidence.length()) {
                scroll("article_list", "evidence_${evidence.getJSONObject(index).getString("id")}")
                screenshot("14-evidence-$index.png")
            }
        }
        val relatedId = case("cooper").getJSONArray("related").getJSONObject(0).getString("caseId")
        checkStep("Rabbit Hole opens from article; related case; Android Back") {
            scroll("article_list", "rabbit_open"); screenshot("15-imagery-and-rabbit-entry.png")
            tap("rabbit_open"); await("rabbit_list")
            scroll("rabbit_list", "rabbit_depth"); node("rabbit_depth").assertTextEquals("RABBIT HOLE · 1")
            screenshot("05-rabbit-hole.png")
            scroll("rabbit_list", "rabbit_path"); screenshot("16-rabbit-connections.png")
            scroll("rabbit_list", "related_$relatedId"); screenshot("25-rabbit-first-choice.png")
            tap("related_$relatedId"); article(relatedId)
            scroll("article_list", "rabbit_open"); tap("rabbit_open")
            scroll("rabbit_list", "rabbit_depth"); node("rabbit_depth").assertTextEquals("RABBIT HOLE · 2")
            back(); article(relatedId)
            back(); await("rabbit_list")
            scroll("rabbit_list", "rabbit_depth"); node("rabbit_depth").assertTextEquals("RABBIT HOLE · 1")
        }
        checkStep("Explore; Category; category case opens article") {
            tap("nav_explore"); await("explore_list"); screenshot("02-explore.png")
            val categoryId = case("cooper").getJSONArray("categoryIds").getString(0)
            scroll("explore_list", "category_$categoryId"); tap("category_$categoryId"); await("category_list")
            scroll("category_list", "card_cooper"); tap("card_cooper"); article("cooper")
        }
        checkStep("Search result and result to article") {
            tap("nav_search"); await("search_input")
            node("search_input").performTextClearance()
            node("search_input").performTextInput("Cooper")
            await("search_result_cooper")
            node("search_input").performImeAction()
            screenshot("06-search.png")
            tap("search_result_cooper"); article("cooper")
        }
        checkStep("Save; Saved List; saved item opens correct article") {
            saveCooper(); tap("nav_saved"); await("saved_list")
            await("card_cooper"); tap("card_cooper"); article("cooper")
        }
        checkStep("Unsave removes item; re-save updates list") {
            saveCooper(); tap("nav_saved"); await("saved_empty")
            tap("nav_home"); tap("hero_open"); article("cooper"); saveCooper()
            tap("nav_saved"); await("saved_list"); await("card_cooper")
            screenshot("07-saved.png")
        }
        checkStep("Recent records articles actually read") {
            tap("recent_open"); await("recent_list")
            scroll("recent_list", "card_cooper"); node("card_cooper").assertIsDisplayed()
            screenshot("10-recent.png")
        }
        checkStep("Korean to English and back; Korean text survives activity recreation") {
            tap("nav_home"); tap("lang_toggle"); tap("hero_open"); article("cooper", "en")
            screenshot("11-article-english.png")
            tap("nav_home"); tap("lang_toggle"); tap("hero_open"); article("cooper")
            compose.activityRule.scenario.recreate(); compose.waitForIdle()
            // Navigation restoration may return Home; content and persisted save state must survive.
            tap("nav_saved"); await("saved_list"); tap("card_cooper"); article("cooper")
        }
        checkStep("Actual debug load error and retry recovery") {
            tap("nav_home"); await("hero_open")
            compose.activityRule.scenario.onActivity { it.intent.putExtra("qa_error", true) }
            compose.activityRule.scenario.recreate(); compose.waitForIdle()
            await("error_state"); screenshot("12-error.png"); tap("retry"); await("hero_open")
        }
        checkStep("Shared artifact illustrations visibly disclose their thematic use") {
            for (id in listOf("phaistos", "rohonc")) {
                tap("nav_search"); await("search_input")
                node("search_input").performTextClearance()
                node("search_input").performTextInput(case(id).getString("canonicalTitle"))
                node("search_input").performImeAction()
                tap("search_result_$id"); article(id)
                node("article_list").performScrollToIndex(0)
                compose.onAllNodesWithText("주제 공통 이미지 · 해당 유물의 모습이 아닙니다").onFirst().assertIsDisplayed()
                screenshot("19-$id-shared-illustration.png")
            }
        }
        checkStep("Narrative completion is persisted") {
            tap("nav_saved"); await("saved_list"); tap("card_cooper"); article("cooper")
            scroll("article_list", "article_read_end")
            val completed = runBlocking { withTimeout(12_000) { ProgressRepository(context).flow.first { "cooper" in it.completed } } }
            assertTrue("End-of-narrative completion recorded", "cooper" in completed.completed)
        }
        checkStep("Exact reading position is prepared for independent cold-start verification") {
            val sections = JSONObject(context.assets.open("v2/articles/cooper.json").bufferedReader().use { it.readText() }).getJSONArray("sections")
            val sectionIndex = (0 until sections.length()).first { sections.getJSONObject(it).getString("id") == "money" }
            val targetIndex = 3 + sectionIndex
            node("article_list").performScrollToIndex(targetIndex)
            compose.waitForIdle(); await("section_money")
            val expected = runBlocking { withTimeout(12_000) {
                ProgressRepository(context).flow.first { it.positions["cooper"] == (targetIndex to 0) }
            } }.positions.getValue("cooper")
            val range = node("article_list").fetchSemanticsNode().config[SemanticsProperties.VerticalScrollAxisRange].value()
            File(proofDir, "reading-position-expected.json").writeText(JSONObject()
                .put("caseId", "cooper").put("index", expected.first).put("offset", expected.second)
                .put("scrollRange", range.toDouble()).put("completed", true).toString(2))
            tap("nav_home"); await("hero_open")
        }
    }
}
