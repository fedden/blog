// Smooth scrolling for sidenote links & Responsive Article Width

console.log('sidenotes.js: Script loaded'); // Log script load

// Use MkDocs Material's custom event for better timing
document$.subscribe(function() {
  console.log('sidenotes.js: document$.subscribe callback started'); // Log callback start

  // --- Smooth Scrolling Logic --- 
  const sidenoteLinks = document.querySelectorAll('.sidenote-number-link, .sidenote-link');
  sidenoteLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const elementRect = targetElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2);
        window.scrollTo({
          top: middle,
          behavior: 'smooth'
        });
        // history.pushState(null, null, `#${targetId}`); // Avoid disrupting back button
        targetElement.classList.add('sidenote-highlight');
        setTimeout(() => {
          targetElement.classList.remove('sidenote-highlight');
        }, 2000);
      }
    });
  });

  // --- Responsive Article Width Adjustment --- 
  // Use more specific selector for the article content area
  const articleElement = document.querySelector('article.md-content__inner.md-typeset');
  console.log('sidenotes.js: articleElement selected:', articleElement); // Log article element selection

  // Correct selector for the TOC sidebar container
  const rightSidebar = document.querySelector('.md-sidebar--post'); 
  console.log('sidenotes.js: rightSidebar selected:', rightSidebar); // Log sidebar element selection

  function adjustArticleWidth() {
    console.log('sidenotes.js: adjustArticleWidth function called'); // Log function call

    console.log('sidenotes.js: Checking for elements...'); // Log check start

    if (!articleElement) {
        console.warn('Sidenotes.js: Could not find article element (article.md-content__inner.md-typeset). Exiting adjustArticleWidth.');
        return; // Exit if article element isn't found
    }
    console.log('sidenotes.js: articleElement and rightSidebar checks passed');
    if (!rightSidebar) {
        // It's normal for the right sidebar not to exist on pages without a TOC
        // or on mobile, so just ensure the max-width is cleared.
        articleElement.style.maxWidth = '';
        // console.log('Sidenotes.js: Right sidebar not found or not rendered, clearing max-width.');
        return; 
    }

    const isWideScreen = window.getComputedStyle(rightSidebar).display !== 'none';
    const sidebarWidth = rightSidebar.offsetWidth;
    const gap = 24; // Desired gap in pixels

    console.log(`Sidebar visible: ${isWideScreen}, Sidebar width: ${sidebarWidth}px`);

    if (isWideScreen && sidebarWidth > 0) {
        const contentGrid = document.querySelector('.md-main__inner.md-grid');
        const availableWidth = contentGrid ? contentGrid.offsetWidth : window.innerWidth;
        // Add check for grid padding/margins if necessary
        const gridPadding = contentGrid ? (parseFloat(window.getComputedStyle(contentGrid).paddingLeft) + parseFloat(window.getComputedStyle(contentGrid).paddingRight)) : 0;

        // Calculate max-width for the article relative to the grid container
        const articleMaxWidth = availableWidth - sidebarWidth - gap - gridPadding;
        
        console.log(`Grid width: ${availableWidth}px, Grid padding: ${gridPadding}px, Calculated article max-width: ${articleMaxWidth}px`);

        articleElement.style.maxWidth = `${articleMaxWidth}px`;
        articleElement.style.overflow = 'hidden';
        articleElement.style.float = 'left';
        console.log('Applied max-width, overflow:hidden, and float:left to article');
    } else {
        articleElement.style.maxWidth = '';
        articleElement.style.overflow = '';
        articleElement.style.float = '';
        console.log('Sidebar not visible or has zero width, removing inline article styles.');
    }
  }

  // Initial adjustment 
  adjustArticleWidth();

  // Adjust on window resize 
  // Debounce resize handler for performance
  let resizeTimeout;
  window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(adjustArticleWidth, 100); // Adjust delay as needed
  });

  // After setting up resize handler, move side-notes into separate column
  if (window.innerWidth >= 1050) {
    const postContainer = document.querySelector('.md-content--post');
    if (postContainer) {
      // Create container if not exists
      let notesContainer = postContainer.querySelector('.sidenotes-container');
      if (!notesContainer) {
        notesContainer = document.createElement('div');
        notesContainer.className = 'sidenotes-container';
        postContainer.appendChild(notesContainer);
      }
      
      // Move each sidenote wrapper into the notes container
      const wrappers = Array.from(postContainer.querySelectorAll('.sidenote-wrapper'));
      wrappers.forEach(wrapper => {
        // Clone the full wrapper (with input and content)
        const clone = wrapper.cloneNode(true);
        notesContainer.appendChild(clone);

        // Remove the numbering label and checkbox from the clone
        const numLinkClone = clone.querySelector('.sidenote-number-link');
        if (numLinkClone) numLinkClone.remove();
        const toggleInputClone = clone.querySelector('input.sidenote-toggle');
        if (toggleInputClone) toggleInputClone.remove();

        // Inject the correct number prefix based on span id
        const noteSpanClone = clone.querySelector('.sidenote');
        if (noteSpanClone && noteSpanClone.id) {
          const parts = noteSpanClone.id.split('-');
          const num = parts[parts.length - 1];
          // Prepend a styled number span
          const numSpan = document.createElement('span');
          numSpan.className = 'sidenote-number-clone';
          numSpan.textContent = '[' + num + '] ';
          // Apply inline styles to override any CSS conflicts
          numSpan.style.color = '#8B0000';
          numSpan.style.fontSize = '0.7rem';
          numSpan.style.fontWeight = '600';
          numSpan.style.marginRight = '0.2rem';
          noteSpanClone.insertBefore(numSpan, noteSpanClone.firstChild);
        }

        // In the original, keep only the marker link
        const marker = wrapper.querySelector('.sidenote-number-link');
        wrapper.innerHTML = '';
        if (marker) wrapper.appendChild(marker);
      });

      // --- Position Side-Notes Vertically ---
      function positionSidenotes() {
        const articleElem = document.querySelector('article.md-content__inner.md-typeset');
        if (articleElem) {
          notesContainer.style.height = articleElem.getBoundingClientRect().height + 'px';
        }
        const origWrappers = Array.from(postContainer.querySelectorAll('.sidenote-wrapper'));
        const cloneWrappers = Array.from(notesContainer.querySelectorAll('.sidenote-wrapper'));
        let prevBottom = -Infinity;
        const minGap = 8; // minimum gap in px to avoid overlap
        const containerRect = notesContainer.getBoundingClientRect();
        origWrappers.forEach((orig, idx) => {
          const clone = cloneWrappers[idx];
          if (!clone) return;
          const origRect = orig.getBoundingClientRect();
          let top = origRect.top - containerRect.top;
          if (top < 0) top = 0;
          if (top < prevBottom + minGap) {
            top = prevBottom + minGap;
          }
          clone.style.position = 'absolute';
          clone.style.top = top + 'px';
          clone.style.left = '0';
          prevBottom = top + clone.getBoundingClientRect().height;
        });
      }
      // Initial positioning
      positionSidenotes();
      // Reposition on window resize
      window.addEventListener('resize', positionSidenotes);
    }
  }
});

/* 
Previous DOMContentLoaded wrapper removed in favor of document$.subscribe 
*/ 