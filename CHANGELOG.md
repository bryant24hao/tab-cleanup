# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2024-12-25

### Fixed
- Fixed a bug where individually closed tabs in preview would reappear when clicking Cancel
- Made single tab close action immediate in preview mode
- Improved error handling for already closed tabs in batch operation

## [1.0.1] - 2024-12-23

### Changed
- Removed unused scripting permission to comply with Chrome Web Store requirements
- Updated permissions to use minimum required set: tabs, storage, and activeTab

## [1.0.0] - 2024-12-22

### Added
- Initial release
- Feature to automatically clean up inactive tabs
- Custom time range selection
- Preview mode before closing tabs
- Local storage for tab activity tracking
- Privacy-focused implementation with local-only data storage
