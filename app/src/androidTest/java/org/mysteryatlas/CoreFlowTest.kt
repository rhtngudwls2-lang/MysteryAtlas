package org.mysteryatlas

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.junit.Rule
import org.junit.Test

/** Run ONLY on a cleared test install. Not executed in the authoring container. */
class CoreFlowTest {
 @get:Rule val compose=createAndroidComposeRule<MainActivity>()
 private fun tag(s:String)=compose.onNodeWithTag(s)
 private fun click(s:String) {tag(s).performScrollTo().performClick();compose.waitForIdle()}
 private fun awaitTag(s:String) {compose.waitUntil(8000){compose.onAllNodesWithTag(s).fetchSemanticsNodes().isNotEmpty()}}
 @Test fun freshBloopRecreationLanguageRandomArchive() {
  awaitTag("progress")
  tag("progress").assertTextContains("0 / 3",substring=true)
  // The ocean marker is unclustered on the initial world view.
  compose.onNode(hasContentDescription("The Bloop") or hasContentDescription("블룹")).performClick()
  awaitTag("investigate");click("investigate")
  awaitTag("next");click("next")
  click("theory_creature")
  compose.waitUntil(8000){runCatching{tag("next").assertIsEnabled();true}.getOrDefault(false)}
  click("next")
  // First evidence must survive Activity recreation.
  compose.activityRule.scenario.recreate()
  awaitTag("next");click("next");click("next")
  awaitTag("reveal");click("reveal")
  awaitTag("completed");tag("verdict_status").assertExists()
  click("return");awaitTag("progress")
  tag("progress").assertTextContains("1 / 3",substring=true)
  compose.activityRule.scenario.recreate()
  awaitTag("progress");tag("progress").assertTextContains("1 / 3",substring=true)
  tag("nav_archive").performClick()
  awaitTag("archive_progress");tag("archive_progress").assertTextContains("1 / 3",substring=true)
  compose.onNode(hasText("SETTINGS") or hasText("설정")).performClick()
  click("lang_en");compose.onNodeWithText("LANGUAGE").assertExists()
  click("lang_ko");compose.onNodeWithText("언어").assertExists()
  tag("nav_map").performClick();tag("random").performClick()
  awaitTag("investigate");click("investigate");awaitTag("next");click("next")
  compose.onAllNodes(hasTestTag("theory_aliens") or hasTestTag("theory_cipher"))[0].performScrollTo().performClick()
  compose.waitUntil(8000){runCatching{tag("next").assertIsEnabled();true}.getOrDefault(false)}
  click("next");click("next");click("next");click("reveal")
  awaitTag("completed");click("return");awaitTag("progress")
  tag("progress").assertTextContains("2 / 3",substring=true)
 }
}
