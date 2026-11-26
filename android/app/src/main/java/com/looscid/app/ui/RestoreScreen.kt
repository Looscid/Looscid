package com.looscid.app.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.semantics.Role
import androidx.compose.foundation.selection.toggleable

private val categories = listOf(
    "Identity", "Profile", "Dreams", "Chats", "Follows and feeds", "Sound and settings"
)

@Composable
fun RestoreScreen(modifier: Modifier = Modifier) {
    val checked = remember { mutableStateMapOf<String, Boolean>() }
    var status by remember { mutableStateOf("Choose a backup file to begin.") }
    val selectedCount = checked.values.count { it }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            text = status,
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite }
        )
        categories.forEach { name ->
            val isOn = checked[name] == true
            // The whole row is the switch target, so the label and switch state are read together.
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
                    .toggleable(
                        value = isOn,
                        role = Role.Switch,
                        onValueChange = { checked[name] = it }
                    )
            ) {
                Text(name, modifier = Modifier.weight(1f))
                Switch(checked = isOn, onCheckedChange = null)
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
