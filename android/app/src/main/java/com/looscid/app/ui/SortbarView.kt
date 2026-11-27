package com.looscid.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.mergeDescendants
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** One segment of the sort bar. */
data class SortbarSegment(val id: String, val label: String, val badgeCount: Int)

/** Holds the selected index. The segment list is passed to [SortbarView] directly. */
class SortbarViewModel : ViewModel() {
    private val _selectedIndex = MutableStateFlow(0)
    val selectedIndex: StateFlow<Int> = _selectedIndex.asStateFlow()

    fun select(index: Int) {
        _selectedIndex.value = index
    }
}

/**
 * Horizontal row of sort buttons. For TalkBack the whole bar is one adjustable element:
 * focus it, then swipe up (next segment) or down (previous segment). Touch still uses the segment buttons.
 */
@Composable
fun SortbarView(viewModel: SortbarViewModel, segments: List<SortbarSegment>, label: String = "Filter") {
    val selectedIndex by viewModel.selectedIndex.collectAsState()
    val count = segments.size
    val current = segments.getOrNull(selectedIndex)
    // Read after each swipe, for example "Replies, 3 of 9" or "Replies, 3 of 9, 2 new".
    val valueText = if (current == null) "" else {
        val badge = if (current.badgeCount > 0) ", ${current.badgeCount} new" else ""
        "${current.label}, ${selectedIndex + 1} of $count$badge"
    }

    Row(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .semantics(mergeDescendants = true) {
                contentDescription = label
                stateDescription = valueText
                if (count > 0) {
                    progressBarRangeInfo = ProgressBarRangeInfo(
                        current = selectedIndex.toFloat(),
                        range = 0f..(count - 1).toFloat(),
                        steps = (count - 2).coerceAtLeast(0),
                    )
                    setProgress { target ->
                        val next = Math.round(target).coerceIn(0, count - 1)
                        if (next != selectedIndex) viewModel.select(next)
                        true
                    }
                }
            },
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        segments.forEachIndexed { index, segment ->
            val isSelected = index == selectedIndex
            SortbarItem(
                segment = segment,
                isSelected = isSelected,
                onClick = { viewModel.select(index) },
            )
        }
    }
}

@Composable
private fun SortbarItem(segment: SortbarSegment, isSelected: Boolean, onClick: () -> Unit) {
    val badgeText = if (segment.badgeCount > 0) ", ${segment.badgeCount} new" else ""

    Box(
        modifier = Modifier
            .semantics(mergeDescendants = true) {
                selected = isSelected
                contentDescription = "${segment.label}$badgeText"
            }
            .clickable(role = Role.Button, onClick = onClick),
    ) {
        Box(
            modifier = Modifier
                .background(
                    color = if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f) else Color.Transparent,
                    shape = RoundedCornerShape(50),
                )
                .padding(PaddingValues(horizontal = 12.dp, vertical = 6.dp)),
        ) {
            Text(
                text = segment.label,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                color = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        if (segment.badgeCount > 0) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(start = 0.dp)
                    .background(color = MaterialTheme.colorScheme.error, shape = CircleShape)
                    .padding(horizontal = 5.dp, vertical = 1.dp),
            ) {
                Text(
                    text = segment.badgeCount.toString(),
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    color = Color.White,
                )
            }
        }
    }
}
