#!/bin/sh

## https://apple.stackexchange.com/a/123954
## brew install duti

if [ $# -eq 0 ]; then
    echo "Usage: $0 <app_bundle_id>"
    exit 1
fi

duti -s $1 public.plain-text all
duti -s $1 public.unix-executable all
duti -s $1 public.data all

