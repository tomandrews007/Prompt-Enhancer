// Previous JavaScript remains the same, just update the copy button functionality:

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(enhancedOutputDiv.textContent);
        const icon = copyButton.querySelector('i');
        const span = copyButton.querySelector('span');
        icon.className = 'fas fa-check';
        span.textContent = 'Copied!';
        
        setTimeout(() => {
          icon.className = 'far fa-copy';
          span.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    });

    // Rest of the JavaScript remains the same
