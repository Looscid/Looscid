// swift-tools-version:5.10
import PackageDescription

let package = Package(
    name: "Looscid",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "LooscidCore", targets: ["LooscidCore"])
    ],
    targets: [
        .target(name: "LooscidCore", path: "Looscid/Core"),
        .testTarget(name: "LooscidCoreTests", dependencies: ["LooscidCore"], path: "Tests/LooscidCoreTests")
    ]
)
