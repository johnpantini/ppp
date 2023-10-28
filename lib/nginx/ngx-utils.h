#pragma once
#ifndef __NGX_UTILS_H__
#define __NGX_UTILS_H__

#include <ngx_http.h>

#define ERROR_RESPONSE_STR_LEN 512
#define UTC_TIME_STR_LEN 21

static ngx_int_t
nginx_utils_reply_with_error(ngx_http_request_t *r, const char *exception, const char *message,
    int status_code, const char *http_error, const char *details);
static void
ngx_utils_get_time(char *buffer, size_t size);

#endif /* __NGX_UTILS_H__ */
