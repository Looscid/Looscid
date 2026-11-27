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
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

/** Kind of alert, used only for filtering. */
enum class AlertKind { MENTION, DIRECT, OTHER }

/** One alert row. The real data source is not wired yet; the screen takes items as input. */
data class AlertItem(val id: String, val kind: AlertKind, val text: String)

/** Segments shown in the Alerts filter bar. Index order must match [alertsFilterFor]. */
val alertsSegments = listOf(
    SortbarSegment(id = "all", label = "All", badgeCount = 0),
    SortbarSegment(id = "mentions", label = "Mentions", badgeCount = 0),
    SortbarSegment(id = "direct", label = "Direct", badgeCount = 0),
)

/** Returns the items that match the selected filter index: 0 = All, 1 = Mentions, 2 = Direct. */
fun alertsFilterFor(items: List<AlertItem>, selectedIndex: Int): List<AlertItem> = when (selectedIndex) {
    1 -> items.filter { it.kind == AlertKind.MENTION }
    2 -> items.filter { it.kind == AlertKind.DIRECT }
    else -> items
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
