package com.looscid.app.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

private data class TabItem(val label: String, val message: String)

private val tabs = listOf(
    TabItem("Feed", "Your feed will appear here."),
    TabItem("Dreams", "Your dreams will appear here."),
    TabItem("Relays", "Relay connections will appear here."),
    TabItem("Settings", "Settings and restore will appear here.")
)

@Composable
fun LooscidTabs() {
    var selectedIndex by remember { mutableIntStateOf(0) }
    Scaffold(
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedIndex == index,
                        onClick = { selectedIndex = index },
                        icon = { },
                        label = { Text(tab.label) },
                        modifier = Modifier.semantics {
                            role = Role.Tab
                            selected = selectedIndex == index
                        }
                    )
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentAlignment = Alignment.Center
        ) {
            val current = tabs[selectedIndex]
            Text(
                text = current.message,
                textAlign = TextAlign.Center,
                modifier = Modifier.semantics { contentDescription = current.label }
            )
        }
    }
}
