---
title: fitsfile
description: API documentation for fitsfile
sidebar:
    order: 1
---

# fitsfile
════════

## Contents
━━━━━━━━━

- [Overview](#overview)
- [Types](#types)
- [Methods](#methods)

──────────────────────────────────────────────────



## Overview
━━━━━━━━━

## Mode

━━━━━━━

Defines access modes for FITS files
Controls read/write permissions for both header and data

### Definition

```zig
pub const Mode = struct {
    READ_ONLY: bool = true,
    ALLOW_HEADER_MODS: bool = false,
    ALLOW_DATA_MODS: bool = false,
};
```

## FitsFile

━━━━━━━━━━━

Core struct for FITS file operations
Provides functions for file I/O, metadata retrieval, and validation

### Definition

```zig
pub const FitsFile = struct {
    fptr: *c.fitsfile,
    allocator: std.mem.Allocator,

        return true;
    }
    }

        const fits = try allocator.create(FitsFile);
        fits.* = .{
            .fptr = fptr.?,
            .allocator = allocator,
        };

        return fits;
    }

        return @intCast(hdu_count);
    }

        return .{
            @intCast(dims[0]),
            @intCast(dims[1]),
        };
    }
};
```

## Methods
━━━━━━━━

### validateRequiredHeaders

Pointer to the underlying CFITSIO file structure
Memory allocator used for dynamic allocations
Validates that all required FITS headers are present
Returns true if all required headers exist, false otherwise

#### Signature

```zig
    pub fn validateRequiredHeaders(self: *FitsFile) !bool {
        var header = fitsheader.init(self);
        const required = [_][]const u8{ "SIMPLE", "BITPIX", "NAXIS" };
        for (required) |key| {
            if (!try header.hasKeyword(key)) return false;
        }
```

#### Parameters

•   - self: Pointer to FitsFile instance


──────────────────────────────────────────────────

### canModifyHeaders

Checks if header modifications are allowed based on file mode
Returns error.HeaderModificationNotAllowed if modifications are not permitted

#### Signature

```zig
    pub fn canModifyHeaders(self: *FitsFile) !void {
        if (self.mode.READ_ONLY or !self.mode.ALLOW_HEADER_MODS) {
            return error.HeaderModificationNotAllowed;
        }
```

#### Parameters

•   - self: Pointer to FitsFile instance


──────────────────────────────────────────────────

### createFits

Creates a new FITS file

#### Signature

```zig
    pub fn createFits(allocator: std.mem.Allocator, path: [*c]const u8) !*FitsFile {
        var status: c_int = 0;
        // Convert input path to slice
        const path_slice = std.mem.span(path);
        // Add ! prefix and null terminator in one allocation
        const c_path = try std.fmt.allocPrint(allocator, "!{s}\x00", .{path_slice});
        defer allocator.free(c_path);
        var fptr: ?*c.fitsfile = null;
        const result = c.fits_create_file(&fptr, @ptrCast(c_path), &status);
        if (result != 0) return error.CreateFileFailed;
        const fits = try allocator.create(FitsFile);
        fits.* = .{
            .fptr = fptr.?,
            .allocator = allocator,
        };
        return fits;
    }
```

#### Parameters

•   - allocator: Memory allocator for dynamic allocations
•   - path: File path for the new FITS file


──────────────────────────────────────────────────

### open

Opens an existing FITS file

#### Signature

```zig
    pub fn open(allocator: std.mem.Allocator, path: [*c]const u8, mode: c_int) !*FitsFile {
        var status: c_int = 0;
        const c_path = try u.addNullByte(allocator, path);
        defer allocator.free(c_path);
        const c_path_c: [*c]const u8 = @ptrCast(c_path);
        var fptr: ?*c.fitsfile = null;
        const result = c.fits_open_file(&fptr, c_path_c, mode, &status);
        if (result != 0) {
            std.debug.print("Open failed with status: {d}\n", .{status});
            return error.OpenFileFailed;
        }
```

#### Parameters

•   - allocator: Memory allocator for dynamic allocations
•   - path: Path to existing FITS file
•   - mode: File access mode (e.g., READONLY, READWRITE)


──────────────────────────────────────────────────

### close

Closes an open FITS file and frees associated resources

#### Signature

```zig
    pub fn close(self: *FitsFile) !void {
        var status: c_int = 0;
        const result = c.fits_close_file(self.fptr, &status);
        self.allocator.destroy(self);
        if (result != 0) return error.CloseFileFailed;
    }
```

#### Parameters

•   - self: Pointer to FitsFile instance


──────────────────────────────────────────────────

### readImage

Reads image data from the current HDU
Currently supports only 32-bit integer data

#### Signature

```zig
    pub fn readImage(self: *FitsFile) ![]i32 {
        var status: c_int = 0;
        var anynull: c_int = 0;
        var nullval: i32 = 0;
        const img_len = 1000;
        var img: [img_len]i32 = undefined;
        const result = c.fits_read_img(self.fptr, c.TINT, 1, img_len, &nullval, &img[0], &anynull, &status);
        if (result != 0) return error.ReadImageFailed;
        return img[0..];
    }
```

#### Parameters

•   - self: Pointer to FitsFile instance


──────────────────────────────────────────────────

### getHDUCount

Gets the total number of HDUs (Header Data Units) in the file

#### Signature

```zig
    pub fn getHDUCount(self: *FitsFile) !usize {
        var hdu_count: c_long = 0;
        var status: c_int = 0;
        const result = c.fits_get_num_hdus(self.fptr, &hdu_count, &status);
        if (result != 0) {
            return error.InvalidFile;
        }
```

#### Parameters

•   - self: Pointer to FitsFile instance


──────────────────────────────────────────────────

### getImageDimensions

Gets the dimensions of the current image HDU
Currently supports only 2D images

#### Signature

```zig
    pub fn getImageDimensions(self: *FitsFile) ![2]usize {
        var status: c_int = 0;
        const naxis = 2;
        var dims: [naxis]c_long = undefined;
        const result = c.fits_get_img_size(self.fptr, naxis, &dims[0], &status);
        if (result != 0) {
            return error.InvalidImageData;
        }
```

#### Parameters

•   - self: Pointer to FitsFile instance


──────────────────────────────────────────────────

### flush

Flushes any pending changes to disk

#### Signature

```zig
    pub fn flush(self: *FitsFile) !void {
        var status: c_int = 0;
        const result = c.fits_flush_file(self.fptr, &status);
        if (result != 0) return error.FlushFailed;
    }
```

#### Parameters

•   - self: Pointer to FitsFile instance

