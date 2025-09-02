# Installation Guide

Complete guide for installing and integrating ocClasificame into your projects.

## 📋 Requirements

### System Requirements
- Modern web browser with ES6+ support
- HTML5 `<dialog>` element support (or polyfill)
- JavaScript enabled

### Dependencies
- **SortableJS** (Required) - For drag-and-drop functionality
- **Font Awesome** (Optional) - For UI icons

## 🚀 Installation Methods

### Method 1: Direct Download

1. **Download the widget files:**
   - Navigate to the [Classifier repository](https://github.com/ocallit/Classifier)
   - Download `src/oc_clasificame.js` and `src/oc_clasificame.css`

2. **Include dependencies:**
   ```html
   <!-- SortableJS (Required) -->
   <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
   
   <!-- Font Awesome (Optional, for icons) -->
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   ```

3. **Include ocClasificame files:**
   ```html
   <link rel="stylesheet" href="path/to/oc_clasificame.css">
   <script src="path/to/oc_clasificame.js"></script>
   ```

### Method 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/ocallit/Classifier.git

# Copy files to your project
cp Classifier/src/oc_clasificame.* your-project/assets/
```

### Method 3: NPM Package (Future)

Currently not available, but planned for future releases:

```bash
# Future release
npm install oc-clasificame
```

## 🔧 Integration Examples

### Basic HTML Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classification Demo</title>
    
    <!-- Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- ocClasificame -->
    <link rel="stylesheet" href="assets/oc_clasificame.css">
    <script src="assets/oc_clasificame.js"></script>
</head>
<body>
    <!-- Your content here -->
    <script>
        // Initialize and use the widget
        const classifier = new ocClasificame(categories, items, options);
    </script>
</body>
</html>
```

### React Integration

```jsx
// Install dependencies first
// npm install sortablejs

import React, { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

// Include CSS in your build process or import directly
import './oc_clasificame.css';

// Include JS file as a static asset or integrate into build
// Then use the global ocClasificame class

function ClassificationComponent({ categories, items, onSave }) {
    const classifierRef = useRef(null);

    useEffect(() => {
        // Ensure SortableJS is available globally
        window.Sortable = Sortable;
    }, []);

    const handleClassify = async () => {
        if (!classifierRef.current) {
            classifierRef.current = new window.ocClasificame(categories, items, {
                title: 'React Classification',
                editable: true
            });
        }

        try {
            const result = await classifierRef.current.openDialog();
            onSave(result);
        } catch (error) {
            console.log('Classification cancelled');
        }
    };

    return (
        <button onClick={handleClassify}>
            Open Classification
        </button>
    );
}

export default ClassificationComponent;
```

### Vue.js Integration

```vue
<template>
  <div>
    <button @click="openClassification" :disabled="!isReady">
      Classify Items
    </button>
  </div>
</template>

<script>
import Sortable from 'sortablejs';

export default {
  name: 'ClassificationComponent',
  props: {
    categories: Array,
    items: Array
  },
  data() {
    return {
      classifier: null,
      isReady: false
    };
  },
  mounted() {
    // Make SortableJS available globally
    window.Sortable = Sortable;
    
    // Check if ocClasificame is loaded
    if (window.ocClasificame) {
      this.isReady = true;
    } else {
      console.error('ocClasificame not loaded');
    }
  },
  methods: {
    async openClassification() {
      if (!this.classifier) {
        this.classifier = new window.ocClasificame(this.categories, this.items, {
          title: 'Vue Classification',
          editable: true
        });
      }

      try {
        const result = await this.classifier.openDialog();
        this.$emit('classification-saved', result);
      } catch (error) {
        this.$emit('classification-cancelled');
      }
    }
  }
};
</script>

<style>
@import 'path/to/oc_clasificame.css';
</style>
```

### Angular Integration

```typescript
// classification.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

declare global {
  interface Window {
    ocClasificame: any;
    Sortable: any;
  }
}

@Component({
  selector: 'app-classification',
  template: `
    <button (click)="openClassification()" [disabled]="!isReady">
      Open Classification
    </button>
  `,
  styleUrls: ['./classification.component.css']
})
export class ClassificationComponent implements OnInit {
  @Input() categories: any[] = [];
  @Input() items: any[] = [];
  @Output() classificationSaved = new EventEmitter<any>();
  @Output() classificationCancelled = new EventEmitter<void>();

  private classifier: any;
  isReady = false;

  ngOnInit() {
    // Check if dependencies are loaded
    if (window.ocClasificame && window.Sortable) {
      this.isReady = true;
    } else {
      console.error('ocClasificame or SortableJS not loaded');
    }
  }

  async openClassification() {
    if (!this.classifier) {
      this.classifier = new window.ocClasificame(this.categories, this.items, {
        title: 'Angular Classification',
        editable: true
      });
    }

    try {
      const result = await this.classifier.openDialog();
      this.classificationSaved.emit(result);
    } catch (error) {
      this.classificationCancelled.emit();
    }
  }
}
```

```css
/* classification.component.css */
@import 'path/to/oc_clasificame.css';
```

## 🌐 CDN Integration

For quick prototyping or simple projects, you can use CDN links:

```html
<!-- SortableJS from CDN -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>

<!-- Font Awesome from CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- ocClasificame (replace with actual CDN when available) -->
<link rel="stylesheet" href="https://your-cdn.com/oc_clasificame.css">
<script src="https://your-cdn.com/oc_clasificame.js"></script>
```

## 📱 Mobile Considerations

### Viewport Configuration

Ensure proper mobile rendering:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Touch Optimization

The widget automatically adapts for touch devices, but you can optimize further:

```javascript
const mobileClassifier = new ocClasificame(categories, items, {
    title: 'Mobile Classification',
    editable: true,
    showToolbar: true  // Buttons are easier than drag on mobile
});
```

## 🔧 Build System Integration

### Webpack Integration

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
```

```javascript
// In your main JS file
import './assets/oc_clasificame.css';
import './assets/oc_clasificame.js';
import Sortable from 'sortablejs';

// Make Sortable available globally
window.Sortable = Sortable;
```

### Rollup Integration

```javascript
// rollup.config.js
import css from 'rollup-plugin-css-only';

export default {
  // ... other config
  plugins: [
    css({ output: 'bundle.css' }),
    // ... other plugins
  ]
};
```

### Parcel Integration

```javascript
// In your main JS file
import './oc_clasificame.css';
import './oc_clasificame.js';
import 'sortablejs';
```

## ⚡ Performance Optimization

### Lazy Loading

Load the widget only when needed:

```javascript
async function loadClassifier() {
  if (!window.ocClasificame) {
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'),
      loadScript('assets/oc_clasificame.js'),
      loadCSS('assets/oc_clasificame.css')
    ]);
  }
  
  return new window.ocClasificame(categories, items, options);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadCSS(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}
