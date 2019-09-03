import csv
import json
import logging
import re
import time

try:  # we want to work without ya make
    from urlparse import urlparse,  urlunparse
    import urllib
    import urllib
    from library.python import resource
except:
    pass


INIT_TIMESTAMP = int(time.time())


class SerpParser(object):
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch = logging.StreamHandler()
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)

        self.tlds = None

    def parse(self, input_string, additional_parameters={}):
        return {"input": input_string}

    def parsedJSON(self, input_string):
        return json.dumps(self.parse(input_string))

    class MetricsMagicNumbers(object):
        class ComponentTypes(object):
            # https://wiki.yandex-team.ru/JandeksPoisk/Metrics/API/serp/#component.componentinfo
            SEARCH_RESULT = 1
            WIZARD = 2
            ADDV = 3
            ADVQ = 4
            UNKNOWN = 5
            DEBUG = 6
            GEO_SEARCH = 7
            SITE_LINK = 8

            @classmethod
            def as_dict(cls):
                return {k: v for k, v in cls.__dict__.items() if not k.startswith("__")}

        class Alignments(object):
            TOP = 1
            BOTTOM = 2
            LEFT = 3
            RIGHT = 4
            CENTER = 5
            NO = 6

            @classmethod
            def as_dict(cls):
                return {k: v for k, v in cls.__dict__.items() if not k.startswith("__")}

        class WizardTypes(object):
            to_metrics_format = {
                "WIZARD_ADRESA": 11,
                "WIZARD_MAPS": 15,
                "WIZARD_PANORAMA": 64,
                "WIZARD_TRANSPORT": 79,
                "WIZARD_TRAFFIC": 97,
                "WIZARD_ROUTE": 116,
                "WIZARD_ORGMN": 137,
                "METRICS_UNKNOWN_RELATED_QUERIES": 1002,
            }

            wizard_name_to_type = {
                "transit": "WIZARD_TRANSPORT",
                "route": "WIZARD_ROUTE",
                "traffic": "WIZARD_TRAFFIC",
                "panoramas": "WIZARD_PANORAMA",
                "company": "WIZARD_ADRESA",
                "companies": "WIZARD_ORGMN",
                "maps": "WIZARD_MAPS"
            }

            @classmethod
            def as_dict(cls):
                return {k: v for k, v in cls.__dict__.items() if not k.startswith("__")}

        # TODO: refactor, see MetricsMagicNumbers above.

    user_agent_mapping = {
        "DESKTOP": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 "
                   "YaBrowser/15.7.2357.2877 Safari/537.36",
        "ANDROID": "Mozilla/5.0 (Linux; Android 7.0; SM-G935V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/69.0.3497.100 Mobile Safari/537.36",
        "IPHONE": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0_1 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/12.0 "
                  "YaBrowser/18.9.3.73.10 Mobile/16A404 Safari/604.1",
        "WINDOWS_PHONE": "Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0;" +
                  "NOKIA; Lumia 930) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/53"
    }

    def get_tlds(self, tld_mapping={}):
        if self.tlds:
            return self.tlds
        if not tld_mapping:
            tlds = resource.find("yandextlds.tsv").decode("utf8").splitlines()
            reader = csv.reader(tlds, delimiter="\t")
            tld_mapping.update({row[0].upper(): row[1] for row in reader})
            self.logger.info("Load {} top level domain mappings".format(len(tld_mapping)))
        self.tlds = tld_mapping
        return tld_mapping

    def prepare(self, num, basket_query, host, additional_parameters={}):
        return {
            "id": str(num),
            "method": "GET",
            "uri": self._prepare_url(basket_query, host, additional_parameters),
            "headers": self._prepare_headers(basket_query, host, additional_parameters),
            "cookies": self._prepare_cookies(basket_query, host, additional_parameters),
            "userdata": self._prepare_userdata(basket_query, host, additional_parameters)
        }

    def _prepare_url(self, basket_query, host, additional_parameters={}):
        """Return a string"""

        url = self._prepare_url_wo_cgi(basket_query, host, additional_parameters)
        all_cgi_parameters = SerpParser._stringify_list_of_tuples(
            self._prepare_all_cgi(basket_query, host, additional_parameters))
        profile = SerpParser._get_profile(additional_parameters)
        ignore_profile_conflicts = SerpParser._get_ignore_profile_conflicts(additional_parameters)
        all_cgi_parameters = SerpParser._merge_cgi_with_profile(profile, ignore_profile_conflicts, all_cgi_parameters,
                                                                'additional-cgi')

        return self._add_cgis(url, all_cgi_parameters)

    def _prepare_url_wo_cgi(self, basket_query, host, additional_parameters={}):
        """Returns url without cgis"""
        country = basket_query.get("country")

        tld_mapping = self.get_tlds()

        if country in tld_mapping:
            host = re.sub("(\.com)?\.[a-z]+$", "." + tld_mapping[country], host)

        url = self._get_url_template(basket_query).format(host=host)
        return url

    def _get_url_template(self, basket_query):
        return self.URL_TEMPLATE

    def _prepare_all_cgi(self, basket_query, host, additional_parameters={}):
        """Return a list of key-value pairs or key 1-tuples

        Standard parameters are parameters set in the preparer (e.g. query, region and such).
        These are what you normally want to define in your preparer.
        Additional parameters come from batch parameters (e.g. cron settings)."""

        standard_cgi_parameters = self._prepare_cgi(basket_query, host, additional_parameters)
        additional_cgi_parameters = self._prepare_additional_cgi(basket_query, host, additional_parameters)
        ssr_cgi_parameters = self._prepare_ssr_cgi(basket_query, host, additional_parameters)
        return standard_cgi_parameters + ssr_cgi_parameters + additional_cgi_parameters

    def _prepare_cgi(self, basket_query, host, additional_parameters={}):
        """Return a list of key-value pairs"""
        return []

    def _prepare_additional_cgi(self, basket_query, host, additional_parameters={}):
        result = []
        if additional_parameters.get('cgi'):
            result += SerpParser._parse_qs(additional_parameters['cgi'])
        timestamp_cgi = additional_parameters.get('timestampCgi')
        if timestamp_cgi:
            result.append((timestamp_cgi, INIT_TIMESTAMP))
        return result

    def _prepare_ssr_cgi(self, basket_query, host, additional_parameters={}):
        ssr_cgi = additional_parameters.get('ssr', {}).get('per-set-parameters', {}).get('additional-cgi', {})
        return SerpParser._convert_multimap_to_tuple_list(ssr_cgi)

    def _prepare_headers(self, basket_query, host, additional_parameters={}):
        """Return a list of strings of the form 'X-Yandex-HTTPS: yes'"""
        headers = SerpParser._stringify_list_of_tuples(
            SerpParser._convert_multimap_to_tuple_list(self._prepare_headers_multimap(basket_query, host, additional_parameters)))
        profile = SerpParser._get_profile(additional_parameters)
        ignore_profile_conflicts = SerpParser._get_ignore_profile_conflicts(additional_parameters)
        headers = SerpParser._merge_entities_with_profile(profile, ignore_profile_conflicts, headers,
                                                          'additional-headers')

        return SerpParser._collect(headers, ': ')

    def _prepare_headers_multimap(self, basket_query, host, additional_parameters={}):
        return {}

    def _prepare_cookies(self, basket_query, host, additional_parameters={}):
        """Return a list of strings of the form 'YX_SHOW_STUFF=1'"""
        cookies = SerpParser._stringify_list_of_tuples(
            SerpParser._convert_multimap_to_tuple_list(self._prepare_cookies_multimap(basket_query, host, additional_parameters)))
        profile = SerpParser._get_profile(additional_parameters)
        ignore_profile_conflicts = SerpParser._get_ignore_profile_conflicts(additional_parameters)
        cookies = SerpParser._merge_entities_with_profile(profile, ignore_profile_conflicts, cookies,
                                                          'additional-cookies')

        return SerpParser._collect(cookies, "=")

    def _prepare_cookies_multimap(self, basket_query, host, additional_parameters={}):
        return {}

    def _prepare_userdata(self, basket_query, host, additional_parameters={}):
        """Return a JSON string"""
        return json.dumps(basket_query, ensure_ascii=False)

    @staticmethod
    def _merge_cgi_with_profile(profile, ignore_profile_conflicts, all_cgi_parameters, additional_cgi_node_name):
        if profile is None:
            return all_cgi_parameters

        additional_cgi = SerpParser._get_additional(profile, additional_cgi_node_name)

        if SerpParser._is_allowed_to_edit(profile, additional_cgi_node_name):
            allowed_cgi = SerpParser._get_cgi_restriction(profile, "allowed-cgi")
            not_allowed_cgi = SerpParser._get_cgi_restriction(profile, "not-allowed-cgi")

            if ignore_profile_conflicts:
                all_cgi_parameters = SerpParser._sanitize_cgi(all_cgi_parameters, allowed_cgi, not_allowed_cgi)
            else:
                SerpParser._check_cgi(all_cgi_parameters, allowed_cgi, not_allowed_cgi)

            return additional_cgi + all_cgi_parameters

        if not ignore_profile_conflicts and not SerpParser._check_entities_equals(all_cgi_parameters, additional_cgi):
            raise ValueError("Param '{}' is not allowed to edit".format(additional_cgi_node_name))

        return additional_cgi

    @staticmethod
    def _merge_entities_with_profile(profile, ignore_profile_conflicts, entities, additional_name):
        if profile is None:
            return entities

        allowed_to_edit = SerpParser._is_allowed_to_edit(profile, additional_name)
        additional_entities = SerpParser._get_additional(profile, additional_name)

        if not allowed_to_edit and not ignore_profile_conflicts:
            if SerpParser._check_entities_equals(additional_entities, entities):
                return entities
            else:
                raise ValueError("Param '{}' is not allowed to edit", additional_name)

        return entities + additional_entities

    @staticmethod
    def _stringify(value):
        return None if value is None else str(value)

    @staticmethod
    def _stringify_list_of_tuples(lst):
        return [(SerpParser._stringify(name), SerpParser._stringify(value)) for name, value in lst]

    @staticmethod
    def _stringify_multimap(map):
        new_map = dict()
        for name, values in map.items():
            new_list = []
            for value in values:
                new_list.append(SerpParser._stringify(value))
            new_map[SerpParser._stringify(name)] = new_list

        return new_map

    @staticmethod
    def _stringify_map(map):
        return {SerpParser._stringify(name): SerpParser._stringify(value) for name, value in map.items()}

    @staticmethod
    def _collect(lst, separator):
        # It might be better to check the standard https://www.ietf.org/rfc/rfc6265.txt and
        # add some escaping here. Now, it is utilized to generate list of headers and list of cookies
        return [name + separator + value for name, value in lst]

    @staticmethod
    def _sanitize_cgi(all_cgi_parameters, allowed_cgi, not_allowed_cgi):
        sanitized_cgi = []

        for name, value in all_cgi_parameters:
            if SerpParser._is_allowed_cgi(allowed_cgi, name, value) and \
                    not SerpParser._is_not_allowed_cgi(not_allowed_cgi, name, value):
                sanitized_cgi.append((name, value))

        return sanitized_cgi

    @staticmethod
    def _is_not_allowed_cgi(not_allowed_cgi, name, value):
        return name in not_allowed_cgi and SerpParser._smart_contains(not_allowed_cgi[name], value)

    @staticmethod
    def _is_allowed_cgi(allowed_cgi, name, value):
        return SerpParser._smart_contains(allowed_cgi, name) and \
               SerpParser._smart_contains(allowed_cgi.get(name, []), value)

    @staticmethod
    def _check_entities_equals(entities_to_check, entities_etalon):
        canonical_entities_to_check = SerpParser._get_canonical(entities_to_check)
        canonical_entities_etalon = SerpParser._get_canonical(entities_etalon)

        return canonical_entities_etalon == canonical_entities_to_check

    @staticmethod
    def _get_canonical(tuples):
        new_tuples = dict()

        for name, value in tuples:
            new_tuples.setdefault(name, []).append(value)

        for values in new_tuples.values():
            values.sort()

        return new_tuples

    @staticmethod
    def _check_cgi(all_cgi_parameters, allowed_cgi, not_allowed_cgi):
        for name, value in all_cgi_parameters:
            if not SerpParser._smart_contains(allowed_cgi, name):
                raise ValueError("Not allowed cgi parameter '{}'".format(name))

            allowed_cgi_values = allowed_cgi.get(name, [])

            if not SerpParser._smart_contains(allowed_cgi_values, value):
                raise ValueError("Not allowed value '{}' for cgi parameter '{}'".format(value, name))

            if name in not_allowed_cgi:
                not_allowed_cgi_values = not_allowed_cgi[name]

                if not not_allowed_cgi_values:
                    raise ValueError("Not allowed cgi parameter '{}'".format(name))
                if value in not_allowed_cgi_values:
                    raise ValueError("Not allowed value '{}' for cgi parameter '{}'", value, name)

    @staticmethod
    def _smart_contains(collection, value):
        if not collection:
            return True

        return value in collection

    @staticmethod
    def _get_profile(additional_parameters):
        return additional_parameters.get("profile")

    @staticmethod
    def _get_ignore_profile_conflicts(additional_parameters):
        return additional_parameters.get("ignoreProfileConflicts", False)

    @staticmethod
    def _get_cgi_restriction(node, name):
        return SerpParser._stringify_multimap(node.get(name, {}))

    @staticmethod
    def _get_additional(node, additional_name):
        return SerpParser._stringify_list_of_tuples(
            SerpParser._convert_multimap_to_tuple_list(node.get("per-set-parameters", {}).get(additional_name, {})))

    @staticmethod
    def _convert_multimap_to_tuple_list(multimap):
        tuples = []

        for name, values in multimap.items():
            for value in values:
                tuples.append((name, value))

        return tuples

    @staticmethod
    def _is_allowed_to_edit(node, entity):
        return entity in node.get("allowed-to-edit", [])

    @staticmethod
    def _parse_qs(cgi_string):
        # urlparse.parse_qs returns a multimap and thus does not allow to retain order
        return [SerpParser._parse_qp(pair) for pair in cgi_string.split("&") if pair]

    @staticmethod
    def _parse_qp(cgi_param):
        name_value = cgi_param.split("=", 1)
        name = urllib.unquote_plus(name_value[0])
        value = urllib.unquote_plus(name_value[1]) if len(name_value) > 1 else None
        return name, value

    @staticmethod
    def _format_parameter(parameter):
        if not isinstance(parameter, tuple) and len(parameter) != 2:
            raise ValueError("2-tuple expected")

        name, value = parameter

        if value:
            return "{}={}".format(urllib.quote_plus(name), urllib.quote_plus(value))

        return urllib.quote_plus(name)

    @staticmethod
    def _add_cgis_from_string(url, cgi_string):
        cgi_list = SerpParser._parse_qs(cgi_string)
        return SerpParser._add_cgis(url, cgi_list)

    @staticmethod
    def _add_cgis(url, cgi_list):
        return SerpParser._append_cgis(url, cgi_list)

    @staticmethod
    def _append_cgis(url, cgi_list_to_append):
        p_u = urlparse(url)
        present_cgis = SerpParser._parse_qs(p_u.query)
        all_cgis = present_cgis + cgi_list_to_append

        new_query = "&".join(SerpParser._format_parameter(x) for x in all_cgis)
        s = urlunparse((p_u.scheme, p_u.netloc, p_u.path, p_u.params, new_query, p_u.fragment))
        return s


