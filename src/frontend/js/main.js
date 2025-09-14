document.addEventListener('DOMContentLoaded', () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navIcon = mobileNavToggle.querySelector('i');

    mobileNavToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        
        
        navIcon.classList.toggle('fa-bars', !isActive);
        navIcon.classList.toggle('fa-times', isActive);
    });
});