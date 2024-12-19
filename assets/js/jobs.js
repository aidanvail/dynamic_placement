document.addEventListener('DOMContentLoaded', function() {
    // Loading state management
    const airtableWrapper = document.querySelector('.airtable-wrapper');
    const airtableFrame = document.querySelector('.airtable-embed');
    
    // Create and add loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loader"></div>';
    airtableWrapper.appendChild(loadingOverlay);

    // Remove loading overlay when frame loads
    airtableFrame.addEventListener('load', function() {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 300);
    });

    // Intersection Observer for animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observe the Airtable wrapper
    airtableWrapper.style.opacity = '0';
    airtableWrapper.style.transform = 'translateY(20px)';
    airtableWrapper.style.transition = 'all 0.6s ease';
    observer.observe(airtableWrapper);

    // Handle iframe resize
    function resizeIframe() {
        const width = window.innerWidth;
        if (width <= 768) {
            airtableFrame.style.height = '600px';
        } else if (width <= 992) {
            airtableFrame.style.height = '700px';
        } else {
            airtableFrame.style.height = '800px';
        }
    }

    // Initial resize and event listener
    resizeIframe();
    window.addEventListener('resize', resizeIframe);
}); 