from glob import glob


def append_string_to_file(fname, string, newline=True):
    print(f'append {string} to file {fname}')

    if newline:
        string = f'{string}\n'

    with open(fname, 'a') as f:
        f.write(string)


def get_local_url_filenames():
    return glob('data/urls_*.csv')


def find_obj_based_on_key_value_in_list(l, key, value):
    for obj in l:
        if obj[key] == value:
            return obj
    return None


def chunkify(arr: list, n: int) -> list[list]:
    # split list into chunks of n items per chunk ... chunk
    return [arr[i:i + n] for i in range(0, len(arr), n)]


def contains_key_in_list(obj, key, arr):
    return any([value.lower() in obj[key].lower() for value in arr if obj.get(key)])
