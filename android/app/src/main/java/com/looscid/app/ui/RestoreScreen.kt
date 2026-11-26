package com.looscid.app.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

private val categories = listOf(
    "Identity", "Profile", "Dreams", "Chats", "Follows and feeds", "Sound and settings"
)

@Composable
fun RestoreScreen() {
    val checked = remember { mutableStateMapOf<String, Boolean>() }
    var status by remember { mutableStateOf("Choose a backup file to begin.") }
    val selectedCount = checked.values.count { it }

    Column(modifier = Modifier.padding(16.dp)) {
        Text(
            text = status,
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite }
        )
        categories.forEach { name ->
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Text(name, modifier = Modifier.weight(1f))
                Switch(
                    checked = checked[name] == true,
                    onCheckedChange = { checked[name] = it }
                )
            }
        }
        Button(
            onClick = { status = "Restoring $selectedCount categories." },
            enabled = selectedCount > 0
        ) {
            Text("Restore selected")
        }
    }
}
