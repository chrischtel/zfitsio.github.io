---
title: root
description: API documentation for root
sidebar:
    order: 1
---

# root
════

## Contents
━━━━━━━━━

- [Overview](#overview)
- [Types](#types)
- [Methods](#methods)

──────────────────────────────────────────────────



## Overview
━━━━━━━━━

## FitsFile

Main FITS file handling module that provides core functionality for reading and writing FITS files.
Includes operations for opening, reading, and manipulating FITS files.

```zig
pub const FitsFile = @import("fitsfile.zig");
```

---

## FITSHeader

FITS header manipulation module that handles reading, writing, and modifying FITS headers.
Provides functionality for working with FITS keywords, values, and comments.

```zig
pub const FITSHeader = @import("FITSHeader.zig");
```

---

## DataTypes

Contains definitions and utilities for handling FITS data types.
Includes type conversion, validation, and size calculations for FITS data formats.

```zig
pub const DataTypes = @import("datatypes.zig");
```

---

## ImageOperations

Image processing and manipulation functionality for FITS image data.
Provides operations for reading image data, pixel manipulation, and basic image processing.

```zig
pub const ImageOperations = @import("Image.zig");
```

---

