
document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select("svg");
    const mapLayers = svg.select("g"); // Select the main group that contains all map elements

    const zoom = d3.zoom()
        .scaleExtent([0.5, 8]) // Set zoom limits (e.g., 0.5x to 8x)
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
        svg.transition().duration(750).call(zoom.scaleBy, 1.2); // Zoom in by 20%
    });

    zoomOutButton.on("click", () => {
        svg.transition().duration(750).call(zoom.scaleBy, 0.8); // Zoom out by 20%
    });

    zoomResetButton.on("click", () => {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity); // Reset zoom
    });
});
