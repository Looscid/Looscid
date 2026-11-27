import SwiftUI

/// One segment of the sort bar.
struct SortbarSegment: Identifiable, Equatable {
    let id: String
    let label: String
    let badgeCount: Int
}

/// Holds the segment list and the selected index. Views observe this object.
final class SortbarViewModel: ObservableObject {
    @Published var selectedIndex: Int = 0
    let segments: [SortbarSegment]

    init(segments: [SortbarSegment]) {
        self.segments = segments
    }
}

/// Horizontal row of sort buttons. For VoiceOver the whole bar is one adjustable element:
/// focus it, then swipe up (next segment) or down (previous segment). Touch still uses the buttons.
struct SortbarView: View {
    @ObservedObject var viewModel: SortbarViewModel
    /// Name VoiceOver reads for the whole bar, for example "Filter".
    var label: String = "Filter"

    /// Value VoiceOver reads after each swipe, for example "Replies, 3 of 9" or "Replies, 3 of 9, 2 new".
    private var valueText: String {
        guard viewModel.segments.indices.contains(viewModel.selectedIndex) else { return "" }
        let segment = viewModel.segments[viewModel.selectedIndex]
        let badge = segment.badgeCount > 0 ? ", \(segment.badgeCount) new" : ""
        return "\(segment.label), \(viewModel.selectedIndex + 1) of \(viewModel.segments.count)\(badge)"
    }

    private func adjust(_ direction: AccessibilityAdjustmentDirection) {
        let last = viewModel.segments.count - 1
        guard last >= 0 else { return }
        switch direction {
        case .increment:
            viewModel.selectedIndex = min(viewModel.selectedIndex + 1, last)
        case .decrement:
            viewModel.selectedIndex = max(viewModel.selectedIndex - 1, 0)
        @unknown default:
            break
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            ForEach(Array(viewModel.segments.enumerated()), id: \.offset) { index, segment in
                Button {
                    viewModel.selectedIndex = index
                } label: {
                    segmentContent(segment, isSelected: viewModel.selectedIndex == index)
                }
                .buttonStyle(.plain)
                .accessibilityElement(children: .combine)
                .accessibilityAddTraits(viewModel.selectedIndex == index ? [.isButton, .isSelected] : [.isButton])
            }
        }
        .padding(.horizontal)
        // One element for VoiceOver: the individual buttons are hidden from it, and the bar adjusts instead.
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .accessibilityValue(valueText)
        .accessibilityAddTraits(.isAdjustable)
        .accessibilityAdjustableAction { direction in
            adjust(direction)
        }
    }

    @ViewBuilder
    private func segmentContent(_ segment: SortbarSegment, isSelected: Bool) -> some View {
        ZStack(alignment: .topTrailing) {
            Text(segment.label)
                .font(.subheadline.weight(isSelected ? .semibold : .regular))
                .foregroundStyle(isSelected ? Color.primary : Color.secondary)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                    Capsule().fill(isSelected ? Color.accentColor.opacity(0.15) : Color.clear)
                )

            if segment.badgeCount > 0 {
                Text("\(segment.badgeCount)")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Color.white)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(Circle().fill(Color.red))
                    .offset(x: 4, y: -4)
            }
        }
    }
}

#Preview {
    let model = SortbarViewModel(segments: [
        SortbarSegment(id: "new", label: "New", badgeCount: 3),
        SortbarSegment(id: "top", label: "Top", badgeCount: 0),
        SortbarSegment(id: "near", label: "Nearby", badgeCount: 12)
    ])
    return SortbarView(viewModel: model, label: "Feed filter")
}
