package org.mysteryatlas

import androidx.compose.foundation.layout.size
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.unit.dp
import androidx.test.platform.app.InstrumentationRegistry
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.mysteryatlas.data.*
import org.mysteryatlas.ui.Art
import org.mysteryatlas.ui.AtlasTheme

/** Prepared Android regressions. These assertions have NOT run on a host-only environment. */
class V2RuleRegressionTest {
    @get:Rule val compose = createComposeRule()
    private fun catalog() = runBlocking {
        ContentRepository(InstrumentationRegistry.getInstrumentation().targetContext).catalog()
    }

    @Test fun revisitingDyatlovPreservesTheActualEarlierRoute() {
        val data = catalog()
        val prior = listOf("cooper", "mary-celeste", "dyatlov", "wow")
        val restored = relatedPath(prior, "dyatlov")
        assertEquals(listOf("cooper", "mary-celeste", "dyatlov"), restored)
        assertEquals(restored, relatedPath(restored, "dyatlov"))
        restored.zipWithNext().forEach { (from, to) ->
            assertTrue(data.cases.first { it.id == from }.related.any { it.caseId == to })
        }
    }

    @Test fun exactAliasOutranksEarlierMetadataMatchAndNormalizesPunctuation() {
        val data = catalog()
        val base = data.cases.first()
        val metadataMatch = base.copy(id = "a-metadata", canonicalTitle = "Unrelated story",
            aliases = listOf("Other name"), tags = listOf("needle"),
            headline = Copy(mapOf("ko" to "다른 이야기", "en" to "Other headline")))
        val exact = base.copy(id = "z-exact", canonicalTitle = "Exact story", aliases = listOf("Needle"))
        val fixture = data.copy(cases = listOf(metadataMatch, exact))
        assertEquals(listOf("z-exact", "a-metadata"), searchStories(fixture, "ＮＥＥＤＬＥ!").map { it.id })
        assertEquals("cooper", searchStories(data, "D. B. Cooper").first().id)
        assertTrue(searchStories(data, "no-such-mystery-984721").isEmpty())
    }

    @Test fun missingImageEndsLoadingAndShowsAnHonestFallback() {
        compose.setContent { AtlasTheme { Art("images/not-present.webp", "en", Modifier.size(220.dp)) } }
        compose.waitUntil(12_000) {
            compose.onAllNodesWithTag("art_error", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()
        }
        compose.onNodeWithText("Image unavailable").assertIsDisplayed()
        compose.onAllNodesWithTag("art_loading", useUnmergedTree = true).assertCountEquals(0)
    }
}
