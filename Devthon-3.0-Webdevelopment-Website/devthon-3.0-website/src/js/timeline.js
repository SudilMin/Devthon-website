const timelineData = [
    {
        id: 1,
        date: "August 2025",
        event: "Registration Opens",
        description: "Registration opens for all aspiring teams to participate in Dev{thon} 3.0."
    },
    {
        id: 2,
        date: "September 2025",
        event: "Closing Registration",
        description: "Final deadline for team registration - don't miss your chance to participate!"
    },
    {
        id: 3,
        date: "September 2025",
        event: "Commencement Of Competition",
        description: "The official start of Dev{thon} 3.0 competition with opening ceremony and guidelines."
    },
    {
        id: 4,
        date: "October 2025",
        event: "Conclusion Of Proposal Submission",
        description: "Final deadline for teams to submit their detailed project proposals."
    },
    {
        id: 5,
        date: "November 2025",
        event: "Conclusion Of UI/UX Design Submission",
        description: "Submit your innovative design prototypes, wireframes, and user experience mockups."
    },
    {
        id: 6,
        date: "November 2025",
        event: "Conclusion Of Video Submission",
        description: "Final project demonstration videos showcasing your web development solutions."
    },
    {
        id: 7,
        date: "December 2025",
        event: "Grand Finale",
        description: "Award ceremony, winner announcements, and celebration of outstanding achievements."
    }
];

document.addEventListener('DOMContentLoaded', function() {
    renderTimeline();
});

function renderTimeline() {
    const timelineContainer = document.getElementById('timeline-container');
    
    if (!timelineContainer) {
        console.warn('Timeline container not found');
        return;
    }

    const timelineHTML = timelineData.map((item, index) => {
        const animationDelay = index * 0.2;
        return `
            <div class="timeline-item" style="animation-delay: ${animationDelay}s;">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-event">${item.event}</div>
                <div class="timeline-description">${item.description}</div>
            </div>
        `;
    }).join('');

    timelineContainer.innerHTML = timelineHTML;

    // Force proper timeline height calculation
    setTimeout(() => {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const timelineElement = document.querySelector('.timeline');
        
        if (timelineItems.length > 0 && timelineElement) {
            // Calculate total height needed
            let maxHeight = 0;
            timelineItems.forEach(item => {
                const itemBottom = item.offsetTop + item.offsetHeight;
                if (itemBottom > maxHeight) {
                    maxHeight = itemBottom;
                }
            });
            
            // Add extra padding and set explicit height
            const totalHeight = maxHeight + 200;
            timelineElement.style.height = `${totalHeight}px`;
            timelineElement.style.minHeight = `${totalHeight}px`;
            timelineContainer.style.height = `${totalHeight}px`;
            
            console.log('Timeline height set to:', totalHeight);
        }
    }, 300);

    // Add entrance animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    timelineItems.forEach((item, index) => {
        // Set initial state
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        item.style.transition = 'all 0.8s ease';
        
        // Observe for intersection
        observer.observe(item);
    });
}