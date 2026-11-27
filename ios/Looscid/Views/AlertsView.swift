import SwiftUI

/// Kind of alert. The raw value is used only for filtering, not shown to the user.
enum AlertKind: Equatable {
    case mention
    case direct
    case other
}

/// One alert row. Real data source is not wired yet; the screen takes items as input.
struct AlertItem: Identifiable, Equatable {
    let id: String
    let kind: AlertKind
    let text: String
}

/// Alerts screen: a filter bar at the top and a list that reacts to the selected segment.
struct AlertsView: View {
    @ObservedObject var filter: SortbarViewModel
    let items: [AlertItem]

    /// Segment order must match the SortbarViewModel segments created in `AlertsView.defaultFilter`.
    static let defaultFilter = SortbarViewModel(segments: [
        SortbarSegment(id: "all", label: "All", badgeCount: 0),
        SortbarSegment(id: "mentions", label: "Mentions", badgeCount: 0),
        SortbarSegment(id: "direct", label: "Direct", badgeCount: 0)
    ])

    private var visibleItems: [AlertItem] {
        switch filter.selectedIndex {
        case 1: return items.filter { $0.kind == .mention }
        case 2: return items.filter { $0.kind == .direct }
        default: return items
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            SortbarView(viewModel: filter)
                .padding(.top, 8)

            if visibleItems.isEmpty {
                Text("No alerts here yet.")
                    .font(.body)
                    .foregroundStyle(Color.primary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 32)
                    .accessibilityLabel("No alerts here yet")
            } else {
                List(visibleItems) { item in
                    Text(item.text)
                        .font(.body)
                        .foregroundStyle(Color.primary)
                        .accessibilityLabel(item.text)
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Alerts")
    }
}

#Preview {
    NavigationStack {
        AlertsView(
            filter: AlertsView.defaultFilter,
            items: [
                AlertItem(id: "1", kind: .mention, text: "Someone mentioned you"),
                AlertItem(id: "2", kind: .direct, text: "New direct message")
            ]
        )
    }
}
