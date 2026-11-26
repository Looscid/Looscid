import SwiftUI

struct RestoreView: View {
    @State private var selected: Set<String> = []
    @State private var status: String = "Choose a backup file to begin."

    private let categories = ["Identity", "Profile", "Dreams", "Chats", "Follows and feeds", "Sound and settings"]

    var body: some View {
        Form {
            Section {
                Text(status)
                    .accessibilityAddTraits(.updatesFrequently)
            }
            Section("Restore") {
                ForEach(categories, id: \.self) { name in
                    Toggle(name, isOn: Binding(
                        get: { selected.contains(name) },
                        set: { on in
                            if on { selected.insert(name) } else { selected.remove(name) }
                        }
                    ))
                }
            }
            Section {
                Button("Restore selected") {
                    status = "Restoring \(selected.count) categories."
                    AccessibilityNotification.Announcement(status).post()
                }
                .disabled(selected.isEmpty)
            }
        }
        .navigationTitle("Restore")
    }
}
