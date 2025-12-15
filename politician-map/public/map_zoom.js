
document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select("svg");
    const mapLayers = svg.select("g"); // Select the main group that contains all map elements

    const zoom = d3.zoom()
        .scaleExtent([0.5, 20]) // Set zoom limits (e.g., 0.5x to 8x)
        .translateExtent([[0, 0], [864, 691.2]])
        .on("zoom", zoomed);

    function zoomed() {
        // Apply the transform to all selected map layers (D3 v5 style)
        mapLayers.attr("transform", d3.event.transform);
    }

    svg.call(zoom);

    // Get references to the zoom buttons
    const zoomInButton = d3.select(".zoom-in");
    const zoomOutButton = d3.select(".zoom-out");
    const zoomResetButton = d3.select(".zoom-reset");

    // Add event listeners to the buttons
    zoomInButton.on("click", () => {
        svg.transition().duration(750).call(zoom.scaleBy, 2); // Zoom in by 100%
    });

    zoomOutButton.on("click", () => {
        svg.transition().duration(750).call(zoom.scaleBy, 0.5); // Zoom out by 50%
    });

    zoomResetButton.on("click", () => {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity); // Reset zoom
    });

    // Add click event to all path elements (regions)
    svg.selectAll("path").on("click", function() {
        // Remove yellow border from all regions
        svg.selectAll("path")
            .style("stroke", "white")
            .style("stroke-width", "0.5");

        // Add yellow border to clicked region
        d3.select(this)
            .style("stroke", "yellow")
            .style("stroke-width", "2");

        // Trigger custom modal event
        const regionName = this.getAttribute('name');
        console.log('🗺️ [map_zoom.js] Region clicked:', regionName);
        if (regionName && window.openPoliticianModal) {
            window.openPoliticianModal(regionName);
        }
    });
});
