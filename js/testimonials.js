const testimonials = [
    {
        name: "John Smith",
        position: "HR Director",
        company: "Tech Solutions Inc.",
        text: "Placement Dynamics has consistently delivered top talent for our organization. Their understanding of our needs is exceptional."
    },
    {
        name: "Sarah Johnson",
        position: "CEO",
        company: "Innovation Labs",
        text: "The quality of candidates and service provided by Placement Dynamics is outstanding. They've become our go-to recruitment partner."
    },
    {
        name: "Michael Brown",
        position: "Operations Manager",
        company: "Global Systems",
        text: "Working with Placement Dynamics has streamlined our hiring process significantly. Highly recommended!"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const testimonialSlider = document.querySelector('.testimonial-slider');
    let currentTestimonial = 0;

    function createTestimonialElement(testimonial) {
        return `
            <div class="testimonial">
                <p class="testimonial-text">"${testimonial.text}"</p>
                <div class="testimonial-author">
                    <p class="author-name">${testimonial.name}</p>
                    <p class="author-position">${testimonial.position}</p>
                    <p class="author-company">${testimonial.company}</p>
                </div>
            </div>
        `;
    }

    function showTestimonial() {
        testimonialSlider.innerHTML = createTestimonialElement(testimonials[currentTestimonial]);
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }

    showTestimonial();
    setInterval(showTestimonial, 5000);
}); 