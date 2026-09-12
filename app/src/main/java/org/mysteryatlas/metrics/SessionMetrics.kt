package org.mysteryatlas.metrics
import android.os.SystemClock
import org.json.JSONObject
import org.mysteryatlas.domain.AtlasRules
class SessionMetrics {
 val session = AtlasRules.Session(SystemClock.elapsedRealtime())
 fun marker() = session.marker(SystemClock.elapsedRealtime())
 fun start(id: String, entry: String) = session.startCase(id,entry,SystemClock.elapsedRealtime())
 fun complete(id: String) = session.complete(id,SystemClock.elapsedRealtime())
 fun report(): String = JSONObject().apply {
  put("units","milliseconds")
  put("first_marker_tap_time",session.firstMarker ?: JSONObject.NULL)
  put("first_case_start_time",session.firstStart ?: JSONObject.NULL)
  put("first_case_complete_time",session.firstComplete ?: JSONObject.NULL)
  put("cases_started",session.started.size);put("cases_completed",session.completed.size)
  put("marker_taps",session.markerTaps);put("random_used",session.randomUsed);put("archive_opened",session.archiveOpened)
  put("session_duration",session.duration(SystemClock.elapsedRealtime()))
  put("case_1_to_case_2",session.secondCaseId != null)
  put("second_case_entry",session.secondEntry ?: JSONObject.NULL)
  put("second_case_id",session.secondCaseId ?: JSONObject.NULL)
 }.toString(2)
}
/** Explicit no-op seam; never requests ads or imposes a delay. */
fun interface CaseExitPolicy { fun onExit(caseId: String) }
