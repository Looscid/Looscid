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

/// Horizontal row of sort buttons. Each button is a plain SwiftUI Button with
/// combined accessibility, so VoiceOver reads the label, badge count, and selected state.
struct SortbarView: View {
    @ObservedObject var viewModel: SortbarViewModel

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
    return SortbarView(viewModel: model)
}
