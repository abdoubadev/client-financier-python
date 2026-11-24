import pymysql
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD


def get_connection():
    """Établit une connexion à la base de données MariaDB."""
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=5,
        )
        return connection

    except pymysql.MySQLError as erreur:
        raise ConnectionError(
            f"Impossible de se connecter à MariaDB : {erreur}"
        ) from erreur
