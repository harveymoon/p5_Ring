#pragma once
/*
 * p5-ring custom platform shim for mJS — RP2040 + arduino-pico (newlib).
 * Picked CS_P_CUSTOM (set via build_flag -DCS_PLATFORM=CS_P_CUSTOM) instead of
 * CS_P_STM32 because the stock STM32 path #includes <stm32_sdk_hal.h>.
 * Everything else (newlib headers, malloc, FILE*) is available.
 */

#include <ctype.h>
#include <errno.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <sys/types.h>

#define to64(x) strtoll(x, NULL, 10)
#define INT64_FMT "lld"
#define SIZE_T_FMT "u"
#define DIRSEP '/'

/* mJS uses cs_stat_t purely as an opaque struct for size — newlib's stat works. */
#include <sys/stat.h>
typedef struct stat cs_stat_t;

#ifndef CS_ENABLE_STDIO
#define CS_ENABLE_STDIO 1
#endif

/* mJS doesn't actually need filesystem support — we feed it text via mjs_exec. */
#ifndef MG_ENABLE_FILESYSTEM
#define MG_ENABLE_FILESYSTEM 0
#endif
