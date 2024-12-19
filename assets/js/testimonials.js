document.addEventListener('DOMContentLoaded', function() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            position: "HR Director",
            company: "Tech Solutions Ltd",
            text: "Placement Dynamics has transformed our hiring process. Their understanding of our industry and commitment to finding the right talent is exceptional."
        },
        {
            name: "Michael Chen",
            position: "CEO",
            company: "Innovation Hub",
            text: "We've been working with Placement Dynamics for over 2 years now. Their professional approach and quality of candidates have been consistently outstanding."
        },
        {
            name: "Emma Williams",
            position: "Operations Manager",
            company: "Global Systems Inc",
            text: "The team at Placement Dynamics truly understands our needs. They've helped us build an amazing team with their personalized recruitment approach."
        }
    ];

    const testimonialSlider = document.getElementById('testimonialSlider');
    let currentIndex = 0;

    function createTestimonialElement(testimonial) {
        return `
            <div class="testimonial-card fade-in">
                <div class="testimonial-content">
                    <p class="testimonial-text">"${testimonial.text}"</p>
                    <div class="testimonial-author">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.position}</p>
                        <p class="company">${testimonial.company}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function showNextTestimonial() {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateTestimonial();
    }

    function updateTestimonial() {
        testimonialSlider.innerHTML = createTestimonialElement(testimonials[currentIndex]);
    }

    // Initialize first testimonial
    updateTestimonial();

    // Auto-rotate testimonials
    setInterval(showNextTestimonial, 5000);

    // Add navigation dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'testimonial-dots';
    
    testimonials.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === currentIndex ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateTestimonial();
            updateDots();
        });
        dotsContainer.appendChild(dot);
    });

    testimonialSlider.parentNode.appendChild(dotsContainer);

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
}); 