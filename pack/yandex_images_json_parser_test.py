from test_utils import TestParser


QUERY = {
    'text': "test",
    'region': {'id': 1}
}


TOUCH_QUERY = {
    'text': "test",
    'region': {'id': 1},
    'device': 'ANDROID'
}


class TestYandexImagesJSONParser(TestParser):

    def test_parse(self):
        components = self.parse_file('lenovo.json')['components']
        assert len(components) == 20
        component = components[0]
        assert component['url.imageBigThumbHref'] == 'http://im0-tub-ru.yandex.net/i?id=544eb238be2d07d287d765b75ffa517e-l&n=13'
        assert component['componentUrl']['pageUrl'] == 'https://www.varle.lt/m/nesiojami-kompiuteriai/nesiojami-kompiuteriai/nesiojamas-kompiuteris-lenovo-thinkpad-t480s-140--8443533.html'
