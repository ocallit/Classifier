# ocClasificame - Interactive Classification Widget

A powerful JavaScript widget for creating interactive classification interfaces with drag-and-drop functionality, template management, and group-based organization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **Drag & Drop Classification**: Intuitive drag-and-drop interface for moving items between categories
- **Template Management**: Save and load classification templates for reuse
- **Group-Based Classification**: Organize and classify items in bulk using predefined groups
- **Read-Only Mode**: Display classifications without allowing modifications
- **Search & Filter**: Real-time search functionality to quickly find items
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Customizable**: Extensive configuration options to fit your specific needs

## 🚀 Quick Start

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <link rel="stylesheet" href="src/oc_clasificame.css">
    <script src="src/oc_clasificame.js"></script>
</head>
<body>
    <button onclick="openClassifier()">Open Classifier</button>

    <script>
        const categories = [
            { id: 'todo', label: 'Todo', title: 'To Do' },
            { id: 'doing', label: 'Doing', title: 'In Progress' },
            { id: 'done', label: 'Done', title: 'Completed' }
        ];

        const items = [
            { id: 1, name: 'Task 1', category: 'todo' },
            { id: 2, name: 'Task 2', category: 'doing' },
            { id: 3, name: 'Task 3', category: 'todo' }
        ];

        async function openClassifier() {
            const classifier = new ocClasificame(categories, items, {
                title: 'Task Classification',
                editable: true
            });

            try {
                const result = await classifier.openDialog();
                console.log('Classification result:', result);
            } catch (error) {
                console.log('Classification cancelled');
            }
        }
    </script>
</body>
</html>
```

## 📦 Installation

### Option 1: Direct Download

1. Download the files from the `src/` directory:
   - `oc_clasificame.js` - Main JavaScript file
   - `oc_clasificame.css` - Stylesheet

2. Include SortableJS dependency:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
   ```

3. Include the widget files:
   ```html
   <link rel="stylesheet" href="path/to/oc_clasificame.css">
   <script src="path/to/oc_clasificame.js"></script>
   ```

### Option 2: Copy from Repository

```bash
git clone https://github.com/ocallit/Classifier.git
cd Classifier
# Copy src/ files to your project
```

## 📚 Documentation

- **[Wiki Home](wiki/Home.md)** - Complete documentation hub
- **[API Reference](docs/oc_clasificame_docs.md)** - Detailed API documentation
- **[Quick Start Guide](wiki/Quick-Start.md)** - Get up and running fast
- **[Examples & Tutorials](wiki/Examples.md)** - Code examples and use cases
- **[Configuration Guide](wiki/Configuration.md)** - All configuration options
- **[Development Guide](wiki/Development.md)** - Contributing and development setup

## 🎯 Use Cases

- **User Permission Management**: Classify users into permission groups
- **Task Management**: Organize tasks by status, priority, or assignee
- **Content Categorization**: Sort articles, products, or media into categories
- **Workflow Management**: Move items through different workflow stages
- **Data Organization**: Any scenario requiring item classification

## 🛠️ Core Concepts

### Categories
Define the classification buckets where items can be placed:
```javascript
const categories = [
    { id: 'category1', label: 'C1', title: 'Category 1' },
    { id: 'category2', label: 'C2', title: 'Category 2' }
];
```

### Items
The objects to be classified:
```javascript
const items = [
    { id: 'item1', name: 'Item 1', category: 'category1' },
    { id: 'item2', name: 'Item 2', category: 'category2' }
];
```

### Configuration
Customize behavior through options:
```javascript
const options = {
    title: 'My Classification',
    editable: true,
    showToolbar: true,
    // ... many more options
};
```

## 🎮 Live Demo

Check out the interactive demo:
```bash
# Clone the repository
git clone https://github.com/ocallit/Classifier.git
cd Classifier

# Open the demo in your browser
open examples/clean_demo_html.html
```

## 📸 Screenshots

### Editable Mode
![Editable Classification Interface](docs/images/editable-mode.png)

### Read-Only Mode
![Read-Only Classification View](docs/images/readonly-mode.png)

### Template Management
![Template Management Interface](docs/images/template-management.png)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](wiki/Contributing.md) for details.

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ocallit/Classifier.git
   cd Classifier
   ```

2. Open examples in browser to test changes:
   ```bash
   # Open demo file
   open examples/clean_demo_html.html
   ```

3. Run tests:
   ```bash
   # Open test file in browser
   open test/oc_clasificame_tests.html
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [SortableJS](https://sortablejs.github.io/Sortable/) for drag-and-drop functionality
- Uses [Font Awesome](https://fontawesome.com/) for icons
- Inspired by various task management and classification tools

## 📧 Support

- 📖 Check the [Wiki](wiki/Home.md) for comprehensive documentation
- 🐛 Report bugs via [GitHub Issues](https://github.com/ocallit/Classifier/issues)
- 💡 Request features via [GitHub Issues](https://github.com/ocallit/Classifier/issues)

---

**Made with ❤️ by the ocClasificame team**
