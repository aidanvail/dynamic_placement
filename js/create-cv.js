document.addEventListener('DOMContentLoaded', function() {
    // Step navigation
    const steps = document.querySelectorAll('.step');
    const templateButtons = document.querySelectorAll('.template-select');

    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from first step
            steps[0].classList.remove('active');
            // Add active class to second step
            steps[1].classList.add('active');
            
            // Scroll to CV builder section
            document.querySelector('.cv-builder-container').scrollIntoView({
                behavior: 'smooth'
            });

            // Here you would typically initialize your third-party CV builder
            initializeCVBuilder(this.closest('.template-card').querySelector('h3').textContent);
        });
    });

    // Function to initialize third-party CV builder
    function initializeCVBuilder(templateName) {
        const builderWrapper = document.getElementById('cv-builder-wrapper');
        
        // This is a placeholder - replace with actual third-party integration
        builderWrapper.innerHTML = `
            <div class="integration-message">
                <h3>Template Selected: ${templateName}</h3>
                <p>Third-party CV builder would be initialized here</p>
                <div class="loader"></div>
            </div>
        `;

        // Here you would typically initialize your chosen third-party CV builder
        // Example:
        // thirdPartyCVBuilder.init({
        //     container: 'cv-builder-wrapper',
        //     template: templateName,
        //     // other configuration options
        // });
    }

    // Progress tracking
    function updateProgress(step) {
        steps.forEach((s, index) => {
            if (index < step) {
                s.classList.add('completed');
            } else if (index === step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active', 'completed');
            }
        });
    }

    // Add smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 