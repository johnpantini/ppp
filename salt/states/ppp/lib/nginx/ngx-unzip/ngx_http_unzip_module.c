
/*
 * Copyright (C) johnpantini
 */

#include <ngx_config.h>
#include <ngx_core.h>
#include <ngx_http.h>

#include "../ngx-utils.c"
#include "zip.h"


typedef struct {
} ngx_http_unzip_loc_conf_t;


static char *ngx_http_unzip(ngx_conf_t *cf, ngx_command_t *cmd, void *conf);

static void *ngx_http_unzip_create_loc_conf(ngx_conf_t *cf);
static char *ngx_http_unzip_merge_loc_conf(ngx_conf_t *cf,
    void *parent, void *child);


static ngx_command_t ngx_http_unzip_commands[] = {
    { ngx_string("ngx_unzip"),
      NGX_HTTP_LOC_CONF|NGX_CONF_NOARGS,
      ngx_http_unzip,
      NGX_HTTP_LOC_CONF_OFFSET,
      0,
      NULL},

     ngx_null_command
};

static ngx_http_module_t ngx_http_unzip_module_ctx = {
    NULL,                                  /* preconfiguration */
    NULL,                                  /* postconfiguration */

    NULL,                                  /* create main configuration */
    NULL,                                  /* init main configuration */

    NULL,                                  /* create server configuration */
    NULL,                                  /* merge server configuration */

    ngx_http_unzip_create_loc_conf,        /* create location configuration */
    ngx_http_unzip_merge_loc_conf          /* merge location configuration */
};


ngx_module_t ngx_http_unzip_module = {
    NGX_MODULE_V1,
    &ngx_http_unzip_module_ctx,            /* module context */
    ngx_http_unzip_commands,               /* module directives */
    NGX_HTTP_MODULE,                       /* module type */
    NULL,                                  /* init master */
    NULL,                                  /* init module */
    NULL,                                  /* init process */
    NULL,                                  /* init thread */
    NULL,                                  /* exit thread */
    NULL,                                  /* exit process */
    NULL,                                  /* exit master */
    NGX_MODULE_V1_PADDING
};


void *
ngx_http_unzip_create_loc_conf(ngx_conf_t *cf)
{
    ngx_http_unzip_loc_conf_t *conf;

    conf = ngx_pcalloc(cf->pool, sizeof(ngx_http_unzip_loc_conf_t));
    if (conf == NULL) {
        return NGX_CONF_ERROR;
    }

    return conf;
}


static char *
ngx_http_unzip_merge_loc_conf(ngx_conf_t *cf, void *parent, void *child)
{
    return NGX_CONF_OK;
}


void
ngx_http_unzip_process_body(ngx_http_request_t *r)
{
    ngx_http_request_body_t *body;
    body = r->request_body;

    if (body == NULL || body->bufs == NULL || body->bufs->buf == NULL || ngx_buf_size(body->bufs->buf) == 0) {
        ngx_int_t rc;
        rc = nginx_utils_reply_with_error(r, "ValidationError", "\\\"payload\\\" must not be empty", 422,
            "Unprocessable Content",
            "{}");
        ngx_http_finalize_request(r, rc);
        return;
    }

    size_t len = 0;
    u_char *p, *last, *buf;
    ngx_chain_t *cl;
    ngx_buf_t *b;

    if (body->bufs->next != NULL) {
        /* Multiple buffers body. */
        len = 0;

        for (cl = r->request_body->bufs; cl; cl = cl->next) {
            b = cl->buf;

            if (b->in_file) {
                ngx_int_t rc;
                rc = nginx_utils_reply_with_error(r, "PayloadLengthError",
                    "Payload content length greater than maximum allowed", 413,
                    "Payload Too Large",
                    "{}");
                ngx_http_finalize_request(r, rc);
                return;
            }

            len += b->last - b->pos;
        }

        if (len == 0) {
            ngx_http_finalize_request(r, NGX_HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        buf = ngx_palloc(r->pool, len);
        if (buf == NULL) {
            ngx_http_finalize_request(r, NGX_HTTP_INTERNAL_SERVER_ERROR);
            return;
        }

        p = buf;
        last = p + len;

        for (cl = r->request_body->bufs; cl; cl = cl->next) {
            p = ngx_copy(p, cl->buf->pos, cl->buf->last - cl->buf->pos);
        }
    }
    else {
        /* One-buffer body. */
        b = body->bufs->buf;

        buf = b->pos;
        last = b->last;
        len = last - buf;
    }

    struct zip_t *zip = zip_open_mem((char *) buf, len, 0, 'r');
    zip_entry_open(zip, (const char *) r->args.data, r->args.len);

    size_t entry_size;
    entry_size = zip_entry_size(zip);

    unsigned char *zip_content;
    zip_content = ngx_palloc(r->pool, entry_size);

    if (!zip_content) {
        ngx_log_error(NGX_LOG_ERR, r->connection->log, 0, "Failed to allocate unzipped response buffer memory.");
        zip_entry_close(zip);
        zip_close(zip);
        ngx_http_finalize_request(r, NGX_HTTP_INTERNAL_SERVER_ERROR);
        return;
    }

    zip_entry_noallocread(zip, (void *)zip_content, entry_size);
    zip_entry_close(zip);
    zip_close(zip);

    ngx_buf_t *rb;
    ngx_chain_t out;

    rb = ngx_pcalloc(r->pool, sizeof(ngx_buf_t));

    if (rb == NULL) {
        ngx_log_error(NGX_LOG_ERR, r->connection->log, 0, "Failed to allocate response buffer.");
        ngx_http_finalize_request(r, NGX_HTTP_INTERNAL_SERVER_ERROR);
        return;
    }

    rb->pos = zip_content;
    rb->last = zip_content + entry_size;
    rb->memory = 1;
    rb->last_buf = 1;

    r->headers_out.status = NGX_HTTP_OK;
    r->headers_out.content_length_n = entry_size;

    ngx_int_t rc;
    rc = ngx_http_send_header(r);

    if (rc == NGX_ERROR || rc > NGX_OK || r->header_only) {
        ngx_http_finalize_request(r, rc);
        return;
    }

    out.buf = rb;
    out.next = NULL;

    rc = ngx_http_output_filter(r, &out);

    ngx_http_finalize_request(r, rc);
}

static ngx_int_t
ngx_http_unzip_handler(ngx_http_request_t *r)
{
    ngx_int_t rc = NGX_DONE;

    if (!(r->method & (NGX_HTTP_POST))) {
        ngx_log_error(NGX_LOG_ERR, r->connection->log, 0, "Only POST request is supported by the ngx_unzip module.");
        return NGX_HTTP_NOT_ALLOWED;
    }

    rc = ngx_http_read_client_request_body(r, ngx_http_unzip_process_body);
    if (rc >= NGX_HTTP_SPECIAL_RESPONSE) {
        return rc;
    }

    if (rc == NGX_OK || rc == NGX_AGAIN)
        rc = NGX_DONE;

    return rc;
}


char *
ngx_http_unzip(ngx_conf_t *cf, ngx_command_t *cmd, void *conf)
{
    ngx_http_core_loc_conf_t *clcf;

    clcf = ngx_http_conf_get_module_loc_conf(cf, ngx_http_core_module);
    clcf->handler = ngx_http_unzip_handler;

    return NGX_CONF_OK;
}
