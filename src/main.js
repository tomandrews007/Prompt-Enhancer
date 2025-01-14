const seedPromptInput = document.getElementById('seedPrompt');
    const briefButton = document.getElementById('briefButton');
    const maxButton = document.getElementById('maxButton');
    const enhancedOutputDiv = document.getElementById('enhancedOutput');

    briefButton.addEventListener('click', () => enhancePrompt('brief'));
    maxButton.addEventListener('click', () => enhancePrompt('max'));

    async function enhancePrompt(option) {
      const seedPrompt = seedPromptInput.value;
      if (!seedPrompt) {
        enhancedOutputDiv.textContent = 'Please enter a seed prompt.';
        return;
      }

      try {
        const response = await fetch('/enhance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ seedPrompt, option }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        enhancedOutputDiv.textContent = data.enhancedPrompt;
      } catch (error) {
        console.error('Error enhancing prompt:', error);
        enhancedOutputDiv.textContent = 'Failed to enhance prompt.';
      }
    }
