"""
Yandex Images Json Parser
"""

import urllib
from base_parsers import JSONSerpParser


ComponentTypes = JSONSerpParser.MetricsMagicNumbers.ComponentTypes
Alignments = JSONSerpParser.MetricsMagicNumbers.Alignments


class YandexImagesJSONParser(JSONSerpParser):

    URL_TEMPLATE = 'https://{host}/images/search/'
    TOUCH_URL_TEMPLATE = 'https://{host}/images/touch/search/'

    def _get_url_template(self, query):
        device = query.get('device')
        if device and device != 'DESKTOP':
            return self.TOUCH_URL_TEMPLATE
        return self.URL_TEMPLATE

    def _prepare_cgi(self, basket_query, host, additional_parameters):
        query = urllib.quote_plus(basket_query['text'].encode('utf8'))
        region = basket_query['region']['id']

        parameters = [
            ('text', query),
            ('lr', region),
            ('json_dump', 'searchdata.images')
        ]
        return parameters

    def _parse_json(self, data, additional_parameters={}):
        components = [self._parse_component(data_component) for data_component in data.get('searchdata.images', [])]
        return {'components': components}

    def _parse_component(self, data):
        big_thumb = data.get('big_thmb_href')
        if big_thumb:
            big_thumb = self._fix(big_thumb)

        html_href = data.get('html_href')

        return {
            'url.imageBigThumbHref': big_thumb,
            'componentUrl': {'pageUrl': html_href},
            'imageadd': {'candidates': self._parse_candidates(data)},
            "type": "COMPONENT",
            'componentInfo': {
                'type': ComponentTypes.SEARCH_RESULT,
                'alignment': Alignments.LEFT
            }
        }

    def _fix(self, url):
        # we use http to match current monitoring serps.
        return 'http:' + url + '&n=13'  # see https://st.yandex-team.ru/METRICSSUPPORT-562#59fb17a22a28c900229e41af for n=13 details

    def _parse_candidates(self, data):
        elements = data['preview_dups'] + data['duplicates']
        return [element['img_href'] for element in elements]
