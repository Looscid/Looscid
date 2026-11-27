import SwiftUI

/// Kind of alert, mirroring the web app's Alerts tabs (app/js/alerts.js; alert types in app/js/core.js LC_ALERT_TYPES).
enum AlertKind: Equatable {
    case message
    case reply
    case mention
    case like
    case redream
    case quote
    case newDreamor
    case other
}

/// One alert row. The real data source is not wired yet; the screen takes items as input.
struct AlertItem: Identifiable, Equatable {
    let id: String
    let kind: AlertKind
    let isUnread: Bool
    let text: String
}

/// Alerts screen: filter bar on top, list below that reacts to the selected segment.
/// Each instance owns its own SortbarViewModel, so two Alerts screens never share selection state.
struct AlertsView: View {
    /// Filter segments, in the same order as the web app's Alerts tabs.
    static let segments: [SortbarSegment] = [
        SortbarSegment(id: "all", label: "All", badgeCount: 0),
        SortbarSegment(id: "unread", label: "Unread", badgeCount: 0),
        SortbarSegment(id: "messages", label: "Messages", badgeCount: 0),
        SortbarSegment(id: "replies", label: "Replies", badgeCount: 0),
        SortbarSegment(id: "mentions", label: "Mentions", badgeCount: 0),
        SortbarSegment(id: "likes", label: "Likes", badgeCount: 0),
        SortbarSegment(id: "redreams", label: "Redreams", badgeCount: 0),
        SortbarSegment(id: "quotes", label: "Quotes", badgeCount: 0),
        SortbarSegment(id: "newDreamor", label: "New Dreamor", badgeCount: 0)
    ]

    @StateObject private var filter: SortbarViewModel
    let items: [AlertItem]

    init(items: [AlertItem]) {
        _filter = StateObject(wrappedValue: SortbarViewModel(segments: AlertsView.segments))
        self.items = items
    }

    private var visibleItems: [AlertItem] {
        let index = filter.selectedIndex
        guard filter.segments.indices.contains(index) else { return items }
        switch filter.segments[index].id {
        case "unread": return items.filter { $0.isUnread }
        case "messages": return items.filter { $0.kind == .message }
        case "replies": return items.filter { $0.kind == .reply }
        case "mentions": return items.filter { $0.kind == .mention }
        case "likes": return items.filter { $0.kind == .like }
        case "redreams": return items.filter { $0.kind == .redream }
        case "quotes": return items.filter { $0.kind == .quote }
        case "newDreamor": return items.filter { $0.kind == .newDreamor }
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
        AlertsView(items: [
            AlertItem(id: "1", kind: .mention, isUnread: true, text: "Someone mentioned you"),
            AlertItem(id: "2", kind: .reply, isUnread: false, text: "Someone replied to your Dream"),
            AlertItem(id: "3", kind: .like, isUnread: true, text: "Someone liked your Dream"),
            AlertItem(id: "4", kind: .message, isUnread: true, text: "New private message")
        ])
    }
}
