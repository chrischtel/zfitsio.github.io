---
title: datatypes
description: API documentation for datatypes
sidebar:
    order: 1
---

# datatypes
═════════

## Contents
━━━━━━━━━

- [Overview](#overview)
- [Types](#types)
- [Methods](#methods)

──────────────────────────────────────────────────



## Overview
━━━━━━━━━

## FitsType

FITS Data Type Handling
This module provides functionality for handling FITS data types and their conversion
to native Zig types.
Represents the standard FITS data types as defined in the FITS standard.
Each variant corresponds to a specific data type with its associated type code.

```zig
pub const FitsType = enum(i32) {
    /// Logical value stored as a single bit
    TBIT = 1,
    /// 8-bit unsigned byte
    TBYTE = 11,
    /// Logical value stored as a full byte
    TLOGICAL = 14,
    /// ASCII character string
    TSTRING = 16,
    /// 16-bit signed integer
    TSHORT = 21,
    /// 32-bit signed integer
    TINT = 31,
    /// 64-bit signed integer
    TLONG = 41,
    /// 32-bit floating point number
    TFLOAT = 42,
    /// 64-bit floating point number
    TDOUBLE = 82,
};
```

---

## getZigType

Maps a FITS data type to its corresponding Zig type.

```zig
pub fn getZigType(comptime datatype: FitsType) type {
    return switch (datatype) {
        .TBIT, .TLOGICAL => bool,
        .TBYTE, .TSTRING => u8,
        .TSHORT => i16,
        .TINT => i32,
        .TLONG => i64,
        .TFLOAT => f32,
        .TDOUBLE => f64,
    };
}
```

### Parameters

-  - datatype: The FITS data type to convert

---

## readFitsData

Reads FITS binary data and converts it to a Zig slice of the specified type.
Handles byte-swapping as FITS data is stored in big-endian format.

```zig
pub fn readFitsData(
```

### Parameters

-  - allocator: Memory allocator for the result array
-  - T: The Zig type to convert the data to
-  - data: Raw bytes of FITS data
-  - datatype: The FITS data type of the input data

### Errors

-  - InvalidDataSize: If the input data size is not a multiple of the type size
-  - OutOfMemory: If allocation fails
-  - Type mismatch at compile time if T doesn't match the FITS type

---

## getSizeForType

Returns the size in bytes for a given FITS data type.

```zig
pub fn getSizeForType(datatype: FitsType) usize {
    return switch (datatype) {
        .TBIT, .TLOGICAL, .TBYTE, .TSTRING => 1,
        .TSHORT => 2,
        .TINT, .TFLOAT => 4,
        .TLONG, .TDOUBLE => 8,
    };
}
```

### Parameters

-  - datatype: The FITS data type to get the size for

---

