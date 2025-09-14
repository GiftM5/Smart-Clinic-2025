document.addEventListener("DOMContentLoaded", function() {
    const dynamicText = document.querySelector(".dynamic-text");
    const words = ["Simple.", "Accessible.", "Intelligent."];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];
        
        const partOfWord = isDeleting 
            ? currentWord.substring(0, charIndex - 1)
            : currentWord.substring(0, charIndex + 1);

        dynamicText.textContent = partOfWord;

        if (!isDeleting && charIndex < currentWord.length) {
            charIndex++;
            setTimeout(type, 150); // Speed of typing
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(type, 100); // Speed of deleting
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                wordIndex = (wordIndex + 1) % words.length;
            }
            setTimeout(type, 1200);
        }
    }


    type();
});