import json
import logging
import sys

import importlib

import copy
from collections import namedtuple

RequestInfo = namedtuple('RequestInfo',
                         [
                             'serp_page_attempts',
                             'serp_resources',
                             'serpRequestExplained',
                             'serp_request_explained',
                         ])

logger = logging.getLogger("yt_mapper_wrapper")
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch = logging.StreamHandler()
ch.setFormatter(formatter)
logger.addHandler(ch)


def process_args(args):
    # input_stream = codecs.getreader('utf8')(sys.stdin)
    input_stream = sys.stdin
    module = args.module
    classname = args.classname
    parser_class = load_parser_class(module, classname)
    parser = parser_class()
    if args.parse_only:
        print(json.dumps(parser.parse(input_stream.read()), ensure_ascii=False).encode('utf8'))
        return

    for line in input_stream:
        input_row = json.loads(line)
        parsed_row = process_row(parser, input_row)
        if parsed_row:
            for key in ['GroupId', 'ConfigId']:
                if key in input_row:
                    parsed_row[key] = input_row[key]
            print(json.dumps(parsed_row, ensure_ascii=False).encode('utf8'))


def load_parser_class(module, classname):
    parser_module = importlib.import_module(module)
    return getattr(parser_module, classname)


def parse(parser, content, base_url):
    additional_parameters = {}
    if base_url:
        additional_parameters['url'] = base_url
    return parser.parse(content, additional_parameters)


def process_row(parser, input_row):
    if 'raw-serp' in input_row or 'full-serp' in input_row:
        # Processing of the old (pre-SCRAPER-1783) YT table format.
        # This part can be removed when no tables of this form exist anymore.
        if 'raw-serp' in input_row:
            try:
                string_to_parse = input_row['raw-serp']['serp-page']['raw-content']
                request_id = input_row['request-id']
                request_info = extract_request_info(input_row['raw-serp'])
                url = input_row['raw-serp']['serp-page'].get('serp-resources', {}).get('main-page-url')
            except (KeyError, TypeError):
                logger.exception("Unexpected structure for 'raw-serp'")
                raise
        elif 'full-serp' in input_row:
            try:
                string_to_parse = input_row['full-serp']['serp-page']['serp-resources']['resources'][-1]['content']
                request_id = input_row['request-id']
                request_info = extract_request_info(input_row['full-serp'])
                url = input_row['full-serp']['serp-page'].get('serp-resources', {}).get('main-page-url')
            except (KeyError, TypeError):
                logger.exception("Unexpected structure for 'full-serp'")
                raise
        if string_to_parse:
            parsed_json = parse(parser, string_to_parse, url)
        else:
            parsed_json = None
        parsed_serp = {
            'class': "ru.yandex.qe.scraper.api.serp.ParsedSerp",
            'serp-page': {
                'class': "ru.yandex.qe.scraper.api.serp.page.ParsedSerpPage",
                'parser-results': parsed_json,
                'serp-page-attempts': request_info.serp_page_attempts
            },
            'serpRequestExplained': request_info.serpRequestExplained,
            'serp-request-explained': request_info.serp_request_explained
        }
        if 'status' in input_row:
            parsed_serp['status'] = input_row['status']

        full_serp = copy.deepcopy(parsed_serp)
        full_serp['serp-page']['serp-resources'] = request_info.serp_resources

        result = {
            'request-id': request_id,
            'parsed-serp': parsed_serp,
            'full-serp': full_serp
        }
        return result
    elif 'content' in input_row:
        # Processing of the new (post-SCRAPER-1783) YT table format.
        result = copy.deepcopy(input_row)
        content = input_row['content']
        if content:
            parsed_content = parser.parse(content)
        else:
            parsed_content = None
        result['parser-result'] = parsed_content
        return result
    elif 'FetchedResult' in input_row:
        # Processing scraper-over-yt table format (METRICS-3494)
        content = input_row['FetchedResult']
        processed_url = input_row['ProcessedUrl']
        parsed_content = parse(parser, content, processed_url)
        query = json.loads(input_row['userdata'])
        id = input_row['id']
        return {
            'id': id,
            'query': query,
            'parser-result': parsed_content,
            'processed-url': processed_url
        }
    elif 'Error' in input_row:
        # Processing scraper-overy-yt error table format (METRICS-3510)
        query = json.loads(input_row['userdata'])
        id = input_row['id']
        error = input_row['Error']
        processed_url = input_row['ProcessedUrl']
        return {
            'id': id,
            'query': query,
            'error': error,
            'processed-url': processed_url
        }
    elif '$value' in input_row:
        # YT table switch
        pass
    else:
        message = "'raw-serp', 'full-serp', 'content', 'FetchedResult' or 'Error' expected."
        logger.error(message)
        raise ValueError(message)


def extract_request_info(raw_or_full_serp):
    serp_page_attempts = raw_or_full_serp['serp-page']['serp-page-attempts']
    serp_resources = raw_or_full_serp['serp-page'].get('serp-resources')
    serpRequestExplained = raw_or_full_serp['serpRequestExplained']
    serp_request_explained = raw_or_full_serp['serp-request-explained']
    return RequestInfo(serp_page_attempts, serp_resources, serpRequestExplained, serp_request_explained)
