# 📝 Post Generator

A clean, modern web-based tool for creating blog posts with YAML frontmatter. Built with vanilla JavaScript and EasyMDE markdown editor.

![GitHub](https://img.shields.io/github/license/trabigator/post-generator)
![GitHub stars](https://img.shields.io/github/stars/trabigator/post-generator)

## ✨ Features

- **Markdown Editor** - Rich markdown editing with toolbar, preview, and side-by-side mode
- **📅 Date & Time** - Set publication date with convenient "Now" button
- **🏷️ Tag Management** - Add tags with autocomplete from history
- **⏱️ Auto Read Time** - Automatically calculates estimated read time
- **🌙 Dark/Light Mode** - Toggle between themes for comfortable writing
- **💾 Auto-Save** - Your work is automatically saved to localStorage
- **📥 Export Options** - Download as `.md` file or copy to clipboard
- **🎨 YAML Frontmatter** - Generates clean frontmatter for static site generators

## 🚀 Getting Started

Simply open `index.html` in your browser. No build step or server required.

```bash
# Or serve locally
npx serve .
```

## 📖 Usage

1. **Fill in details** - Add title, teaser, date, time, and tags
2. **Write content** - Use the markdown editor for your post body
3. **Generate** - Click "Generate Post" to create the output
4. **Export** - Download as `.md` file or copy to clipboard

### Frontmatter Output

```yaml
---
headline: "Your Post Title"
date: "2024-01-15"
datetime: "2024-01-15T10:30:00Z"
readTime: "5 min read"
teaser: "A brief description of your post"
tags: ["javascript", "tutorial"]
---

Your markdown content here...
```

## ⌨️ Markdown Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+K` | Link |
| `Ctrl+S` | Save (downloads file) |
| `Ctrl+Shift+P` | Preview |
| `F11` | Fullscreen |

## 🛠️ Tech Stack

- [EasyMDE](https://easy-markdown-editor.tk/) - Markdown editor
- [CodeMirror](https://codemirror.net/) - Code editor component
- Vanilla JavaScript (no frameworks)
- CSS Variables for theming

## 📄 License

MIT License - feel free to use this for your own projects.

---

<p align="center">Made with ☕ and ❤️</p>
