package com.looscid.app.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Modifier
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

/** Kind of alert, mirroring the web app's Alerts tabs (app/js/alerts.js; alert types in app/js/core.js LC_ALERT_TYPES). */
enum class AlertKind { MESSAGE, REPLY, MENTION, LIKE, REDREAM, QUOTE, NEW_DREAMOR, OTHER }

/** One alert row. The real data source is not wired yet; the screen takes items as input. */
data class AlertItem(val id: String, val kind: AlertKind, val isUnread: Boolean, val text: String)

/**
 * Filter segments, in the same order as the web app's Alerts tabs.
 * Each segment's id is what [alertsFilterFor] matches on, so reordering the list does not change the filter logic.
 */
val alertsSegments = listOf(
    SortbarSegment(id = "all", label = "All", badgeCount = 0),
    SortbarSegment(id = "unread", label = "Unread", badgeCount = 0),
    SortbarSegment(id = "messages", label = "Messages", badgeCount = 0),
    SortbarSegment(id = "replies", label = "Replies", badgeCount = 0),
    SortbarSegment(id = "mentions", label = "Mentions", badgeCount = 0),
    SortbarSegment(id = "likes", label = "Likes", badgeCount = 0),
    SortbarSegment(id = "redreams", label = "Redreams", badgeCount = 0),
    SortbarSegment(id = "quotes", label = "Quotes", badgeCount = 0),
    SortbarSegment(id = "newDreamor", label = "New Dreamor", badgeCount = 0),
)

/** Returns the items that match the segment at [selectedIndex] in [alertsSegments]. */
fun alertsFilterFor(items: List<AlertItem>, selectedIndex: Int): List<AlertItem> {
    val segmentId = alertsSegments.getOrNull(selectedIndex)?.id ?: return items
    return when (segmentId) {
        "unread" -> items.filter { it.isUnread }
        "messages" -> items.filter { it.kind == AlertKind.MESSAGE }
        "replies" -> items.filter { it.kind == AlertKind.REPLY }
        "mentions" -> items.filter { it.kind == AlertKind.MENTION }
        "likes" -> items.filter { it.kind == AlertKind.LIKE }
        "redreams" -> items.filter { it.kind == AlertKind.REDREAM }
        "quotes" -> items.filter { it.kind == AlertKind.QUOTE }
        "newDreamor" -> items.filter { it.kind == AlertKind.NEW_DREAMOR }
        else -> items
    }
}

/**
 * Alerts screen: filter bar on top, list below that reacts to the selected segment.
 * The list is recomputed whenever [SortbarViewModel.selectedIndex] changes.
 */
@Composable
fun AlertsScreen(
    filterViewModel: SortbarViewModel,
    items: List<AlertItem>,
    modifier: Modifier = Modifier,
) {
    val selectedIndex by filterViewModel.selectedIndex.collectAsState()
    val visible = alertsFilterFor(items, selectedIndex)

    Column(modifier = modifier.fillMaxSize()) {
        SortbarView(viewModel = filterViewModel, segments = alertsSegments)

        if (visible.isEmpty()) {
            Text(
                text = "No alerts here yet.",
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 32.dp),
            )
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(visible, key = { it.id }) { item ->
                    Text(
                        text = item.text,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                    )
                }
            }
        }
    }
}
