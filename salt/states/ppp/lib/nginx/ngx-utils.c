#include "ngx-utils.h"


void
ngx_utils_get_time(char *buffer, size_t size)
{
    struct tm *utc;
    time_t now;
    now = time(NULL);
    utc = gmtime(&now);
    strftime(buffer, size, "%Y-%m-%dT%H:%M:%SZ", utc);
}


ngx_int_t
nginx_utils_reply_with_error(ngx_http_request_t *r, const char *exception, const char *message, int status_code,
    const char *http_error, const char *details)
{
    ngx_int_t rc = NGX_OK;

    if (!r->request_body) {
        /* Body has not been read yet. */
        rc = ngx_http_discard_request_body(r);
    }

    if (rc >= NGX_HTTP_SPECIAL_RESPONSE) {
        return rc;
    }

    char time[UTC_TIME_STR_LEN];
    ngx_utils_get_time(time, sizeof(time));

    ngx_buf_t *b;
    ngx_chain_t out;
    b = ngx_pcalloc(r->pool, sizeof(ngx_buf_t));

    if (b == NULL) {
        return NGX_HTTP_INTERNAL_SERVER_ERROR;
    }

    out.buf = b;
    out.next = NULL;
    u_char *buf;
    buf = ngx_palloc(r->pool, ERROR_RESPONSE_STR_LEN);

    if (buf == NULL) {
        ngx_log_error(NGX_LOG_ERR, r->connection->log, 0, "Failed to allocate response buffer.");

        return NGX_HTTP_INTERNAL_SERVER_ERROR;
    }

    int len = snprintf((char *) buf,
        ERROR_RESPONSE_STR_LEN,
        "{\"timestamp\":\"%s\",\"exception\":\"%s\",\"details\":%s,\"message\":\"%s\",\"status_code\":%d,\"http_error\":\"%s\"}",
        time,
        exception,
        details,
        message,
        status_code,
        http_error);

    b->pos = buf;
    b->last = buf + len;
    b->memory = 1;
    b->last_buf = 1;

    r->headers_out.content_type.len = sizeof("application/json") - 1;
    r->headers_out.content_type.data = (u_char *) "application/json";
    r->headers_out.status = status_code;
    r->headers_out.content_length_n = len;

    rc = ngx_http_send_header(r);

    if (rc == NGX_ERROR || rc > NGX_OK) {
        return NGX_HTTP_INTERNAL_SERVER_ERROR;
    }

    return ngx_http_output_filter(r, &out);
}
