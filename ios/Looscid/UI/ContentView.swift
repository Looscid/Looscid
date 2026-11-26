import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Tab("Feed", systemImage: "list.bullet") {
                PlaceholderView(title: "Feed", message: "Your feed will appear here.")
            }
            Tab("Dreams", systemImage: "sparkles") {
                PlaceholderView(title: "Dreams", message: "Your dreams will appear here.")
            }
            Tab("Relays", systemImage: "antenna.radiowaves.left.and.right") {
                PlaceholderView(title: "Relays", message: "Relay connections will appear here.")
            }
            Tab("Settings", systemImage: "gearshape") {
                NavigationStack {
                    List {
                        NavigationLink("Restore from backup") {
                            RestoreView()
                        }
                    }
                    .navigationTitle("Settings")
                }
            }
        }
    }
}

private struct PlaceholderView: View {
    let title: String
    let message: String

    var body: some View {
        NavigationStack {
            ContentUnavailableView(title, systemImage: "tray", description: Text(message))
                .navigationTitle(title)
        }
    }
}
