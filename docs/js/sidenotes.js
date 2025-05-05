// Smooth scrolling for sidenote links
document.addEventListener('DOMContentLoaded', function() {
  // Get all sidenote links (both in main text and in sidenotes)
  const sidenoteLinks = document.querySelectorAll('.sidenote-number-link, .sidenote-link');
  
  // Add click event listener to each link
  sidenoteLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the target element ID
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Calculate position to scroll to (centered in viewport)
        const elementRect = targetElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2);
        
        // Scroll smoothly to the element
        window.scrollTo({
          top: middle,
          behavior: 'smooth'
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, `#${targetId}`);
        
        // Add a temporary highlight effect
        targetElement.classList.add('sidenote-highlight');
        setTimeout(() => {
          targetElement.classList.remove('sidenote-highlight');
        }, 2000);
      }
    });
  });
}); 