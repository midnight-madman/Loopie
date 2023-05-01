import tempfile

from supabase import Client, create_client

from settings import SUPABASE_URL, SUPABASE_KEY


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_content_to_supabase(supabase: Client, content: str, bucket: str, destination: str) -> bool:
    if not content:
        return False

    with tempfile.NamedTemporaryFile() as file:
        file.write(content.encode())
        file.seek(0)

        res = supabase.storage.from_(bucket).upload(destination, file.name)
        print(f'uploaded content to supabase to {destination}. res: {res}')

    return True
