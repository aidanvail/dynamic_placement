document.addEventListener('DOMContentLoaded', function() {
    // Job search functionality
    const jobSearch = document.getElementById('jobSearch');
    const locationSearch = document.getElementById('locationSearch');
    const jobsContainer = document.getElementById('jobsContainer');

    // Filter functionality
    const filterCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    
    // Search and filter jobs
    function filterJobs() {
        const searchTerm = jobSearch.value.toLowerCase();
        const locationTerm = locationSearch.value.toLowerCase();
        const selectedTypes = Array.from(document.querySelectorAll('input[name="jobType"]:checked'))
            .map(cb => cb.value);
        const selectedLevels = Array.from(document.querySelectorAll('input[name="experienceLevel"]:checked'))
            .map(cb => cb.value);

        // Here you would typically fetch filtered jobs from your CMS
        // For now, we'll just show a loading state
        jobsContainer.innerHTML = '<div class="loader"></div>';
        
        // Simulate API call delay
        setTimeout(() => {
            updateJobsList(searchTerm, locationTerm, selectedTypes, selectedLevels);
        }, 500);
    }

    // Event listeners for search inputs
    jobSearch.addEventListener('input', debounce(filterJobs, 500));
    locationSearch.addEventListener('input', debounce(filterJobs, 500));

    // Event listeners for filters
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterJobs);
    });

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to update jobs list
    function updateJobsList(searchTerm, locationTerm, types, levels) {
        // This would typically fetch from your CMS
        // For now, we'll just show a message
        jobsContainer.innerHTML = `
            <div class="no-results">
                <h3>Jobs are managed via Netlify CMS</h3>
                <p>Integration required with your CMS system</p>
            </div>
        `;
    }

    // Initialize jobs list
    filterJobs();
}); 