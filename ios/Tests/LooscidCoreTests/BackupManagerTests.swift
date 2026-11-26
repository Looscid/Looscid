import XCTest
@testable import LooscidCore

final class BackupManagerTests: XCTestCase {
    func testParsesPlaintextWithMarker() throws {
        let json = #"""
        {"looscid_backup_data":1,"key":{"nsec":"nsec1x"},"profile":{"name":"Sample"},"app":{"looscid_theme":"light"}}
        """#
        let b = try BackupManager.parsePlaintext(Data(json.utf8))
        XCTAssertEqual(b.nsec, "nsec1x")
        XCTAssertEqual(b.profileName, "Sample")
        XCTAssertEqual(b.categories, ["looscid_theme"])
    }

    func testRejectsEncryptedAsPasswordRequired() {
        let json = #"""
        {"looscid_backup":1,"kdf":{},"cipher":{},"data":"x"}
        """#
        XCTAssertThrowsError(try BackupManager.parsePlaintext(Data(json.utf8))) { error in
            XCTAssertEqual(error as? BackupManager.BackupError, .passwordRequired)
        }
    }

    func testRejectsNonBackup() {
        XCTAssertThrowsError(try BackupManager.parsePlaintext(Data("[1,2]".utf8)))
    }
}