class JSONSerpParser(SerpParser):
    def __init__(self):
        super(JSONSerpParser, self).__init__()
        self.data = None

    def parse(self, input_string, additional_parameters={}):
        # You probably don't want to override this one.
        try:
            data = json.loads(input_string)
            self.data = data
            return self._parse_json(data, additional_parameters)
        except ValueError:
            self.logger.exception("JSON parsing error")

    def _parse_json(self, input_object, additional_parameters={}):
        # This one should be overridden in descendant classes.
        output_object = input_object
        return output_object

    def _get_element_by_path(self, *path_elements, **kwargs):
        """ Safe

        :param path_elements: strings and ints that are keys and indices of the corresponding level.
        :param default:
        :param json: if it is "root", path_elements specify a path from the root, otherwise it's a path in the passed object.
        :return: the node at the given path, default otherwise.
        """

        # default = None, json = "root"

        default = kwargs.get('default')
        json = kwargs.get('json', "root")

        if json == "root":
            node = self.data
        else:
            node = json
        delimeter = " > "
        path = delimeter.join(str(x) for x in path_elements)
        path_so_far = ""
        for pe in path_elements:
            path_so_far += str(pe)
            if node is None:
                self.logger.error("Node {} is null. Path: {}".format(path_so_far, path))
                break
            elif isinstance(node, dict):
                if pe in node:
                    node = node[pe]
                else:
                    self.logger.error("{} expected, but not found in path {}".format(path_so_far, path))
                    node = default
                    break
            elif isinstance(node, list):
                if isinstance(pe, str) and pe.isdigit():
                    pe = int(pe)
                if isinstance(pe, int):
                    if pe + 1 <= len(node):
                        node = node[pe]
                    else:
                        self.logger.error("{} expected, but not found in path {}".format(path_so_far, path))
                        break
                else:
                    self.logger.error("list index should be an int, got {} instead in {}".format(path_so_far, path))
                    break
            else:
                self.logger.error("Failed to go to {} in path {}".format(path_so_far, path))
                break
            path_so_far += delimeter
        else:
            return node
        return default

    def _get(self, path, json="root", default=None):
        """
        Shorthand for self._get_element_by_path

        :param path: string path to object in json tree, segments separated with "." (dot)
        :param json: if it is "root", path_elements specify a path from the root, otherwise it's a path in the passed object.
        :param default:
        :return: the node at the given path, default otherwise.
        """
        path_elements = [int(x) if x.isdigit() else x
                         for x in path.split(".")]
        return self._get_element_by_path(*path_elements, default=default, json=json)
