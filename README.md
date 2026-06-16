# 📍 MemoMap - Every Place Has a Story

> Transform your memories into an interactive, living map. Pin your adventures, moments, and stories to locations around the world.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)

## 🌟 Overview

**MemoMap** is an innovative web application that lets you create, organize, and visualize your memories on an interactive world map. Whether it's your favorite café, a travel adventure, a special milestone, or a cherished friendship moment—MemoMap turns every location into a story.

## ✨ Key Features

- 🗺️ **Interactive Map** - Pin and visualize your memories on a dynamic world map
- 💾 **Memory Collections** - Organize memories into custom collections for easy browsing
- 📖 **Timeline View** - See your memories chronologically and relive your journey
- 📓 **Digital Diary** - Write detailed diary entries connected to locations
- 📸 **Photo Memories** - Attach images to bring your stories to life
- 🔔 **Notifications** - Get reminders and updates about your memories
- 👥 **Social Features** - Share moments with friends and family
- 🎨 **Customization** - Personalize your profile and theme preferences
- 🌙 **Dark/Light Mode** - Comfortable viewing in any lighting condition
- 🔐 **Secure Authentication** - Safe login and data protection with Firebase

## 🎯 Features at a Glance

| Feature | Description |
|---------|-------------|
| 🎯 Memory Management | Create, edit, and delete memories with ease |
| 📊 Dashboard | Get an overview of your memory statistics |
| 🏞️ Nostalgia Gallery | Browse memories grouped by themes |
| ⏰ Timeline | Track your memories chronologically |
| 🎨 Themes | Choose from multiple color schemes |
| 🔍 Search | Quickly find specific memories |
| 📤 Export | Share your stories with others |

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Authentication, Database, Storage)
- **Icons**: RemixIcon, FontAwesome
- **Fonts**: Google Fonts (Poppins)
- **Map Library**: Interactive map integration
- **Storage**: Cloud-based with Firebase

## 📦 Project Structure

```
MemoMap/
├── index.html                 # Landing page
├── login.html                 # User authentication
├── signup.html                # User registration
├── dashboard.html             # Main dashboard
├── map.html                   # Interactive memory map
├── timeline.html              # Timeline view
├── diary.html                 # Diary entries
├── collections.html           # Memory collections
├── memory-detail.html         # Individual memory view
├── profile.html               # User profile
├── settings.html              # Settings page
├── notifications.html         # Notifications center
├── nostalgia.html             # Nostalgia gallery
├── help.html                  # Help & FAQ
├── demo.html                  # Demo experience
│
├── css/                       # Stylesheets
│   ├── style.css              # Global styles
│   ├── dashboard.css          # Dashboard styles
│   ├── map.css                # Map styles
│   ├── timeline.css           # Timeline styles
│   └── [other page styles]
│
└── js/                        # JavaScript modules
    ├── app.js                 # Main app logic
    ├── firebase-config.js     # Firebase configuration
    ├── auth.js                # Authentication logic
    ├── memories.js            # Memory management
    ├── storage.js             # Local storage utilities
    ├── utils.js               # Helper functions
    └── [other feature scripts]
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (for backend services)
- Internet connection

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/memomap.git
   cd memomap
   ```

2. **Configure Firebase**
   - Update `js/firebase-config.js` with your Firebase credentials
   - Enable Authentication, Firestore Database, and Storage in Firebase Console

3. **Open in browser**
   ```bash
   # Using a local server (recommended)
   python -m http.server 8000
   # or
   python3 -m http.server 8000
   ```
   - Navigate to `http://localhost:8000`

4. **Create an account**
   - Sign up for a new account on the signup page
   - Start creating your memory map!

## 📖 Usage Guide

### Creating a Memory 📌
1. Click "Add Memory" from the dashboard
2. Select a location on the map
3. Add photos, title, and description
4. Choose a category (travel, food, friendship, milestone, etc.)
5. Save your memory

### Organizing Collections 📚
1. Go to Collections from the main menu
2. Create a new collection or select an existing one
3. Add or remove memories from collections
4. Share collections with friends

### Viewing Timeline ⏰
1. Navigate to Timeline
2. Browse memories in chronological order
3. Filter by year, month, or category
4. Click on any memory for details

### Managing Diary 📝
1. Access Diary from the dashboard
2. Write entries connected to locations
3. Attach memories to diary entries
4. Search through past entries

## 🎨 Customization

### Theme Settings
- Navigate to Settings
- Choose from available color themes
- Enable/disable dark mode
- Adjust display preferences

### Profile Customization
- Upload a profile picture
- Add a bio and interests
- Set privacy preferences
- Manage notifications

## 🔐 Security & Privacy

- 🔒 All data is encrypted and secured with Firebase
- 🛡️ Two-factor authentication available
- 👤 Privacy controls for sharing memories
- 🗑️ Easy data deletion options

## 🐛 Troubleshooting

### Common Issues

**Memory not appearing on map?**
- Ensure location coordinates are valid
- Check internet connection
- Refresh the browser

**Login issues?**
- Clear browser cache and cookies
- Verify email address
- Reset password if needed

**Photos not uploading?**
- Check file size (max 10MB recommended)
- Verify file format (JPG, PNG, WebP)
- Check storage quota

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Mobile app (iOS & Android)
- [ ] Advanced map filters and search
- [ ] Memory sharing with friends
- [ ] Collaborative memory albums
- [ ] AI-powered memory suggestions
- [ ] Memory analytics and insights
- [ ] Offline mode support
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support & Contact

- 📧 Email: support@memomap.com
- 🐛 Report bugs: [GitHub Issues](https://github.com/yourusername/memomap/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/memomap/discussions)
- 🌐 Website: [www.memomap.com](https://www.memomap.com)

## 👨‍💻 Author

**Developed with ❤️ by Your Team**

---

<div align="center">

### 🌍 Ready to Map Your Memories?

[**Start Your Journey Now** →](index.html)

**Made with ❤️ | © 2024 MemoMap. All rights reserved.**

</div>