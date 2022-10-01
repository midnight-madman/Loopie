from supabase import Client, create_client

from settings import SUPABASE_URL, SUPABASE_KEY


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)
