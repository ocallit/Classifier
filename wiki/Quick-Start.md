# Quick Start Guide

Get up and running with ocClasificame in just a few minutes!

## 🎯 What You'll Learn

By the end of this guide, you'll have:
- A working classification interface
- Understanding of core concepts
- Knowledge of basic configuration options

## 📋 Prerequisites

- Basic HTML/JavaScript knowledge
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE

## 🚀 Step 1: Download Dependencies

You'll need two things:

### 1. SortableJS (Required)
```html
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
```

### 2. Font Awesome (Optional, for icons)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

## 📁 Step 2: Get ocClasificame Files

Download these files from the repository:
- `src/oc_clasificame.js` - Main JavaScript file
- `src/oc_clasificame.css` - Stylesheet

## 🏗️ Step 3: Create Your First Classification

Create an HTML file with this complete example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Classification</title>
    
    <!-- Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- ocClasificame Files -->
    <link rel="stylesheet" href="path/to/oc_clasificame.css">
    <script src="path/to/oc_clasificame.js"></script>
    
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .demo-container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        .demo-btn {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        .demo-btn:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="demo-container">
        <h1>Task Manager</h1>
        <p>Click the button below to classify your tasks!</p>
        <button class="demo-btn" onclick="openTaskClassifier()">
            📋 Organize Tasks
        </button>
    </div>

    <script>
        // Define your categories (columns)
        const taskCategories = [
            { id: 'todo', label: 'Todo', title: 'To Do' },
            { id: 'doing', label: 'Doing', title: 'In Progress' },
            { id: 'done', label: 'Done', title: 'Completed' }
        ];

        // Define your items to classify
        const tasks = [
            { id: 1, name: 'Design homepage mockup', category: 'todo' },
            { id: 2, name: 'Write API documentation', category: 'doing' },
            { id: 3, name: 'Set up database', category: 'done' },
            { id: 4, name: 'Create user authentication', category: 'todo' },
            { id: 5, name: 'Implement search feature', category: 'todo' },
            { id: 6, name: 'Fix navigation bug', category: 'doing' }
        ];

        async function openTaskClassifier() {
            // Create the classifier instance
            const classifier = new ocClasificame(taskCategories, tasks, {
                title: 'Task Classification',
                editable: true,
                showToolbar: true,
                que_clasifica_label: 'Tasks'
            });

            try {
                // Open the classification dialog
                const result = await classifier.openDialog();
                
                // Handle successful save
                console.log('Tasks classified successfully!', result);
                alert('Tasks saved! Check the console for results.');
                
            } catch (error) {
                // Handle cancellation
                console.log('Classification cancelled');
                alert('Task classification was cancelled.');
            }
        }
    </script>
</body>
</html>
```

## 🎮 Step 4: Test Your Classification

1. Open your HTML file in a web browser
2. Click the "Organize Tasks" button
3. Try these interactions:
   - **Drag and drop** tasks between columns
   - **Click category buttons** on individual tasks
   - **Search** for specific tasks
   - **Move visible items** using arrow buttons
   - **Save** or **Cancel** your changes

## 🔧 Understanding the Code

### Categories Structure
```javascript
const categories = [
    { 
        id: 'unique_id',      // Unique identifier
        label: 'Short',       // Button labels
        title: 'Full Title'   // Column headers
    }
];
```

### Items Structure
```javascript
const items = [
    {
        id: 'unique_id',        // Unique identifier
        name: 'Display Name',   // What users see
        category: 'category_id' // Current category
    }
];
```

### Basic Options
```javascript
const options = {
    title: 'Dialog Title',           // Window title
    editable: true,                  // Allow changes
    showToolbar: true,               // Show action buttons
    que_clasifica_label: 'Items'     // Label for items
};
```

## ✅ Success! What's Next?

You now have a working classification interface! Here's what to explore next:

### 🎯 Immediate Next Steps
1. **[Examples & Tutorials](Examples.md)** - More practical examples
2. **[Configuration Guide](Configuration.md)** - Explore all options
3. **[Template Management](Template-Management.md)** - Save classification setups

### 🚀 Advanced Features
1. **[Group Management](Group-Management.md)** - Bulk operations
2. **[Read-Only Mode](Read-Only-Mode.md)** - Display-only views
3. **[Customization](Customization.md)** - Styling and themes

### 🛠️ Integration
1. **[Framework Integration](Framework-Integration.md)** - React, Vue, Angular
2. **[Backend Integration](Backend-Integration.md)** - Server-side setup
3. **[Database Schema](Database-Schema.md)** - Data persistence

## 🆘 Troubleshooting

### Common Issues

**Script errors or widget not loading?**
- Check browser console for errors
- Verify SortableJS is loaded before ocClasificame
- Ensure file paths are correct

**Drag and drop not working?**
- Make sure SortableJS is properly loaded
- Check that `editable: true` is set
- Verify no CSS conflicts

**Items not displaying correctly?**
- Confirm item structure matches expected format
- Check that category IDs in items match category definitions
- Verify `valueId` and `valueDisplay` options are correct

Need more help? Check our [Troubleshooting Guide](Troubleshooting.md).

## 📚 Additional Resources

- **[Live Demo](../examples/clean_demo_html.html)** - Interactive examples
- **[API Reference](../docs/oc_clasificame_docs.md)** - Complete documentation
- **[Source Code](../src/)** - Implementation files

---

**Ready for more?** Continue with [Examples & Tutorials](Examples.md) to see more use cases and advanced features!