---
title: Quick Start
description: Get started with zfitsio quickly
---

## Reading a FITS File

```zig
const std = @import("std");
const fits = @import("zfitsio");

pub fn main() !void {
    // Initialize allocator
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Open a FITS file
    var fits_file = try fits.FitsFile.open(allocator, "image.fits", .READ_ONLY);
    defer fits_file.close() catch unreachable;

    // Get basic information
    const dims = try fits_file.getImageDimensions();
    std.debug.print("Image dimensions: {}x{}\n", .{ dims[0], dims[1] });

    // Work with headers
    var header = fits.FITSHeader.init(fits_file);
    if (try header.hasKeyword("EXPOSURE")) {
        const exposure = try header.getKeyword("EXPOSURE");
        std.debug.print("Exposure time: {s}\n", .{exposure});
    }

    // Load image data
    var image = try fits.ImageOperations.fromFitsFile(allocator, fits_file);
    defer image.deinit();
}
```
## Creating a new FITS File
```zig
const std = @import("std");
const fits = @import("zfitsio");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Create a new FITS file
    var fits_file = try fits.FitsFile.createFits(allocator, "new_image.fits");
    defer fits_file.close() catch unreachable;

    // Add required headers
    var header = fits.FITSHeader.init(fits_file);
    try header.writeKeyword("SIMPLE", true, "Standard FITS format");
    try header.writeKeyword("BITPIX", -32, "32-bit floating point");
    try header.writeKeyword("NAXIS", 2, "Number of dimensions");
    try header.writeKeyword("NAXIS1", 100, "Width");
    try header.writeKeyword("NAXIS2", 100, "Height");
    try header.writeKeyword("EXTEND", true, "Extensions are permitted");

    // Add custom headers
    try header.writeKeyword("OBSERVER", "John Doe", "Observer name");
    try header.writeKeyword("TELESCOPE", "Sample Telescope", null);
}
```

## Working with image data
```zig
const std = @import("std");
const fits = @import("zfitsio");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Open existing file
    var fits_file = try fits.FitsFile.open(allocator, "image.fits", .READ_ONLY);
    defer fits_file.close() catch unreachable;

    // Load image
    var image = try fits.ImageOperations.fromFitsFile(allocator, fits_file);
    defer image.deinit();

    // Extract a section
    var section = try image.getSection(.{
        .x_start = 0,
        .x_end = 100,
        .y_start = 0,
        .y_end = 100,
    });
    defer section.deinit();

    // Get WCS information
    try section.setPhysicalAxis(1, 45.0, 0.01, 1.0);  // RA axis
    try section.setPhysicalAxis(2, -30.0, 0.01, 1.0); // DEC axis
}
```