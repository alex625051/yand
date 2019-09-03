import argparse
from wrapper_lib import process_args


def main():
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('--module', help='parser module name (e.g. foo_parser, w/o the .py extension).',
                            required=True)
    arg_parser.add_argument('--classname', help='parser class name (e.g. FooParser).', required=True)
    arg_parser.add_argument("-p", '--parse-only',
                            dest='parse_only',
                            action='store_true',
                            help="Bypass wrapping, i.e. assume the input is raw content.")
    arg_parser.set_defaults(parse_only=False)
    arg_parser.add_argument('--save-ids', action='store_true', default=False,
                              help="Save ConfigId and GroupId in output. Need for diff computation in multihost download")
    args = arg_parser.parse_args()

    process_args(args)


if __name__ == '__main__':
    main()