```

### Bundle Size Optimization

- Use tree shaking in your build process
- Consider loading SortableJS only when classification is needed
- Minimize CSS by removing unused styles for your specific use case

## 🐛 Troubleshooting

### Common Issues

**"ocClasificame is not defined" error:**
- Ensure the script is loaded before use
- Check browser console for loading errors
- Verify file paths are correct

**Drag and drop not working:**
- Confirm SortableJS is loaded
- Check for CSS conflicts
- Ensure `editable: true` is set

**Styles not applied:**
- Verify CSS file is loaded
- Check for CSS conflicts with existing styles
- Ensure proper CSS precedence

**Mobile touch issues:**
- Add viewport meta tag
- Consider using `showToolbar: true` for mobile
- Test on actual devices, not just browser dev tools

## 🔄 Version Management

### Checking Version

```javascript
// Check if specific features are available
const hasGroupSupport = typeof classifier._setupGroupModeListeners === 'function';
const hasTemplateSupport = typeof classifier.applyClassification === 'function';
```

### Upgrading

When upgrading to newer versions:

1. Backup your current implementation
2. Check the changelog for breaking changes
3. Update both CSS and JS files together
4. Test thoroughly in your environment
5. Update any custom styling if needed

## 📚 Next Steps

After installation:

1. **[Quick Start Guide](Quick-Start.md)** - Get up and running
2. **[Configuration Guide](Configuration.md)** - Explore all options
3. **[Examples & Tutorials](Examples.md)** - See practical implementations
4. **[Framework Integration](Framework-Integration.md)** - Deep dive into framework integration

---

**Having installation issues?** Check our [Troubleshooting Guide](Troubleshooting.md) or [open an issue](https://github.com/ocallit/Classifier/issues) on GitHub.