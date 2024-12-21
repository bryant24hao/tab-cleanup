# Tab Cleanup

A Chrome extension that helps you maintain a clean and efficient browsing experience by automatically managing inactive tabs.

<p align="center">
  <img src="screenshots/demo.gif" alt="Tab Cleanup Demo" width="600">
</p>

## Features

- **Smart Tab Management** - Automatically identifies and manages tabs based on their last active time
- **Flexible Time Ranges** - Choose from preset options or set your own custom time range:
  - 1 hour
  - 12 hours
  - 24 hours
  - 1 week
  - Custom duration (minutes/hours/days)
- **Real-time Statistics** - Shows the current number of tabs and potential cleanup candidates
- **Safe Operation** - Always preserves your active tab and requires confirmation before closing tabs

## Installation

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) (Coming soon)
2. Search for "Tab Cleanup"
3. Click "Add to Chrome"

## Usage

1. Click the Tab Cleanup icon in your Chrome toolbar
2. View the current number of open tabs
3. Choose a time range for cleanup:
   - Click any preset time range button
   - Or use the custom time range option
4. Confirm the action to close inactive tabs
5. Use Chrome's built-in restore feature if you need to recover any closed tabs

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/bryant24hao/tab-cleanup.git
   cd tab-cleanup
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Privacy & Security

We take your privacy seriously:
- No data collection or tracking
- No external server communication
- All operations are performed locally
- Minimal permission requirements

## Support

Need help or have suggestions? We're here to help:
- [Report an issue](https://github.com/bryant24hao/tab-cleanup/issues)
- [Email support](mailto:chenzhenghao94@gmail.com)

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
